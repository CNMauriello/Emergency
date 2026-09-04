package com.spendy.operator.DTO;

import java.util.List;

public class EscalationCreationRequest {
    private String ticketId;
    private String eventId;
    private String capability;
    private List<String> failedEndpoints;

    public EscalationCreationRequest() {
    }

    public EscalationCreationRequest(String ticketId, String eventId, String capability, List<String> failedEndpoints) {
        this.ticketId = ticketId;
        this.eventId = eventId;
        this.capability = capability;
        this.failedEndpoints = failedEndpoints;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getCapability() {
        return capability;
    }

    public void setCapability(String capability) {
        this.capability = capability;
    }

    public List<String> getFailedEndpoints() {
        return failedEndpoints;
    }

    public void setFailedEndpoints(List<String> failedEndpoints) {
        this.failedEndpoints = failedEndpoints;
    }
}
