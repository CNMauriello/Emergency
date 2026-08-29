package com.unisannio.emergency.emergencies.model;

import java.util.List;

public class EmergencyResponseDto {

    private Long id;
    private String eventId;
    private String eventType;
    private String severity;
    private String status;
    private double latitude;
    private double longitude;
    private String workflowInstanceId;
    private List<String> history;

    // Costruttore vuoto necessario per la serializzazione JSON
    public EmergencyResponseDto() {
    }

    // --- GETTER E SETTER ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public String getWorkflowInstanceId() { return workflowInstanceId; }
    public void setWorkflowInstanceId(String workflowInstanceId) { this.workflowInstanceId = workflowInstanceId; }

    public List<String> getHistory() { return history; }
    public void setHistory(List<String> history) { this.history = history; }
}