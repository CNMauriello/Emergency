package com.unisannio.emergency.orchestrator.emergency_orchestrator.service;



import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyEvent;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyService;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.ServiceResolution;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Workflow;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient; 

@Service
public class WorkflowResolver {

    private RestClient workflowClient =  RestClient.builder()
                .baseUrl("http://workflow-service")
                .build();
     

    private RestClient serviceClient =  RestClient.builder()
                .baseUrl("http://service-registry")
                .build();

    
    public WorkflowResolver() {}
/*  
*    Dall'evento ricostruiamo l'id del workflow associato e recuperiamo le capabilities
*    dalle capabilities ricostruiamo i servizi disponibili e li restituiamo al workflow
*/
    public ServiceResolution resolve(EmergencyEvent event) {
       Workflow workflow = workflowRetrive(event);
       return retrieveServices(workflow.getCapabilities());


    }

    private  Workflow workflowRetrive(EmergencyEvent event) {
        // Implement the logic to resolve the workflow based on the event
        String workflowType = event.getAssociatedWorkflow();
        workflowClient.get()
                .uri("/workflows/{type}", workflowType)
                .retrieve()
                .body(new ParameterizedTypeReference<
                        List<EmergencyService>>() {});
    
    }

    private retrieveServices(List<String> capabilities) {
        // Implement the logic to retrieve services based on the capabilities
        serviceClient.get()
                .uri("/services")
                .retrieve()
                .body(new ParameterizedTypeReference<
                        List<EmergencyService>>() {});
    }
}

