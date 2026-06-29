package com.unisannio.emergency.registry.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.unisannio.emergency.registry.persistance.EmergencyService;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

//JPA “manuale” + JPQL (EntityManager)
@Service
public class RegistryQueryService {

    @PersistenceContext
    private EntityManager em;

    public RegistryQueryService() {}

    @Transactional(readOnly = true)
    public List<EmergencyService> getServiceByCapability(String capabilityName) {

    return em.createQuery(
        "SELECT DISTINCT si " +
        "FROM ServiceInstance si " +
        "JOIN si.capabilities c " +
        "WHERE c.name = :name",
        EmergencyService.class
    )
    .setParameter("name", capabilityName)
    .getResultList();
    }
}