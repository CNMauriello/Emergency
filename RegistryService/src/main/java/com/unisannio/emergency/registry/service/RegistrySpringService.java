package com.unisannio.emergency.registry.service;

import java.util.List;

import com.unisannio.emergency.registry.model.ServiceUpdateRequestDTO;
import com.unisannio.emergency.registry.model.ServiceUpdateResponseDTO;
import com.unisannio.emergency.registry.utility.HeartbeatManager;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unisannio.emergency.registry.model.EmergencyServiceDTO;
import com.unisannio.emergency.registry.persistance.EmergencyService;
import com.unisannio.emergency.registry.persistance.repository.EmergencyServiceRepository;
import com.unisannio.emergency.registry.utility.EmergencyServiceMapper;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegistrySpringService {

    private final EmergencyServiceRepository repository;
    private final EmergencyServiceMapper mapper;
    private final HeartbeatManager heartbeatManager;


    // Iniettiamo il repository e il nuovo mapper

    public RegistrySpringService(EmergencyServiceRepository repository,
                                 EmergencyServiceMapper mapper, HeartbeatManager heartbeatManager) {
        this.repository = repository;
        this.mapper = mapper;
        this.heartbeatManager = heartbeatManager;
    }
    
    // =========================
    // QUERY - TUTTI I SERVIZI
    // =========================
    @Transactional(readOnly = true)
    public List<EmergencyServiceDTO> getAllServices() {
        return repository.findAll()
                .stream()
                .map(mapper::toDTO)
                .toList();
    }

    // =========================
    // QUERY - SERVIZI PER CAPABILITY
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

    // =========================
    // DELETE
    // =========================
    @Transactional
    public void deleteService(Long id) {
        if (!repository.existsById(id)) {
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Servizio non trovato"
        );
    }

    repository.deleteById(id);
}

    // =========================
    // UPDATE METRICS & HEARTBEAT
    // =========================
    @Transactional
    public ServiceUpdateResponseDTO updateServiceMetrics(Long id, ServiceUpdateRequestDTO request) {
        // 1. Recupero l'entità (lancia 404 se non trovata)
        EmergencyService entity = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Servizio non trovato"));

        // 2. Aggiorno solo i campi DB previsti
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (request.avgLatency() != null) {
            entity.setAvgLatency(request.avgLatency());
        }
        if (request.currentLoad() != null) {
            entity.setCurrentLoad(request.currentLoad());
        }

        // 3. Salvo nel DB le metriche aggiornate
        repository.save(entity);

        // 4. Aggiorno l'heartbeat IN MEMORIA, senza toccare l'entità o il DB
        heartbeatManager.updateHeartbeat(id);

        return new ServiceUpdateResponseDTO(
                entity.getId(),
                entity.getStatus(),
                entity.getAvgLatency(),
                entity.getCurrentLoad()
        );
    }
}