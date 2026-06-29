package com.unisannio.emergency.registry.persistance.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.unisannio.emergency.registry.persistance.Capability;

import java.util.Optional;

public interface CapabilityRepository extends JpaRepository<Capability, Long> {
    Optional<Capability> findByName(String name);
}