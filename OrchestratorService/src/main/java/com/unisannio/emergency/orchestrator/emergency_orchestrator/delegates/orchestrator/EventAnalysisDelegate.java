package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates.orchestrator;

import com.fasterxml.jackson.databind.JsonNode;
import io.camunda.client.api.response.ActivatedJob;
import io.camunda.client.annotation.JobWorker;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class EventAnalysisDelegate {

    private static final String JOB_TYPE = "event-analysis";

    private static final String EVENT_TYPE = "emergency_category";
    private static final String SEVERITY = "severity";
    private static final String EMERGENCY_PLAN = "emergency_plan";

    @JobWorker(type = JOB_TYPE)
    public Map<String, Object> analyze(ActivatedJob job) {

        Map<String, Object> variables = job.getVariablesAsMap();

        String eventType = String.valueOf(variables.get(EVENT_TYPE));
        String severity = String.valueOf(variables.get(SEVERITY));

        String plan = selectPlan(eventType, severity);

        // Restituiamo il piano selezionato e iniettiamo il processInstanceKey
        return Map.of(
                EMERGENCY_PLAN, plan,
                "processInstanceKey", String.valueOf(job.getProcessInstanceKey())
        );
    }

    private String selectPlan(String eventType, String severity) {

        return switch (eventType) {

            case "FIRE" -> switch (severity) {
                case "LOW" -> "FIRE_LOW";
                case "MEDIUM" -> "FIRE_MEDIUM";
                case "HIGH" -> "FIRE_HIGH";
                case "CRITICAL" -> "FIRE_CRITICAL";
                default -> "UNKNOWN";
            };

            case "FLOOD" -> switch (severity) {
                case "LOW" -> "FLOOD_LOW";
                case "MEDIUM" -> "FLOOD_MEDIUM";
                case "HIGH" -> "FLOOD_HIGH";
                case "CRITICAL" -> "FLOOD_CRITICAL";
                default -> "UNKNOWN";
            };

            case "CAR_CRASH" -> switch (severity) {
                case "LOW" -> "CAR_CRASH_LOW";
                case "MEDIUM" -> "CAR_CRASH_MEDIUM";
                case "HIGH" -> "CAR_CRASH_HIGH";
                case "CRITICAL" -> "CAR_CRASH_CRITICAL";
                default -> "UNKNOWN";
            };

            case "HEALTH_CRISIS" -> switch (severity) {
                case "LOW" -> "HEALTH_CRISIS_LOW";
                case "MEDIUM" -> "HEALTH_CRISIS_MEDIUM";
                case "HIGH" -> "HEALTH_CRISIS_HIGH";
                case "CRITICAL" -> "HEALTH_CRISIS_CRITICAL";
                default -> "UNKNOWN";
            };

            case "EARTHQUAKE" -> switch (severity) {
                case "LOW" -> "EARTHQUAKE_LOW";
                case "MEDIUM" -> "EARTHQUAKE_MEDIUM";
                case "HIGH" -> "EARTHQUAKE_HIGH";
                case "CRITICAL" -> "EARTHQUAKE_CRITICAL";
                default -> "UNKNOWN";
            };


            case "UNKNOWN" -> "GENERIC_RESPONSE";

            default -> "UNKNOWN";
        };
    }
}