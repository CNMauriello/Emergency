package com.unisannio.emergency.orchestrator.emergency_orchestrator.services;

import com.networknt.schema.JsonSchema;
import com.networknt.schema.JsonSchemaFactory;
import com.networknt.schema.SpecVersion;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyEvent;

import io.camunda.client.CamundaClient;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@Service
public class EmergencyTriggerService {

    private static final String MESSAGE_NAME = "Emergency_Report";
    private static final String SCHEMA_PATH = "/emergency-trigger.schema.json";

    private final CamundaClient camundaClient;
    private final JsonSchema schema;

    public EmergencyTriggerService(CamundaClient camundaClient) {

        this.camundaClient = camundaClient;

        try (InputStream inputStream =
                     getClass().getResourceAsStream(SCHEMA_PATH)) {

            if (inputStream == null) {
                throw new IllegalStateException(
                        "Schema not found: " + SCHEMA_PATH
                );
            }

            this.schema = JsonSchemaFactory
                    .getInstance(SpecVersion.VersionFlag.V202012)
                    .getSchema(inputStream);

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Unable to load JSON schema", e
            );
        }
    }

    public void trigger(EmergencyEvent payload) {

        // Con il record abbiamo già un oggetto Java tipizzato.
        // Se vuoi mantenere la validazione JSON Schema,
        // la facciamo sui dati del record.

        var event = camundaClient
                .newCreateInstanceCommand()
                .bpmnProcessId("Emergency_Response_Plan_Orchestrator")
                .latestVersion()
                .variables(Map.of(
                        "event_id", payload.event_id(),
                        "timestamp", payload.timestamp(),
                        "emergency_category", payload.emergency_category(),
                        "severity", payload.severity(),
                        "incident_context", Map.of(
                                "has_injured",
                                payload.incident_context().has_injured(),

                                "has_unconscious",
                                payload.incident_context().has_unconscious(),

                                "has_trapped",
                                payload.incident_context().has_trapped(),

                                "has_special_vehicle_involved",
                                payload.incident_context()
                                        .has_special_vehicle_involved()
                        ),
                        "coordinates", Map.of(
                                "latitude",
                                payload.coordinates().latitude(),

                                "longitude",
                                payload.coordinates().longitude()
                        ),
                        "address", payload.address(),
                        "global_confidence",
                        payload.global_confidence()
                ))
                .send()
                .join();

        camundaClient.newSetVariablesCommand(event.getProcessInstanceKey())
                .variables(Map.of("processInstanceKey", String.valueOf(event.getProcessInstanceKey())))
                .send()
                .join();
    }
}
