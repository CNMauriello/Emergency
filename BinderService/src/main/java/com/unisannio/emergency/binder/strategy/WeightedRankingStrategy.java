package com.unisannio.emergency.binder.strategy;

import com.unisannio.emergency.binder.model.EmergencyServiceDTO;
import com.unisannio.emergency.binder.model.GeoPoint;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Component
public class WeightedRankingStrategy implements RankingStrategy {

    // Pesi per calibrare l'importanza dei parametri.
    // In un ambiente di produzione, questi valori andrebbero letti da application.properties
    private static final double WEIGHT_DISTANCE = 0.5;
    private static final double WEIGHT_LATENCY = 0.2;
    private static final double WEIGHT_LOAD = 0.3;

    @Override
    public List<EmergencyServiceDTO> sortCandidates(List<EmergencyServiceDTO> candidates, GeoPoint emergencyLocation) {
        // Ordina la lista in ordine crescente in base allo score calcolato
        return candidates.stream()
                .sorted(Comparator.comparingDouble(service -> calculateScore(service, emergencyLocation)))
                .toList();
    }

    private double calculateScore(EmergencyServiceDTO service, GeoPoint emergencyLocation) {
        // 1. Distanza dall'epicentro (in km), sfruttando il metodo Haversine del record GeoPoint
        double distanceKm = GeoPoint.getDistance(service.getPosition(), emergencyLocation);

        // 2. Latenza media (in millisecondi). Mettiamo un fallback a 0.0 per robustezza in caso di null
        double latency = service.avgLatency() != null ? service.avgLatency() : 0.0;

        // 3. Carico attuale. Assumendo che il registro restituisca un valore da 0.0 a 1.0, lo portiamo su scala 100
        double loadFactor = service.currentLoad() != null ? (service.currentLoad() * 100.0) : 0.0;

        // Calcolo del costo totale ponderato
        return (WEIGHT_DISTANCE * distanceKm) + (WEIGHT_LATENCY * latency) + (WEIGHT_LOAD * loadFactor);
    }
}