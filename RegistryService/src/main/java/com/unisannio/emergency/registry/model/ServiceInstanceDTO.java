package com.unisannio.emergency.registry.model;

import java.util.List;

public record ServiceInstanceDTO(
        long id,
        String endpoint,
        String type,
        double avgLatency,
        double currentLoad,
        double latitude,
        double longitude,
        List<String> capabilities
) {}