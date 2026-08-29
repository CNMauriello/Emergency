package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

public record EmergencyEvent(
        String event_id,
        String timestamp,
        String emergency_category,
        String severity,
        IncidentContext incident_context,
        GeoPoint coordinates,
        String address,
        double global_confidence
) {}
