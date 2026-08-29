package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

import java.util.List;

public record ServiceResolution(
        List<EmergencyService> services
) {}