package com.unisannio.emergency.registry.model;

import java.util.List;

public record EmergencyServiceDTO(
    String endpoint,
    ServiceType type,
    ServiceStatus status,
    double avgLatency,
    double currentLoad,
    double latitude,
    double longitude,
    List<String> capabilities
) {}