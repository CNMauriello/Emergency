package com.unisannio.emergency.registry.utility;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.unisannio.emergency.registry.model.EmergencyServiceDTO;
import com.unisannio.emergency.registry.persistance.Capability;
import com.unisannio.emergency.registry.persistance.EmergencyService;
import com.unisannio.emergency.registry.persistance.repository.CapabilityRepository;

@Component
public class EmergencyServiceMapper {

    private final CapabilityRepository capabilityRepository;

    // Iniettiamo il repository necessario per risolvere le capability
    public EmergencyServiceMapper(CapabilityRepository capabilityRepository) {
        this.capabilityRepository = capabilityRepository;
    }

    public EmergencyService toEntity(EmergencyServiceDTO dto) {
        EmergencyService entity = new EmergencyService();

        entity.setEndpoint(dto.endpoint());
        entity.setType(dto.type());
        entity.setStatus(dto.status());
        entity.setAvgLatency(dto.avgLatency());
        entity.setCurrentLoad(dto.currentLoad());
        entity.setLatitude(dto.latitude());
        entity.setLongitude(dto.longitude());

        Set<Capability> capabilities = dto.capabilities() == null
                ? Set.of()
                : dto.capabilities()
                .stream()
                .map(this::resolveCapability)
                .collect(Collectors.toSet());

        entity.setCapabilities(capabilities);

        return entity;
    }

    public EmergencyServiceDTO toDTO(EmergencyService s) {
        return new EmergencyServiceDTO(
                s.getEndpoint(),
                s.getType(),
                s.getStatus(),
                s.getAvgLatency(),
                s.getCurrentLoad(),
                s.getLatitude(),
                s.getLongitude(),
                s.getCapabilities()
                        .stream()
                        .map(Capability::getName) // Semplificato con method reference
                        .toList()
        );
    }

    private Capability resolveCapability(String capabilityName) {
        return capabilityRepository.findByName(capabilityName)
                .orElseThrow(() ->
                        new RuntimeException("Capability not found: " + capabilityName));
    }
}