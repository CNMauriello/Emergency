package com.spendy.operator.Controller;

import com.spendy.operator.Entity.AuditLog;
import com.spendy.operator.Repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public List<AuditLogResponse> getAllAuditLogs() {
        return auditLogRepository.findAll().stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getTimestamp() != null ? log.getTimestamp().toString() : null,
                        "OP-" + log.getOperatoreId(),
                        "ESCALATION_RESOLVED",
                        log.getAzione(),
                        "SUCCESS",
                        false,
                        log.getEmergencyId()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/{emergencyId}")
    public List<AuditLogResponse> getAuditLogsByEmergencyId(@PathVariable String emergencyId) {
        return auditLogRepository.findByEmergencyId(emergencyId).stream()
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getTimestamp() != null ? log.getTimestamp().toString() : null,
                        "OP-" + log.getOperatoreId(),
                        "ESCALATION_RESOLVED",
                        log.getAzione(),
                        "SUCCESS",
                        false,
                        log.getEmergencyId()
                ))
                .collect(Collectors.toList());
    }

    public static class AuditLogResponse {
        public Long id;
        public String timestamp;
        public String operator;
        public String action;
        public String details;
        public String outcome;
        public boolean override;
        public String emergencyId;

        public AuditLogResponse(Long id, String timestamp, String operator, String action, String details, String outcome, boolean override, String emergencyId) {
            this.id = id;
            this.timestamp = timestamp;
            this.operator = operator;
            this.action = action;
            this.details = details;
            this.outcome = outcome;
            this.override = override;
            this.emergencyId = emergencyId;
        }
    }
}
