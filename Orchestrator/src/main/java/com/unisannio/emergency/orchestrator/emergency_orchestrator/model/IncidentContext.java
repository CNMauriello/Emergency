package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

public record IncidentContext(
        boolean has_injured,
        boolean has_unconscious,
        boolean has_trapped,
        boolean has_special_vehicle_involved
) {}
