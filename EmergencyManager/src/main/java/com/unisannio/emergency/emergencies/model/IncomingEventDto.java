package com.unisannio.emergency.emergencies.model;

import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty;

public class IncomingEventDto {

    @JsonProperty("event_id")
    private String eventId;

    private LocalDateTime timestamp;

    @JsonProperty("emergency_category")
    private String emergencyCategory;

    private String severity;

    @JsonProperty("global_confidence")
    private double globalConfidence;

    private String address;
    private Coordinates coordinates;

    @JsonProperty("incident_context")
    private IncidentContext incidentContext;

    public IncomingEventDto() {}

    // --- GETTER E SETTER ---

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getEmergencyCategory() { return emergencyCategory; }
    public void setEmergencyCategory(String emergencyCategory) { this.emergencyCategory = emergencyCategory; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public double getGlobalConfidence() { return globalConfidence; }
    public void setGlobalConfidence(double globalConfidence) { this.globalConfidence = globalConfidence; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Coordinates getCoordinates() { return coordinates; }
    public void setCoordinates(Coordinates coordinates) { this.coordinates = coordinates; }

    public IncidentContext getIncidentContext() { return incidentContext; }
    public void setIncidentContext(IncidentContext incidentContext) { this.incidentContext = incidentContext; }

    // --- CLASSI ANNIDATE ---

    public static class Coordinates {
        private double latitude;
        private double longitude;

        public Coordinates() {}

        public double getLatitude() { return latitude; }
        public void setLatitude(double latitude) { this.latitude = latitude; }

        public double getLongitude() { return longitude; }
        public void setLongitude(double longitude) { this.longitude = longitude; }
    }

    public static class IncidentContext {
        @JsonProperty("has_injured")
        private boolean hasInjured;

        @JsonProperty("has_unconscious")
        private boolean hasUnconscious;

        @JsonProperty("has_trapped")
        private boolean hasTrapped;

        @JsonProperty("has_special_vehicle_involved")
        private boolean hasSpecialVehicleInvolved;

        public IncidentContext() {}

        public boolean isHasInjured() { return hasInjured; }
        public void setHasInjured(boolean hasInjured) { this.hasInjured = hasInjured; }

        public boolean isHasUnconscious() { return hasUnconscious; }
        public void setHasUnconscious(boolean hasUnconscious) { this.hasUnconscious = hasUnconscious; }

        public boolean isHasTrapped() { return hasTrapped; }
        public void setHasTrapped(boolean hasTrapped) { this.hasTrapped = hasTrapped; }

        public boolean isHasSpecialVehicleInvolved() { return hasSpecialVehicleInvolved; }
        public void setHasSpecialVehicleInvolved(boolean hasSpecialVehicleInvolved) { this.hasSpecialVehicleInvolved = hasSpecialVehicleInvolved; }
    }
}