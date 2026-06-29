package com.unisannio.emergency.registry.service;

import org.springframework.stereotype.Service;

import com.unisannio.emergency.registry.model.CapabilityDTO;
import com.unisannio.emergency.registry.persistance.Capability;
import com.unisannio.emergency.registry.persistance.repository.CapabilityRepository;

@Service
public class CapabilityService {

    private final CapabilityRepository repository;

    public CapabilityService(CapabilityRepository repository) {
        this.repository = repository;
    }

    public CapabilityDTO createCapability(CapabilityDTO request) {
        Capability capability = new Capability();
        capability.setName(request.name());

        Capability saved = repository.save(capability);
        return new CapabilityDTO(saved.getName());
    }
}