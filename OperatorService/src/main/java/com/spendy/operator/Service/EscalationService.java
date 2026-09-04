package com.spendy.operator.Service;

import com.spendy.operator.DTO.EscalationCreationRequest;
import com.spendy.operator.DTO.EscalationResolutionRequest;
import com.spendy.operator.Entity.AuditLog;
import com.spendy.operator.Entity.EscalationTicket;
import com.spendy.operator.Entity.TicketStatus;
import com.spendy.operator.Repository.AuditLogRepository;
import com.spendy.operator.Repository.EscalationTicketRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class EscalationService {

    private final EscalationTicketRepository ticketRepository;
    private final AuditLogRepository auditLogRepository;
    private final RestTemplate restTemplate;

    public EscalationService(EscalationTicketRepository ticketRepository,
            AuditLogRepository auditLogRepository,
            RestTemplate restTemplate) {
        this.ticketRepository = ticketRepository;
        this.auditLogRepository = auditLogRepository;
        this.restTemplate = restTemplate;
    }

    public void createEscalation(EscalationCreationRequest request) {
        EscalationTicket ticket = new EscalationTicket(
                request.getTicketId(),
                request.getEventId(),
                request.getCapability(),
                request.getFailedEndpoints(),
                TicketStatus.PENDING);
        ticketRepository.save(ticket);
    }

    public List<EscalationTicket> getActiveEscalations() {
        return ticketRepository.findByStatus(TicketStatus.PENDING);
    }

    public EscalationTicket getEscalationByTicketId(String ticketId) {
        return ticketRepository.findByTicketId(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escalation ticket non trovato per ticketId: " + ticketId));
    }

    @Transactional
    public void resolveEscalation(String ticketId, EscalationResolutionRequest request) {
        // 1. Locking pessimistico
        EscalationTicket ticket = ticketRepository.findByIdForUpdate(ticketId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Escalation ticket non trovato per ticketId: " + ticketId));

        if (ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "L'escalation è già stata risolta da un altro operatore.");
        }

        // 2. Tracciabilità (Log Immutabile)
        Long parsedOperatorId = extractId(request.getOperatorId());
        Long parsedEventId = extractId(ticket.getEventId());
        String azione = request.getResolutionStrategy() + " - " + request.getJustification();

        AuditLog auditLog = new AuditLog(parsedOperatorId, parsedEventId, azione);
        auditLog.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(auditLog);

        ticket.setStatus(TicketStatus.RESOLVED);
        ticketRepository.save(ticket);

        // 3. Integrazione Camunda tramite Webhook Asincrono
        String webhookEndpoint = "http://localhost:8083/api/orchestrator/escalations/" + ticketId + "/resolve";
        
        Map<String, Object> webhookPayload = Map.of(
                "resolutionStrategy", request.getResolutionStrategy()
        );

        try {
            restTemplate.postForEntity(webhookEndpoint, webhookPayload, Void.class);
        } catch (Exception e) {
            // Se Camunda fallisce ma il database commit va a buon fine, potremmo avere
            // un'inconsistenza.
            // Si può far propagare l'eccezione per triggerare il rollback della
            // transazione.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Errore durante la comunicazione con l'Orchestratore Camunda: " + e.getMessage());
        }
    }

    private Long extractId(String idStr) {
        if (idStr == null)
            return 0L;
        Matcher matcher = Pattern.compile("\\d+").matcher(idStr);
        if (matcher.find()) {
            return Long.parseLong(matcher.group());
        }
        return 0L; // Fallback se non ci sono numeri
    }
}
