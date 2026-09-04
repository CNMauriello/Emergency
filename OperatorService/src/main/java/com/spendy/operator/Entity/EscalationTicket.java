package com.spendy.operator.Entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "escalation_tickets")
public class EscalationTicket {

    @Id
    @Column(name = "ticket_id", nullable = false)
    private String ticketId;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "capability", nullable = false)
    private String capability;

    @ElementCollection
    @CollectionTable(name = "ticket_failed_endpoints", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "endpoint")
    private List<String> failedEndpoints;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TicketStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    public EscalationTicket() {
    }

    public EscalationTicket(String ticketId, String eventId, String capability, List<String> failedEndpoints, TicketStatus status) {
        this.ticketId = ticketId;
        this.eventId = eventId;
        this.capability = capability;
        this.failedEndpoints = failedEndpoints;
        this.status = status;
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

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}
