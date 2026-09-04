package com.spendy.operator.Controller;

import com.spendy.operator.DTO.EscalationCreationRequest;
import com.spendy.operator.DTO.EscalationResolutionRequest;
import com.spendy.operator.Entity.EscalationTicket;
import com.spendy.operator.Service.EscalationService;
import org.hibernate.PessimisticLockException;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/operators/escalations")
public class EscalationController {

    private final EscalationService escalationService;

    public EscalationController(EscalationService escalationService) {
        this.escalationService = escalationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createEscalation(@RequestBody EscalationCreationRequest request) {
        escalationService.createEscalation(request);
    }

    @GetMapping("/active")
    public List<EscalationTicket> getActiveEscalations() {
        return escalationService.getActiveEscalations();
    }

    @GetMapping("/{ticketId}")
    public EscalationTicket getEscalation(@PathVariable String ticketId) {
        return escalationService.getEscalationByTicketId(ticketId);
    }

    @PostMapping("/{ticketId}/resolve")
    public ResponseEntity<Void> resolveEscalation(@PathVariable String ticketId,
            @RequestBody EscalationResolutionRequest request) {
        try {
            escalationService.resolveEscalation(ticketId, request);
            return ResponseEntity.ok().build();
        } catch (PessimisticLockingFailureException e) {
            // Gestione dei conflitti per lock pessimistico fallito
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Lock occupato, un altro operatore sta gestendo questo ticket.", e);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            if (e.getCause() instanceof PessimisticLockException) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Lock occupato, un altro operatore sta gestendo questo ticket.", e);
            }
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Errore interno del server", e);
        }
    }
}
