package com.unisannio.emergency.registry.model;

public record ServiceUpdateRequestDTO(
        ServiceStatus status,
        Double avgLatency,
        Double currentLoad
) {}