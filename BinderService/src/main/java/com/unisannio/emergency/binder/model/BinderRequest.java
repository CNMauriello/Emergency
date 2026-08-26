package com.unisannio.emergency.binder.model;

public record BinderRequest(
        String requiredCapability,
        double latitude,
        double longitude
) {}