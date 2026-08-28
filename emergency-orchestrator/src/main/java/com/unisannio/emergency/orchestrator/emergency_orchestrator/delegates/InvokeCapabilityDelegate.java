package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import java.util.Map;

@Component("invokeCapabilityDelegate")
public class InvokeCapabilityDelegate {

    private final RestClient restClient;

    // Costruttore modificato: rimosso RestClient.Builder
    public InvokeCapabilityDelegate() {
        this.restClient = RestClient.create();
    }

    @JobWorker(type = "invoke-capability", autoComplete = true)
    public Map<String, Object> execute(ActivatedJob job) {
        Map<String, Object> variables = job.getVariablesAsMap();
        String endpoint = (String) variables.get("currentCandidateEndpoint");

        @SuppressWarnings("unchecked")
        Map<String, Object> event = (Map<String, Object>) variables.get("event");

        if (endpoint == null) return Map.of("isCapabilityAvailable", false);

        try {
            // Inoltro della richiesta di ingaggio reale al servizio del territorio
            ResponseEntity<Void> response = restClient.post()
                    .uri(endpoint)
                    .body(event) // Viene trasmesso l'intero fascicolo
                    .retrieve()
                    .toBodilessEntity();

            if (response.getStatusCode().is2xxSuccessful()) {
                // Ingaggio confermato dal servizio
                return Map.of("isCapabilityAvailable", true);
            }

        } catch (RestClientResponseException e) {
            // Il servizio ha risposto con 503 (Unavailable) o 409 (Conflict)
            // L'istanza camunda valuterà false e richiamerà "Pop a capability provider"
            return Map.of("isCapabilityAvailable", false);

        } catch (Exception e) {
            // Errore di timeout o host irraggiungibile. Si passa al prossimo candidato
            return Map.of("isCapabilityAvailable", false);
        }

        return Map.of("isCapabilityAvailable", false);
    }
}