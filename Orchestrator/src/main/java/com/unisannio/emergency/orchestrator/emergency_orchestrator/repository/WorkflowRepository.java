package com.unisannio.emergency.orchestrator.emergency_orchestrator.repository;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    Optional<Workflow> findByEventTypeAndSeverity(String eventType, String severity);
}
