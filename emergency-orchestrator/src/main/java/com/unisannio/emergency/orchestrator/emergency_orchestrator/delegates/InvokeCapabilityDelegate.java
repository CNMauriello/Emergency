package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import java.util.Map;

@Component("invokeCapabilityDelegate")
public class InvokeCapabilityDelegate implements JavaDelegate {

    private final RestClient restClient;

    // Costruttore modificato: rimosso RestClient.Builder
    public InvokeCapabilityDelegate() {
        this.restClient = RestClient.create();
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String endpoint = (String) execution.getVariable("currentCandidateEndpoint");

        @SuppressWarnings("unchecked")
        Map<String, Object> event = (Map<String, Object>) execution.getVariable("event");

        if (endpoint == null) return;

        try {
            // Inoltro della richiesta di ingaggio reale al servizio del territorio
            ResponseEntity<Void> response = restClient.post()
                    .uri(endpoint)
                    .body(event) // Viene trasmesso l'intero fascicolo
                    .retrieve()
                    .toBodilessEntity();

            if (response.getStatusCode().is2xxSuccessful()) {
                // Ingaggio confermato dal servizio
                execution.setVariable("isCapabilityAvailable", true);
            }

        } catch (RestClientResponseException e) {
            // Il servizio ha risposto con 503 (Unavailable) o 409 (Conflict)
            // L'istanza camunda valuterà false e richiamerà "Pop a capability provider"
            execution.setVariable("isCapabilityAvailable", false);

        } catch (Exception e) {
            // Errore di timeout o host irraggiungibile. Si passa al prossimo candidato
            execution.setVariable("isCapabilityAvailable", false);
        }
    }
}