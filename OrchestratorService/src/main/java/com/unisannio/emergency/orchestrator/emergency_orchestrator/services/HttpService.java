package com.unisannio.emergency.orchestrator.emergency_orchestrator.services;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Service
public class HttpService {

    private final RestTemplate restTemplate;

    public HttpService(RestTemplateBuilder restTemplateBuilder) {
        // Configuriamo un timeout di default, per evitare blocchi infiniti
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    public HttpResponse executeRequest(String methodStr, String url, Map<String, String> headersMap, Object body) {
        HttpMethod method = HttpMethod.valueOf(methodStr.toUpperCase());

        HttpHeaders headers = new HttpHeaders();
        if (headersMap != null) {
            headersMap.forEach(headers::add);
        }

        HttpEntity<Object> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> responseEntity = restTemplate.exchange(url, method, requestEntity, Object.class);
            return new HttpResponse(responseEntity.getStatusCode().value(), responseEntity.getBody());
        } catch (HttpStatusCodeException e) {
            // Se l'errore è un 4xx o 5xx, gestiamo la response in modo che il worker possa vederla, 
            // oppure lanciamo l'eccezione se vogliamo che Camunda ritenti.
            throw new HttpException(e.getStatusCode().value(), e.getResponseBodyAsString(), e);
        } catch (Exception e) {
            // Errori di rete, timeout, DNS, ecc.
            throw new HttpException(0, e.getMessage(), e);
        }
    }

    public static class HttpResponse {
        private final int status;
        private final Object body;

        public HttpResponse(int status, Object body) {
            this.status = status;
            this.body = body;
        }

        public int getStatus() {
            return status;
        }

        public Object getBody() {
            return body;
        }
    }

    public static class HttpException extends RuntimeException {
        private final int status;
        private final String responseBody;

        public HttpException(int status, String responseBody, Throwable cause) {
            super("HTTP Error: " + status + " - " + responseBody, cause);
            this.status = status;
            this.responseBody = responseBody;
        }

        public int getStatus() {
            return status;
        }

        public String getResponseBody() {
            return responseBody;
        }
    }
}
