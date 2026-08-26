package com.unisannio.emergency.binder.model;

public record EmergencyServiceDTO(
        Long id,
        String endpoint,
        String type,
        String status, // Assumerà i valori "UP", "DOWN", "BUSY"
        Double avgLatency,
        Double currentLoad,
        Double latitude,
        Double longitude
) {
    // Metodo di supporto per ottenere comodamente le coordinate per il calcolo della distanza
    public GeoPoint getPosition() {
        return new GeoPoint(latitude, longitude);
    }

    public String getEndpoint() {
        return endpoint;
    }
}