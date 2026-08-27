package com.unisannio.emergency.binder.service;

import com.unisannio.emergency.binder.model.BinderRequest;
import com.unisannio.emergency.binder.model.EmergencyServiceDTO;
import com.unisannio.emergency.binder.model.GeoPoint;
import com.unisannio.emergency.binder.strategy.RankingStrategy;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BinderService {

    private final RestClient registryClient;
    private final RankingStrategy rankingStrategy;

    // Rimosso RestClient.Builder dai parametri
    public BinderService(RankingStrategy rankingStrategy) {
        // Costruzione diretta del RestClient
        this.registryClient = RestClient.builder()
                .baseUrl("http://localhost:8080") // URL del RegistryService
                .build();

        this.rankingStrategy = rankingStrategy;
    }

    public List<String> getSortedCandidates(BinderRequest request) {
        // 1. Chiamata di Discovery al Registro
        List<EmergencyServiceDTO> rawCandidates = registryClient.get()
                .uri("/api/services?capability={cap}", request.requiredCapability())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        if (rawCandidates == null || rawCandidates.isEmpty()) {
            return List.of();
        }

        // 2. Pre-filtraggio: manteniamo solo i servizi pienamente operativi (UP)
        List<EmergencyServiceDTO> availableCandidates = rawCandidates.stream()
                .filter(s -> "UP".equalsIgnoreCase(s.status()))
                .toList();

        // 3. Ordinamento tramite Sottosistema Gestione Risorse interno (RankingStrategy)
        GeoPoint emergencyLocation = new GeoPoint(request.latitude(), request.longitude());
        return rankingStrategy.sortCandidates(availableCandidates, emergencyLocation)
                .stream()
                .map(EmergencyServiceDTO::getEndpoint)
                .collect(Collectors.toList());
    }
}