package com.unisannio.emergency.registry.controller;

import java.util.List;

import com.unisannio.emergency.registry.model.ServiceUpdateRequestDTO;
import com.unisannio.emergency.registry.model.ServiceUpdateResponseDTO;
import jakarta.websocket.server.PathParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PatchMapping("/{id}")
    public ResponseEntity<ServiceUpdateResponseDTO> updateServiceMetrics(
            @PathVariable("id") Long id,
            @RequestBody ServiceUpdateRequestDTO request) {

        ServiceUpdateResponseDTO response = service.updateServiceMetrics(id, request);
        return ResponseEntity.ok(response);
    }
}

//GET /services?capability=fire-alert