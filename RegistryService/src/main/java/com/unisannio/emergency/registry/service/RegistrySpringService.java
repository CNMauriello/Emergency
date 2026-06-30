package com.unisannio.emergency.registry.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unisannio.emergency.registry.model.EmergencyServiceDTO;
import com.unisannio.emergency.registry.persistance.EmergencyService;
import com.unisannio.emergency.registry.persistance.repository.EmergencyServiceRepository;
import com.unisannio.emergency.registry.utility.EmergencyServiceMapper;

@Service
public class RegistrySpringService {

    private final EmergencyServiceRepository repository;
    private final EmergencyServiceMapper mapper;

    // Iniettiamo il repository e il nuovo mapper

    public RegistrySpringService(EmergencyServiceRepository repository,
                                 EmergencyServiceMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    // =========================
    // QUERY
    // =========================
    @Transactional(readOnly = true)
    public List<EmergencyServiceDTO> getServiceByCapability(String name) {
        return repository.findDistinctByCapabilities_Name(name)
                .stream()
                .map(mapper::toDTO) // Uso della method reference col nuovo mapper
                .toList();
    }

    // =========================
    // CREATE
    // =========================
    @Transactional
    public EmergencyServiceDTO createService(EmergencyServiceDTO request) {

        EmergencyService entity = mapper.toEntity(request);
        EmergencyService saved = repository.save(entity);

        System.out.println("ID salvato = " + saved.getId());

        return mapper.toDTO(saved);
    }
}