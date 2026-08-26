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
        this.restClient = restClientBuilder.build();
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String requiredCapability = (String) execution.getVariable("requiredCapability");
        Map<String, Object> event = (Map<String, Object>) execution.getVariable("event");

        // Prepariamo il payload per il Binder
        Map<String, Object> binderRequest = Map.of(
                "requiredCapability", requiredCapability,
                "latitude", event.get("latitude"),
                "longitude", event.get("longitude")
        );

        // Chiamata HTTP REALE al Binder per ottenere la coda già filtrata e ordinata
        List<Map<String, Object>> sortedCandidates = restClient.post()
                .uri("http://binder-service:8080/api/binder/candidates")
                .body(binderRequest)
                .retrieve()
                .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

        if (sortedCandidates == null) {
            sortedCandidates = List.of();
        }

        // Memorizziamo la lista ordinata reale all'interno dell'istanza del workflow
        // per permettere al PopCapabilityProviderDelegate di estrarre i candidati
        execution.setVariable("capabilityCandidates", sortedCandidates);
    }
}