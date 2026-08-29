package com.unisannio.emergency.emergencies.controller;

import com.unisannio.emergency.emergencies.model.EmergencyResponseDto;
import com.unisannio.emergency.emergencies.model.StatusUpdateRequestDto;
import com.unisannio.emergency.emergencies.service.EmergencyStateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emergencies")
public class EmergencyController {

    private final EmergencyStateService emergencyStateService;

    // Iniezione del Service (non più del Repository e del Mapper)
    public EmergencyController(EmergencyStateService emergencyStateService) {
        this.emergencyStateService = emergencyStateService;
    }

    @GetMapping
    public List<EmergencyResponseDto> getAllEmergencies() {
        return emergencyStateService.getAllEmergencies();
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyResponseDto> getEmergency(@PathVariable Long id) {
        return emergencyStateService.getEmergencyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateEmergencyStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequestDto request) {
        emergencyStateService.updateStatus(id, request.getStatus(), request.getWorkflowInstanceId());
        return ResponseEntity.ok().build();
    }
}