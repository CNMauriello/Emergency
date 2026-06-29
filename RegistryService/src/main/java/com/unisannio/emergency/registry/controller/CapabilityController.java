package com.unisannio.emergency.registry.controller;

import org.springframework.web.bind.annotation.*;

import com.unisannio.emergency.registry.persistance.Capability;
import com.unisannio.emergency.registry.service.CapabilityService;

@RestController
@RequestMapping("/capabilities")
public class CapabilityController {

    private final CapabilityService service;

    public CapabilityController(CapabilityService service) {
        this.service = service;
    }

    // CREATE capability
    @PostMapping
    public Capability createCapability(@RequestBody Capability request) {
        return service.createCapability(request.getName());
    }
}