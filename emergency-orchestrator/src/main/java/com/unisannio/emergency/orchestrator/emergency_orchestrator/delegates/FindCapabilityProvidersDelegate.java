package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component("findCapabilityProvidersDelegate")
public class FindCapabilityProvidersDelegate implements JavaDelegate {

    private final RestClient restClient;
    
    // FIX 2: Attenzione all'URL se stai eseguendo il run da IntelliJ e non da Docker!
    // Se "binder-service" non è nel file /etc/hosts, usa "localhost" per il test locale.
    // Per la produzione su Docker usa invece:
    // String binderUrl = "http://binder-service:8080/api/binder/candidates";
    private final String binderUrl = "http://localhost:8081/api/binder/candidates";

    public FindCapabilityProvidersDelegate() {
        this.restClient = RestClient.create();
    }

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String requiredCapability = (String) execution.getVariable("requiredCapability");

        @SuppressWarnings("unchecked")
        Map<String, Object> event = (Map<String, Object>) execution.getVariable("event");

        // FIX 1: Utilizzo di HashMap invece di Map.of() per tollerare valori null
        Map<String, Object> binderRequest = new HashMap<>();
        binderRequest.put("requiredCapability", requiredCapability);

        if (event != null) {
            binderRequest.put("latitude", event.get("latitude"));
            binderRequest.put("longitude", event.get("longitude"));
        }

        List<Map<String, Object>> sortedCandidates = new ArrayList<>();

        try {


            System.out.println("[FindCapabilityProviders] POST " + binderUrl);
            System.out.println("[FindCapabilityProviders] Request: " + binderRequest);

            List<String> response = restClient.post()
                    .uri(binderUrl)
                    .body(binderRequest)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<String>>() {});

            System.out.println("[FindCapabilityProviders] Binder response: " + response);

            if (response != null) {
                for (String endpoint : response) {
                    Map<String, Object> candidate = new HashMap<>();
                    candidate.put("endpoint", endpoint);
                    sortedCandidates.add(candidate);
                }
            }

            System.out.println("[FindCapabilityProviders] Workflow candidates: " + sortedCandidates);

        } catch (RestClientException e) {
            // FIX 3: Gestione dell'eccezione HTTP
            System.err.println("Errore di comunicazione con il Binder Service: " + e.getMessage());
            System.err.println("[FindCapabilityProviders] Request that failed: " + binderRequest);
            e.printStackTrace();
            // In caso di errore, sortedCandidates resta vuoto, permettendo al processo
            // di passare al ramo di fallback (isCapabilityAvailable = false) senza andare in crash.
        }

        // Memorizziamo la lista ordinata reale all'interno dell'istanza del workflow
        execution.setVariable("capabilityCandidates", sortedCandidates);
    }
}