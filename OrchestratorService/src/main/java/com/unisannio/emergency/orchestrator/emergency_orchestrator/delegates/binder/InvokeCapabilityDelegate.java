package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates.binder;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import io.camunda.client.api.worker.JobClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.List;

@Component("invokeCapabilityDelegate")
public class InvokeCapabilityDelegate {

    private static final Logger logger = LoggerFactory.getLogger(InvokeCapabilityDelegate.class);
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Value("${operator.escalations.url}")
    private String operatorEscalationsUrl;

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
            String capability = (String) variables.get("requiredCapability");

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
                        .uri(operatorEscalationsUrl)
                        .contentType(MediaType.APPLICATION_JSON)
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
            // Resolve localhost to gateway-service for internal Docker routing
            String resolvedEndpoint = endpoint;
            if (resolvedEndpoint != null && resolvedEndpoint.contains("localhost")) {
                resolvedEndpoint = resolvedEndpoint.replace("localhost", "gateway-service");
            }
            
            // Inoltro della richiesta di ingaggio reale al servizio del territorio
            ResponseEntity<Void> response = restClient.get()
                    .uri(resolvedEndpoint)
                    .retrieve()
                    .toBodilessEntity();

            logger.info("Chiamata a {} completata. Codice risposta: {}", endpoint, response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful()) {
                // Ingaggio confermato dal servizio
                client.newCompleteCommand(job.getKey())
                        .variables(Map.of("isCapabilityAvailable", true, "failedEndpoints", failedEndpoints))
                        .send().join();
                return;
            }

        } catch (RestClientResponseException e) {
            logger.warn("Il servizio all'endpoint {} ha risposto con errore HTTP: {} - {}", endpoint, e.getStatusCode(), e.getMessage());
            // Il servizio ha risposto con 503 (Unavailable) o 409 (Conflict)
            failedEndpoints.add(endpoint);
            client.newCompleteCommand(job.getKey())
                    .variables(Map.of("isCapabilityAvailable", false, "failedEndpoints", failedEndpoints))
                    .send().join();
            return;
        } catch (Exception e) {
            logger.error("Errore di rete o host irraggiungibile per l'endpoint {}: {}", endpoint, e.getMessage());
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