package com.unisannio.emergency.registry.model;

public record ServiceUpdateResponseDTO(
        Long id,
        ServiceStatus status,
        Double avgLatency,
        Double currentLoad
) {}
