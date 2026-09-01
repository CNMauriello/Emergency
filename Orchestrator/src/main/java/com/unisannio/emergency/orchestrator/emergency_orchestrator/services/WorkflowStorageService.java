package com.unisannio.emergency.orchestrator.emergency_orchestrator.services;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Workflow;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.repository.WorkflowRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

@Service
public class WorkflowStorageService {

    private final WorkflowRepository workflowRepository;

    public WorkflowStorageService(WorkflowRepository workflowRepository) {
        this.workflowRepository = workflowRepository;
    }

    @Transactional
    public Workflow registerWorkflowFile(MultipartFile file, String eventType, String severity) throws IOException {
        String processKey = generateProcessKey(eventType, severity);

        if ("UNKNOWN".equals(processKey)) {
            throw new IllegalArgumentException("Unknown process key for eventType: " + eventType + " and severity: " + severity);
        }

        // Save physical file
        saveFile(file);

        // Save or update workflow metadata
        Optional<Workflow> existingWorkflowOpt = workflowRepository.findByEventTypeAndSeverity(eventType, severity);
        Workflow workflow;

        if (existingWorkflowOpt.isPresent()) {
            workflow = existingWorkflowOpt.get();
            workflow.setVersion(workflow.getVersion() + 1);
        } else {
            workflow = new Workflow();
            workflow.setEventType(eventType);
            workflow.setSeverity(severity);
            workflow.setProcessKey(processKey);
            workflow.setVersion(1);
        }
        
        workflow.setEnabled(true);
        return workflowRepository.save(workflow);
    }

    private String generateProcessKey(String eventType, String severity) {
        return switch (eventType) {
            case "FIRE" -> switch (severity) {
                case "LOW" -> "FIRE_LOW";
                case "MEDIUM" -> "FIRE_STANDARD";
                case "HIGH" -> "FIRE_HIGH";
                case "CRITICAL" -> "FIRE_CRITICAL";
                default -> "UNKNOWN";
            };
            case "FLOOD" -> switch (severity) {
                case "LOW" -> "FLOOD_LOW";
                case "MEDIUM" -> "FLOOD_STANDARD";
                case "HIGH" -> "FLOOD_HIGH";
                case "CRITICAL" -> "FLOOD_CRITICAL";
                default -> "UNKNOWN";
            };
            case "CAR_CRASH" -> switch (severity) {
                case "LOW" -> "CAR_CRASH_LOW";
                case "MEDIUM" -> "CAR_CRASH_STANDARD";
                case "HIGH" -> "CAR_CRASH_HIGH";
                case "CRITICAL" -> "CAR_CRASH_CRITICAL";
                default -> "UNKNOWN";
            };
            case "HEALTH_CRISIS" -> switch (severity) {
                case "LOW" -> "HEALTH_LOW";
                case "MEDIUM" -> "HEALTH_STANDARD";
                case "HIGH" -> "HEALTH_HIGH";
                case "CRITICAL" -> "HEALTH_CRITICAL";
                default -> "UNKNOWN";
            };
            case "UNKNOWN" -> "GENERIC_RESPONSE";
            default -> "UNKNOWN";
        };
    }

    private void saveFile(MultipartFile file) throws IOException {
        String currentDir = System.getProperty("user.dir");
        Path directory = Paths.get(currentDir);
        
        // Se il processo è stato avviato dalla root del progetto padre, aggiungiamo "Orchestrator"
        if (!currentDir.endsWith("Orchestrator")) {
            directory = directory.resolve("Orchestrator");
        }
        directory = directory.resolve("src/main/resources/");
        
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }
        
        Path targetPath = directory.resolve(file.getOriginalFilename());
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
    }
}
