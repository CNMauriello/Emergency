package com.unisannio.emergency.orchestrator.emergency_orchestrator.controller;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyEvent;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.services.EmergencyTriggerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emergency-triggers")
public class EmergencyTriggerController {

    private final EmergencyTriggerService emergencyTriggerService;

    public EmergencyTriggerController(
            EmergencyTriggerService emergencyTriggerService) {

        this.emergencyTriggerService = emergencyTriggerService;
    }

    @PostMapping
    public ResponseEntity<Void> trigger(
            @RequestBody EmergencyEvent payload) {

        emergencyTriggerService.trigger(payload);

        return ResponseEntity.accepted().build();
    }
}
