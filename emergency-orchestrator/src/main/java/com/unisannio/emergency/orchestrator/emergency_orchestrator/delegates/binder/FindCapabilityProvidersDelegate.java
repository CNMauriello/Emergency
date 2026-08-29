package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates.binder;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component("findCapabilityProvidersDelegate")
public class FindCapabilityProvidersDelegate {

    private final RestClient restClient;

    private final String binderUrl =
            "http://localhost:8082/api/binder/candidates";

    public FindCapabilityProvidersDelegate() {
        this.restClient = RestClient.create();
    }

    @JobWorker(type = "find-capability-providers", autoComplete = true)
    public Map<String, Object> execute(ActivatedJob job) {

        Map<String, Object> variables = job.getVariablesAsMap();

        String requiredCapability =
                (String) variables.get("requiredCapability");

        // Recupera le coordinate dal JSON dell'emergenza
        @SuppressWarnings("unchecked")
        Map<String, Object> coordinates =
                (Map<String, Object>) variables.get("coordinates");

        if (coordinates == null) {
            throw new IllegalStateException(
                    "Variabile 'coordinates' assente dal processo"
            );
        }

        Object latitude = coordinates.get("latitude");
        Object longitude = coordinates.get("longitude");

        if (latitude == null || longitude == null) {
            throw new IllegalStateException(
                    "Latitude/longitude mancanti nelle coordinate dell'emergenza"
            );
        }

        // Costruisce la richiesta per il Binder
        Map<String, Object> binderRequest = new HashMap<>();
        binderRequest.put("requiredCapability", requiredCapability);
        binderRequest.put("latitude", latitude);
        binderRequest.put("longitude", longitude);

        List<Map<String, Object>> sortedCandidates = new ArrayList<>();

        try {

            System.out.println(
                    "[FindCapabilityProviders] POST " + binderUrl
            );

            System.out.println(
                    "[FindCapabilityProviders] Request: " + binderRequest
            );

            List<String> response = restClient.post()
                    .uri(binderUrl)
                    .body(binderRequest)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<String>>() {});

            System.out.println(
                    "[FindCapabilityProviders] Binder response: " + response
            );

            if (response != null) {
                for (String endpoint : response) {
                    Map<String, Object> candidate = new HashMap<>();
                    candidate.put("endpoint", endpoint);
                    sortedCandidates.add(candidate);
                }
            }

            System.out.println(
                    "[FindCapabilityProviders] Variables: " + variables
            );

            System.out.println(
                    "[FindCapabilityProviders] Coordinates: " + coordinates
            );

            System.out.println(
                    "[FindCapabilityProviders] Binder request: " + binderRequest
            );

            System.out.println(
                    "[FindCapabilityProviders] Workflow candidates: "
                            + sortedCandidates
            );

        } catch (RestClientException e) {

            System.err.println(
                    "Errore di comunicazione con il Binder Service: "
                            + e.getMessage()
            );

            System.err.println(
                    "[FindCapabilityProviders] Request that failed: "
                            + binderRequest
            );

            e.printStackTrace();
        }

        return Map.of(
                "capabilityCandidates",
                sortedCandidates
        );
    }
}
