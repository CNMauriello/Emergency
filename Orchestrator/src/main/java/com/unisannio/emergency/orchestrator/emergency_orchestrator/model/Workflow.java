package com.unisannio.emergency.orchestrator.emergency_orchestrator.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Transient;

import java.util.Dictionary;
import java.util.List;
import java.util.Queue;

@Entity
@Table(name = "workflows")
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String processKey;

    @Column(nullable = false)
    private String eventType;

    @Column(nullable = false)
    private String severity;

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false)
    private Boolean enabled;

    @Transient
    Queue<Dictionary<Capability,Boolean>> services;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProcessKey() {
        return processKey;
    }

    public void setProcessKey(String processKey) {
        this.processKey = processKey;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public List<Capability> getCapabilities() {
        // Implement the logic to retrieve capabilities from the workflow
        return null; // Replace with actual implementation
    }
}
