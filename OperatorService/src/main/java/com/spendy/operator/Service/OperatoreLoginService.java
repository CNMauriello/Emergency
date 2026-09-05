package com.spendy.operator.Service;

import com.spendy.operator.Entity.Operatore;
import com.spendy.operator.Entity.StatoEnum;
import com.spendy.operator.Repository.OperatoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@Service
public class OperatoreLoginService {

    @Autowired
    private WebClient webClient;

    @Autowired
    private OperatoreRepository operatoreRepository;

    private static final String AUTH_SERVICE_URL = "http://localhost:8088/api/auth"; // AuthMicroService

    /**
     * Intercetta username e password, li inoltra via WebClient all'AuthMicroService.
     * In caso di 200 OK recupera JWT e dati utente, poi cerca l'operatore locale e aggiorna lo stato.
     */
    public Map<String, Object> login(String username, String password) {
        try {
            // 1. Chiamata di login verso AuthMicroService
            Map<String, String> authResponse = webClient.post()
                    .uri(AUTH_SERVICE_URL + "/login")
                    .bodyValue(Map.of("username", username, "password", password))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (authResponse == null || !authResponse.containsKey("accessToken")) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid response from Auth service");
            }

            String accessToken = authResponse.get("accessToken");
            String refreshToken = authResponse.get("refreshToken");

            // 2. Chiamata per recuperare il profile (che ora contiene id_user)
            Map<String, String> profileResponse = webClient.get()
                    .uri(AUTH_SERVICE_URL + "/profile")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (profileResponse == null || !profileResponse.containsKey("id_user")) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot retrieve user id");
            }

            Long authUserId = Long.parseLong(profileResponse.get("id_user"));

            // 3. Cerchiamo l'operatore locale e aggiorniamo lo stato
            Optional<Operatore> opOpt = operatoreRepository.findByAuthUserId(authUserId);
            if (opOpt.isPresent()) {
                Operatore operatore = opOpt.get();
                operatore.setStato(StatoEnum.Online);
                operatoreRepository.save(operatore);

                return Map.of(
                        "accessToken", accessToken,
                        "refreshToken", refreshToken,
                        "operatore", operatore
                );
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Operatore not found for this user");
            }

        } catch (WebClientResponseException e) {
            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
            }
            throw new ResponseStatusException(e.getStatusCode(), e.getMessage());
        }
    }
}
