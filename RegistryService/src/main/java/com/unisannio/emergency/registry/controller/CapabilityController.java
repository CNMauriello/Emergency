package com.unisannio.emergency.registry.controller;

import org.springframework.web.bind.annotation.*;

import com.unisannio.emergency.registry.model.CapabilityDTO;
import com.unisannio.emergency.registry.service.CapabilityService;

//@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/capabilities")
public class CapabilityController {

    private final CapabilityService service;

    public CapabilityController(CapabilityService service) {
        this.service = service;
    }

    // CREATE capability
    @PostMapping
    public CapabilityDTO createCapability(@RequestBody CapabilityDTO request) {
        return service.createCapability(request);
    }
}