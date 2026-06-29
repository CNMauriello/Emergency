package com.unisannio.emergency.registry.service;

import org.springframework.stereotype.Service;

import com.unisannio.emergency.registry.persistance.Capability;
import com.unisannio.emergency.registry.persistance.repository.CapabilityRepository;

@Service
public class CapabilityService {

    private final CapabilityRepository repository;

    public CapabilityService(CapabilityRepository repository) {
        this.repository = repository;
    }

    public Capability createCapability(String name) {
        Capability capability = new Capability();
        capability.setName(name);
        return repository.save(capability);
    }
}