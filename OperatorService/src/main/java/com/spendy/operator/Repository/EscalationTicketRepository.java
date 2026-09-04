package com.spendy.operator.Repository;

import com.spendy.operator.Entity.EscalationTicket;
import com.spendy.operator.Entity.TicketStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EscalationTicketRepository extends JpaRepository<EscalationTicket, String> {

    List<EscalationTicket> findByStatus(TicketStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM EscalationTicket e WHERE e.ticketId = :ticketId")
    Optional<EscalationTicket> findByIdForUpdate(@Param("ticketId") String ticketId);

    @Query("SELECT e FROM EscalationTicket e WHERE e.ticketId = :ticketId")
    Optional<EscalationTicket> findByTicketId(@Param("ticketId") String ticketId);
}
