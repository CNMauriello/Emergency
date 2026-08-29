package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

public record Capability(String capabilityName) {
    public Capability {
        //@TODO regex check for capability name *[a-zA-Z0-9]+_[a-zA-Z0-9]+*
    }
}
 
