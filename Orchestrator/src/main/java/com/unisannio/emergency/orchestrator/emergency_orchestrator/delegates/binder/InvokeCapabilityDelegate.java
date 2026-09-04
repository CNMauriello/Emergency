package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates.binder;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import io.camunda.client.api.worker.JobClient;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.Map;
import java.util.List;

@Component("invokeCapabilityDelegate")
public class InvokeCapabilityDelegate {

    private final RestClient restClient;

    public InvokeCapabilityDelegate() {
        this.restClient = RestClient.create();
    }

    @JobWorker(type = "invoke-capability", autoComplete = false)
    public void execute(JobClient client, ActivatedJob job) {
        Map<String, Object> variables = job.getVariablesAsMap();
        String endpoint = (String) variables.get("currentCandidateEndpoint");

        @SuppressWarnings("unchecked")
        Map<String, Object> event = (Map<String, Object>) variables.get("event");

        @SuppressWarnings("unchecked")
        List<String> originalFailedEndpoints = (List<String>) variables.get("failedEndpoints");
        List<String> failedEndpoints = originalFailedEndpoints != null
                ? new java.util.ArrayList<>(originalFailedEndpoints)
                : new java.util.ArrayList<>();

        System.out.println("Lista di endpoint: " + failedEndpoints);

        if (endpoint == null || endpoint.isEmpty()) {
            // 1. Recupero variabili
            String eventId = (String) variables.get("event_id");
            String capability = (String) variables.get("capability");

            // 2. Costruzione del Payload (Escalation Ticket)
            Map<String, Object> escalationTicket = Map.of(
                    "ticketId", String.valueOf(job.getKey()),
                    "eventId", eventId != null ? eventId : "",
                    "capability", capability != null ? capability : "",
                    "failedEndpoints", failedEndpoints);

            // 3. Invocazione Backend-for-Frontend
            try {
                System.out.println("Invocazione Backend-for-Frontend per creazione ticket di escalation con ticketId: " + job.getKey());
                restClient.post()
                        .uri("http://localhost:8087/api/operators/escalations")
                        .body(escalationTicket)
                        .retrieve()
                        .toBodilessEntity();
            } catch (Exception e) {
                System.err.println("Errore di rete durante la creazione del ticket di escalation: " + e.getMessage());
            }

            // 5. Uscita IMMEDIATA dal metodo SENZA completare il Job! 
            // Camunda manterrà il job in stato attivo finché non arriverà la callback webhook.
            return;
        }

        try {
            // Inoltro della richiesta di ingaggio reale al servizio del territorio
            ResponseEntity<Void> response = restClient.post()
                    .uri(endpoint)
                    .body(event) // Viene trasmesso l'intero fascicolo
                    .retrieve()
                    .toBodilessEntity();

            if (response.getStatusCode().is2xxSuccessful()) {
                // Ingaggio confermato dal servizio
                client.newCompleteCommand(job.getKey())
                        .variables(Map.of("isCapabilityAvailable", true, "failedEndpoints", failedEndpoints))
                        .send().join();
                return;
            }

        } catch (RestClientResponseException e) {
            // Il servizio ha risposto con 503 (Unavailable) o 409 (Conflict)
            failedEndpoints.add(endpoint);
            client.newCompleteCommand(job.getKey())
                    .variables(Map.of("isCapabilityAvailable", false, "failedEndpoints", failedEndpoints))
                    .send().join();
            return;
        } catch (Exception e) {
            // Errore di timeout o host irraggiungibile. Si passa al prossimo candidato
            failedEndpoints.add(endpoint);
            client.newCompleteCommand(job.getKey())
                    .variables(Map.of("isCapabilityAvailable", false, "failedEndpoints", failedEndpoints))
                    .send().join();
            return;
        }

        failedEndpoints.add(endpoint);
        client.newCompleteCommand(job.getKey())
                .variables(Map.of("isCapabilityAvailable", false, "failedEndpoints", failedEndpoints))
                .send().join();
    }
}