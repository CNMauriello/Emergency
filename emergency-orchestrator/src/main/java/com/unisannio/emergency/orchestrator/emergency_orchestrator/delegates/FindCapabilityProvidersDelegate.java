package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;

@Component("findCapabilityProvidersDelegate")
public class FindCapabilityProvidersDelegate implements JavaDelegate {

    private final RestClient restClient;

    public FindCapabilityProvidersDelegate(RestClient.Builder restClientBuilder) {
        // Il RestClient viene costruito senza base url fisso per poter contattare microservizi diversi
        this.restClient = restClientBuilder.build();
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String requiredCapability = (String) execution.getVariable("requiredCapability");
        Map<String, Object> event = (Map<String, Object>) execution.getVariable("event");

        // 1. Chiamata HTTP REALE al Gestore Servizi per ottenere tutti gli endpoint che offrono la capability
        List<Map<String, Object>> rawCandidates = restClient.get()
                .uri("http://registry-service:8080/api/services?capability={cap}", requiredCapability)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

        if (rawCandidates == null || rawCandidates.isEmpty()) {
            execution.setVariable("capabilityCandidates", List.of());
            return;
        }

        // 2. Chiamata HTTP REALE al Sottosistema Gestione Risorse per ordinare i candidati
        // Viene passato l'epicentro dell'evento e la lista grezza
        Map<String, Object> sortingPayload = Map.of(
                "emergencyLatitude", event.get("latitude"),
                "emergencyLongitude", event.get("longitude"),
                "candidates", rawCandidates
        );

        List<Map<String, Object>> sortedCandidates = restClient.post()
                .uri("http://resource-manager:8080/api/resources/sort")
                .body(sortingPayload)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

        // 3. Memorizziamo la lista ordinata reale all'interno dell'istanza del workflow
        execution.setVariable("capabilityCandidates", sortedCandidates);
    }
}