package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

public record EmergencyEvent(
        String eventType,
        TriageLevel triageLevel
) {
    public String getAssociatedWorkflow() {
        return eventType + "_" + triageLevel.name();
    }

    private enum TriageLevel {
        RED, YELLOW, GREEN
    }

}

