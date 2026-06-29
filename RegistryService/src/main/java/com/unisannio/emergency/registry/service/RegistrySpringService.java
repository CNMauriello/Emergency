package com.unisannio.emergency.registry.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unisannio.emergency.registry.model.ServiceInstanceDTO;
import com.unisannio.emergency.registry.persistance.Capability;
import com.unisannio.emergency.registry.persistance.ServiceInstance;
import com.unisannio.emergency.registry.persistance.repository.CapabilityRepository;
import com.unisannio.emergency.registry.persistance.repository.ServiceInstanceRepository;

@Service
public class RegistrySpringService {

    private final ServiceInstanceRepository repository;
    private final CapabilityRepository capabilityRepository;

    public RegistrySpringService(ServiceInstanceRepository repository,
                                 CapabilityRepository capabilityRepository) {
        this.repository = repository;
        this.capabilityRepository = capabilityRepository;
    }

    @Transactional(readOnly = true)
    public List<ServiceInstanceDTO> getServiceByCapability(String name) {
        return repository.findDistinctByCapabilities_Name(name)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public ServiceInstanceDTO createService(ServiceInstance serviceInstance) {
        System.out.println("CREATE SERVICE");
        if (serviceInstance.getCapabilities() != null) {

            Set<Capability> resolved = serviceInstance.getCapabilities()
                    .stream()
                    .map(c -> capabilityRepository.findByName(c.getName())
                            .orElseThrow(() ->
                                    new RuntimeException("Capability not found: " + c.getName())))
                    .collect(Collectors.toSet());

            serviceInstance.setCapabilities(resolved);
        }

        ServiceInstance saved = repository.save(serviceInstance);

        return toDTO(saved);
    }

    private ServiceInstanceDTO toDTO(ServiceInstance s) {
        return new ServiceInstanceDTO(
                s.getId(),
                s.getEndpoint(),
                s.getType().name(),
                s.getAvgLatency(),
                s.getCurrentLoad(),
                s.getLatitude(),
                s.getLongitude(),
                s.getCapabilities()
                        .stream()
                        .map(Capability::getName)
                        .toList()
        );
    }
}