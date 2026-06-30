package com.unisannio.emergency.registry.service;

import com.unisannio.emergency.registry.persistance.EmergencyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Service
public class RegistryQueryService {

    @PersistenceContext
    private EntityManager em;

    public RegistryQueryService() {}

    @Transactional
    public List<EmergencyService> getEmergencyServicesByCapability() {
        // Ho ipotizzato una named query o una query standard in base all'entità
        return em.createQuery("SELECT s FROM EmergencyService s", EmergencyService.class)
                .getResultList();
    }

    @Transactional
    public EmergencyService registerEmergencyService() {
        EmergencyService EmergencyService = new EmergencyService();

        // Qui andresti a popolare i dati dell'istanza
        // EmergencyService.setCapability(...);

        em.persist(EmergencyService);
        System.out.println("registerEmergencyService");

        return EmergencyService;
    }
}
