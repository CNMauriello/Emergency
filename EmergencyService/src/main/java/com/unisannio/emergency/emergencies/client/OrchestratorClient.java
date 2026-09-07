package com.unisannio.emergency.emergencies.client;

import com.unisannio.emergency.emergencies.model.IncomingEventDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "orchestrator", url = "${orchestrator.url}")
public interface OrchestratorClient {

    // L'Orchestratore riceve l'evento completo per istanziare le variabili del processo BPMN
    @PostMapping("/api/emergency-triggers")
    void notifyNewEmergency(@RequestBody IncomingEventDto event);

    // In caso di escalation, l'Orchestratore riceve l'evento aggiornato
    @PutMapping("/api/orchestration/{emergencyId}/escalate")
    void notifyEscalation(@PathVariable("emergencyId") Long emergencyId, @RequestBody IncomingEventDto event);
}