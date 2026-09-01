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

        Optional<Workflow> latestWorkflowOpt = workflowRepository.findTopByProcessKeyOrderByVersionDesc(processKey);
        int nextVersion = latestWorkflowOpt.map(w -> w.getVersion() + 1).orElse(1);

        Workflow workflow = new Workflow();
        workflow.setEventType(eventType);
        workflow.setSeverity(severity);
        workflow.setProcessKey(processKey);
        workflow.setVersion(nextVersion);
        
        // Disattiva il workflow precedentemente attivo se presente
        workflowRepository.findByProcessKeyAndEnabledTrue(processKey).ifPresent(active -> {
            active.setEnabled(false);
            workflowRepository.save(active);
        });

        // Imposta il nuovo workflow come attivo
        workflow.setEnabled(true);
        
        // Save physical file
        saveFile(file, processKey, workflow.getVersion());

        return workflowRepository.save(workflow);
    }

    public java.util.List<Workflow> getAllWorkflows() {
        return workflowRepository.findAll();
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

    @Transactional
    public Workflow changeActiveVersion(String processKey, Integer targetVersion) throws IOException {
        // Recupera il workflow target
        Workflow targetWorkflow = workflowRepository.findByProcessKeyAndVersion(processKey, targetVersion)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Target workflow not found for version: " + targetVersion));

        if (targetWorkflow.getEnabled()) {
            return targetWorkflow; // Already active
        }

        // Recupera il workflow attualmente attivo (se esiste)
        Optional<Workflow> currentActiveOpt = workflowRepository.findByProcessKeyAndEnabledTrue(processKey);
        Integer currentVersion = currentActiveOpt.map(Workflow::getVersion).orElse(null);

        Path resourcesDir = getDirectoryPath();

        // 1. Fase di Disattivazione (versione corrente)
        if (currentVersion != null) {
            Path currentVersionFile = resourcesDir.resolve(processKey + "_v" + currentVersion + ".bpmn");
            if (Files.exists(currentVersionFile)) {
                String currentContent = Files.readString(currentVersionFile);
                String oldId = processKey;
                String newId = processKey + "_" + currentVersion;
                
                String replacedCurrent = currentContent.replaceFirst("(<bpmn:process[^>]*?)id=\"" + oldId + "\"", "$1id=\"" + newId + "\"");
                Files.writeString(currentVersionFile, replacedCurrent);
            }
            
            Workflow currentActive = currentActiveOpt.get();
            currentActive.setEnabled(false);
            workflowRepository.save(currentActive);
        }

        // 2. Fase di Attivazione (versione target)
        Path targetVersionFile = resourcesDir.resolve(processKey + "_v" + targetVersion + ".bpmn");
        if (Files.exists(targetVersionFile)) {
            String targetContent = Files.readString(targetVersionFile);
            String oldId = processKey + "_" + targetVersion;
            String newId = processKey;

            String replacedTarget = targetContent.replaceFirst("(<bpmn:process[^>]*?)id=\"" + oldId + "\"", "$1id=\"" + newId + "\"");
            Files.writeString(targetVersionFile, replacedTarget);
        } else {
            throw new java.io.FileNotFoundException("Target version file not found: " + targetVersionFile.getFileName());
        }

        // 3. Aggiornamento Database
        targetWorkflow.setEnabled(true);
        return workflowRepository.save(targetWorkflow);
    }

    private void saveFile(MultipartFile file, String processKey, Integer version) throws IOException {
        Path directory = getDirectoryPath();
        
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }
        
        String filename = processKey + "_v" + version + ".bpmn";
        Path targetPath = directory.resolve(filename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
    }

    private Path getDirectoryPath() {
        String currentDir = System.getProperty("user.dir");
        Path directory = Paths.get(currentDir);
        
        if (!currentDir.endsWith("Orchestrator")) {
            directory = directory.resolve("Orchestrator");
        }
        return directory.resolve("src/main/resources/");
    }
}
