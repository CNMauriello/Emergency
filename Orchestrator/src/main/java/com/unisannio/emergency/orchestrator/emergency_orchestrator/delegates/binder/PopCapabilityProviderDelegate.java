package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates.binder;

import io.camunda.client.annotation.JobWorker;
import io.camunda.client.api.response.ActivatedJob;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component("popCapabilityProviderDelegate")
public class PopCapabilityProviderDelegate {

    @JobWorker(type = "pop-capability-provider", autoComplete = true)
    public Map<String, Object> execute(ActivatedJob job) {
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) job.getVariable("capabilityCandidates");

        if (candidates == null || candidates.isEmpty()) {
            return Map.of(
                    "isCapabilityAvailable", false,
                    "capabilityCandidatesExhausted", true,
                    "currentCandidateEndpoint", "");
        } else {
            Map<String, Object> chosenCandidate = candidates.remove(0);

            return Map.of(
                    "capabilityCandidates", candidates,
                    "capabilityCandidatesExhausted", false,
                    "currentCandidateEndpoint", chosenCandidate.get("endpoint"));
        }
    }
}