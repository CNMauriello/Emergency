package com.unisannio.emergency.orchestrator.emergency_orchestrator.controller;

import io.camunda.client.CamundaClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/escalations")
public class JobCompletionController {

    private final CamundaClient camundaClient;

    public JobCompletionController(CamundaClient camundaClient) {
        this.camundaClient = camundaClient;
    }

    @PostMapping("/{ticketId}/resolve")
    public ResponseEntity<Void> resolveEscalation(@PathVariable String ticketId, @RequestBody Map<String, Object> requestBody) {
        Long jobKey;
        try {
            jobKey = Long.parseLong(ticketId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }

        // Recuperiamo la strategia (es. Broadcast, ForzeArmate, ecc.) 
        // e notifichiamo a Camunda che il job bloccato ora ha successo ed è risolto!
        String strategy = "";
        if (requestBody != null && requestBody.containsKey("resolutionStrategy")) {
            strategy = requestBody.get("resolutionStrategy").toString();
        }

        System.out.println("Risoluzione asincrona del JobKey " + jobKey + " (TicketID: " + ticketId + ") con strategia: " + strategy);

        camundaClient.newCompleteCommand(jobKey)
                .variables(Map.of(
                        "isCapabilityAvailable", true, 
                        "escalationResolved", true,
                        "resolutionStrategy", strategy
                ))
                .send()
                .join();

        return ResponseEntity.ok().build();
    }
}
