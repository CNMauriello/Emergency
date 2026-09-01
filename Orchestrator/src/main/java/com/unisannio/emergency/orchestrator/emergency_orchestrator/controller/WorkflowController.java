package com.unisannio.emergency.orchestrator.emergency_orchestrator.controller;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Workflow;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.services.WorkflowStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/workflows")
public class WorkflowController {

    private final WorkflowStorageService workflowStorageService;

    public WorkflowController(WorkflowStorageService workflowStorageService) {
        this.workflowStorageService = workflowStorageService;
    }

    @org.springframework.web.bind.annotation.GetMapping
    public ResponseEntity<?> getAllWorkflows() {
        return ResponseEntity.ok(workflowStorageService.getAllWorkflows());
    }

    @PostMapping
    public ResponseEntity<?> uploadWorkflow(
            @RequestParam("file") MultipartFile file,
            @RequestParam("eventType") String eventType,
            @RequestParam("severity") String severity) {
        try {
            Workflow savedWorkflow = workflowStorageService.registerWorkflowFile(file, eventType, severity);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedWorkflow);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing file upload");
        }
    }

    @org.springframework.web.bind.annotation.PutMapping("/active-version")
    public ResponseEntity<?> changeActiveVersion(
            @RequestParam("processKey") String processKey,
            @RequestParam("targetVersion") Integer targetVersion) {
        try {
            Workflow updatedWorkflow = workflowStorageService.changeActiveVersion(processKey, targetVersion);
            return ResponseEntity.ok(updatedWorkflow);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error modifying files");
        }
    }
}
