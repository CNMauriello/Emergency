package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

import java.util.Set;

public record EmergencyService(    
    String id,
    ServiceType type, 
    Set<Capability> capabilities,
    String endpoint, 
    ServiceStatus status, 
    double avgLatency, 
    double currentLoad,
    GeoPoint position
) {}
