package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component("popCapabilityProviderDelegate")
public class PopCapabilityProviderDelegate implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) execution.getVariable("capabilityCandidates");

        if (candidates == null || candidates.isEmpty()) {
            // Esaurimento delle risorse: il fallback intercetterà il false e devierà sulla gestione umana
            execution.setVariable("isCapabilityAvailable", false);
            execution.setVariable("capabilityCandidatesExhausted", true);
            execution.setVariable("currentCandidateEndpoint", null);
        } else {
            // Rimuove il primo elemento (il migliore in quel momento)
            Map<String, Object> chosenCandidate = candidates.remove(0);

            // Salva la coda rimanente e l'endpoint da colpire
            execution.setVariable("capabilityCandidates", candidates);
            execution.setVariable("capabilityCandidatesExhausted", false);
            execution.setVariable("currentCandidateEndpoint", chosenCandidate.get("endpoint"));
        }
    }
}