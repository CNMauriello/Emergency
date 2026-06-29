package com.unisannio.emergency.registry.persistance;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;

@Entity
public class Capability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String name;

    @ManyToMany(mappedBy = "capabilities")
    private Set<ServiceInstance> serviceInstances = new HashSet<>();

    // getter e setter (IMPORTANTI)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<ServiceInstance> getServiceInstances() {
        return serviceInstances;
    }

    public void setServiceInstances(Set<ServiceInstance> serviceInstances) {
        this.serviceInstances = serviceInstances;
    }
}