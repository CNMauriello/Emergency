package com.unisannio.emergency.orchestrator.emergency_orchestrator.repository;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    Optional<Workflow> findByProcessKeyAndEnabledTrue(String processKey);
    Optional<Workflow> findByProcessKeyAndVersion(String processKey, Integer version);
    Optional<Workflow> findTopByProcessKeyOrderByVersionDesc(String processKey);
    // Optional, if we want all versions of a specific workflow
    java.util.List<Workflow> findByProcessKey(String processKey);
}
