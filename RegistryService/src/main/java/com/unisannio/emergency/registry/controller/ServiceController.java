package com.unisannio.emergency.registry.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import com.unisannio.emergency.registry.model.ServiceInstanceDTO;
import com.unisannio.emergency.registry.persistance.ServiceInstance;
import com.unisannio.emergency.registry.service.RegistrySpringService;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private final RegistrySpringService service;

    public ServiceController(RegistrySpringService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceInstanceDTO> getByCapability(
        @RequestParam("capability") String capability) {
    return service.getServiceByCapability(capability);
    }

    @PostMapping
    public ServiceInstanceDTO createService(@RequestBody ServiceInstance serviceInstance) {
        return service.createService(serviceInstance);
    }

    
}

//GET /services?capability=fire-alert