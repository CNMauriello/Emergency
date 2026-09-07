package com.unisannio.emergency.emergencies.service;

import com.unisannio.emergency.emergencies.client.OrchestratorClient;
import com.unisannio.emergency.emergencies.model.EmergencyResponseDto;
import com.unisannio.emergency.emergencies.model.EmergencyStatus;
import com.unisannio.emergency.emergencies.model.IncomingEventDto;
import com.unisannio.emergency.emergencies.persistance.Emergency;
import com.unisannio.emergency.emergencies.persistance.repository.EmergencyRepository;
import com.unisannio.emergency.emergencies.utility.EmergencyMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EmergencyStateService {

    private final EmergencyRepository emergencyRepository;
    private final OrchestratorClient orchestratorClient;
    private final EmergencyMapper emergencyMapper;

    public EmergencyStateService(EmergencyRepository emergencyRepository,
                                 OrchestratorClient orchestratorClient,
                                 EmergencyMapper emergencyMapper) {
        this.emergencyRepository = emergencyRepository;
        this.orchestratorClient = orchestratorClient;
        this.emergencyMapper = emergencyMapper;
    }

    public Optional<EmergencyResponseDto> getEmergencyById(String id) {
        return emergencyRepository.findByEventId(id)
                .map(emergencyMapper::toDto);
    }

    @Transactional
    public void handleIncomingEvent(IncomingEventDto event) {
        if (emergencyRepository.findByEventId(event.getEventId()).isPresent()) {
            return;
        }

        // Passa il valore dell'Enum invece della stringa
        List<Emergency> nearbyEmergencies = emergencyRepository.findActiveEmergenciesNearby(
                event.getEmergencyCategory(),
                event.getCoordinates().getLatitude(),
                event.getCoordinates().getLongitude(),
                EmergencyStatus.CLOSED
        );

        if (!nearbyEmergencies.isEmpty()) {
            Emergency existing = nearbyEmergencies.get(0);
            if (isSeverityEscalated(existing.getSeverity(), event.getSeverity())) {
                existing.setSeverity(event.getSeverity());
                emergencyRepository.save(existing);
                orchestratorClient.notifyNewEmergency(event);
            }
        } else {
            Emergency newEmergency = new Emergency();

            // Salva l'identificativo alfanumerico della segnalazione
            newEmergency.setEventId(event.getEventId());

            newEmergency.setEventType(event.getEmergencyCategory());
            newEmergency.setSeverity(event.getSeverity());
            newEmergency.setLatitude(event.getCoordinates().getLatitude());
            newEmergency.setLongitude(event.getCoordinates().getLongitude());
            newEmergency.setTimestamp(event.getTimestamp());
            newEmergency.setStatus(EmergencyStatus.OPEN);
            newEmergency.getHistory().add(EmergencyStatus.OPEN.name());

            Emergency saved = emergencyRepository.save(newEmergency);
            try {
                orchestratorClient.notifyNewEmergency(event);
            } catch (Exception e) {
                System.err.println("Orchestrator non raggiungibile, ma l'emergenza è stata salvata: " + e.getMessage());
            }
    }
    }

    @Transactional
    public void updateStatus(String id, String newStatus, String workflowInstanceId) {
        emergencyRepository.findByEventId(id).ifPresent(emergency -> {
            emergency.setStatus(EmergencyStatus.valueOf(newStatus));
            System.out.println("WorkflowInstanceId: " + workflowInstanceId);
            System.out.println("Status: " + newStatus);
            if (workflowInstanceId != null) {
                emergency.setWorkflowInstanceId(workflowInstanceId);
            }
            emergency.getHistory().add(newStatus);
            emergencyRepository.save(emergency);
        });
    }

    private boolean isSeverityEscalated(String currentSeverity, String newSeverity) {
        List<String> levels = List.of("LOW", "MEDIUM", "HIGH", "CRITICAL");
        return levels.indexOf(newSeverity) > levels.indexOf(currentSeverity);
    }

    // Metodo pulito dal log di errore
    public List<EmergencyResponseDto> getAllEmergencies() {
        List<Emergency> emergencies = emergencyRepository.findAll();
        return emergencies.stream()
                .map(emergencyMapper::toDto)
                .toList();
    }
}