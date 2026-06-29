package com.unisannio.emergency.registry.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.unisannio.emergency.registry.model.EmergencyServiceDTO;
import com.unisannio.emergency.registry.service.RegistrySpringService;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private final RegistrySpringService service;

    public ServiceController(RegistrySpringService service) {
        this.service = service;
    }

    @GetMapping
    public List<EmergencyServiceDTO> getByCapability(
        @RequestParam("capability") String capability) {
    return service.getServiceByCapability(capability);
    }

    @PostMapping
    public EmergencyServiceDTO createService(@RequestBody EmergencyServiceDTO request) {
        return service.createService(request);
    }

    
}

//GET /services?capability=fire-alert