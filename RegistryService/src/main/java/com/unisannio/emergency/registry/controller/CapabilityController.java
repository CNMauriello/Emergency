package com.unisannio.emergency.registry.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;

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

    
    @GetMapping
    public List<CapabilityDTO> getAllCapabilities() {
        return service.getAllCapabilities();
    }

    // CREATE capability
    @PostMapping
    public CapabilityDTO createCapability(@RequestBody CapabilityDTO request) {
        return service.createCapability(request);
    }
}