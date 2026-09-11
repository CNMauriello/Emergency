package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates.orchestrator;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.services.HttpService;
import io.camunda.client.api.response.ActivatedJob;
import io.camunda.client.annotation.JobWorker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class GenericHttpJobWorker {

    private static final Logger logger = LoggerFactory.getLogger(GenericHttpJobWorker.class);
    private static final String JOB_TYPE = "http-request";

    private final HttpService httpService;

    public GenericHttpJobWorker(HttpService httpService) {
        this.httpService = httpService;
    }

    @JobWorker(type = JOB_TYPE, autoComplete = true)
    public Map<String, Object> handleHttpRequest(ActivatedJob job) {
        logger.info("Handling http-request job for process instance {}", job.getProcessInstanceKey());

        Map<String, Object> variables = job.getVariablesAsMap();

        if (!variables.containsKey("http")) {
            throw new IllegalArgumentException("Missing 'http' configuration variable in job");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> httpConfig = (Map<String, Object>) variables.get("http");

        String method = (String) httpConfig.get("method");
        String url = (String) httpConfig.get("url");
        
        @SuppressWarnings("unchecked")
        Map<String, String> headers = (Map<String, String>) httpConfig.get("headers");
        Object body = httpConfig.get("body");

        if (method == null || url == null) {
            throw new IllegalArgumentException("'http.method' and 'http.url' are required");
        }

        logger.debug("Executing HTTP {} {}", method, url);

        try {
            HttpService.HttpResponse response = httpService.executeRequest(method, url, headers, body);
            
            logger.info("HTTP request completed with status {}", response.getStatus());

            return Map.of(
                    "httpResponse", Map.of(
                            "status", response.getStatus(),
                            "body", response.getBody() != null ? response.getBody() : Map.of()
                    )
            );
        } catch (HttpService.HttpException e) {
            logger.error("HTTP request failed: {}", e.getMessage(), e);
            // By throwing an exception, Camunda will decrement the retries and eventually create an incident
            // if all retries are exhausted. This allows proper error handling and retry mechanism.
            throw new RuntimeException("HTTP Job Failed: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error executing HTTP request", e);
            throw new RuntimeException("Unexpected HTTP Job Error: " + e.getMessage(), e);
        }
    }
}
