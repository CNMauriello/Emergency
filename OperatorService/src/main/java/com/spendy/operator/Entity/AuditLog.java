package com.spendy.operator.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operatore_id", nullable = false)
    private Long operatoreId;

    @Column(name = "emergency_id", nullable = false)
    private Long emergencyId;

    @Column(name = "azione", nullable = false)
    private String azione;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public AuditLog() {
    }

    public AuditLog(Long operatoreId, Long emergencyId, String azione) {
        this.operatoreId = operatoreId;
        this.emergencyId = emergencyId;
        this.azione = azione;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOperatoreId() {
        return operatoreId;
    }

    public void setOperatoreId(Long operatoreId) {
        this.operatoreId = operatoreId;
    }

    public Long getEmergencyId() {
        return emergencyId;
    }

    public void setEmergencyId(Long emergencyId) {
        this.emergencyId = emergencyId;
    }

    public String getAzione() {
        return azione;
    }

    public void setAzione(String azione) {
        this.azione = azione;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
