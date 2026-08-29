package com.unisannio.emergency.orchestrator;

import io.camunda.client.annotation.Deployment;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@Deployment(
        resources = "classpath:Emergency_Response_Plan_Orchestrator.bpmn"
)
public class EmergencyOrchestratorApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                EmergencyOrchestratorApplication.class,
                args
        );
    }
}
