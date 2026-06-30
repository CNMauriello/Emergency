package com.unisannio.emergency.registry.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unisannio.emergency.registry.model.EmergencyServiceDTO;
import com.unisannio.emergency.registry.persistance.Capability;
import com.unisannio.emergency.registry.persistance.EmergencyService;
import com.unisannio.emergency.registry.persistance.repository.CapabilityRepository;
import com.unisannio.emergency.registry.persistance.repository.EmergencyServiceRepository;

@Service
public class RegistrySpringService {

    private final EmergencyServiceRepository repository;
    private final CapabilityRepository capabilityRepository;

    public RegistrySpringService(EmergencyServiceRepository repository,
                                 CapabilityRepository capabilityRepository) {
        this.repository = repository;
        this.capabilityRepository = capabilityRepository;
    }

    // =========================
    // QUERY
    // =========================
    @Transactional(readOnly = true)
    public List<EmergencyServiceDTO> getServiceByCapability(String name) {
        return repository.findDistinctByCapabilities_Name(name)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    // =========================
    // CREATE
    // =========================
    @Transactional
    public EmergencyServiceDTO createService(EmergencyServiceDTO request) {

        EmergencyService entity = toEntity(request);
        EmergencyService saved = repository.save(entity);
        System.out.println("ID salvato = " + saved.getId());
        return toDTO(saved);
    }

    // =========================
    // MAPPER DTO -> ENTITY
    // =========================
    private EmergencyService toEntity(EmergencyServiceDTO dto) {

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

    // =========================
    // MAPPER ENTITY -> DTO
    // =========================
    private EmergencyServiceDTO toDTO(EmergencyService s) {
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
                        .map(cap -> cap.getName())
                        .toList()
        );
    }

    // =========================
    // CAPABILITY RESOLUTION
    // =========================
    private Capability resolveCapability(String capabilityName) {
        return capabilityRepository.findByName(capabilityName)
                .orElseThrow(() ->
                        new RuntimeException("Capability not found: " + capabilityName));
    }
}