package com.unisannio.emergency.orchestrator.emergency_orchestrator.controller;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.dto.ProcessInstanceVisualizationDTO;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.services.WorkflowStorageService;
import io.camunda.client.CamundaClient;
import io.camunda.client.api.search.response.ElementInstance;
import io.camunda.client.api.search.response.Incident;
import io.camunda.client.api.search.response.ProcessInstance;
import io.camunda.client.api.search.response.ProcessInstanceSequenceFlow;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/process-instances")
public class ProcessVisualizationController {

    private final CamundaClient camundaClient;
    private final WorkflowStorageService workflowStorageService;

    public ProcessVisualizationController(CamundaClient camundaClient, WorkflowStorageService workflowStorageService) {
        this.camundaClient = camundaClient;
        this.workflowStorageService = workflowStorageService;
    }

    @GetMapping("/{processInstanceKey}/visualization")
    public ResponseEntity<?> getProcessVisualization(@PathVariable Long processInstanceKey) {
        try {
            // 1. Get process instance state
            var processInstances = camundaClient.newProcessInstanceSearchRequest()
                    .filter(f -> f.processInstanceKey(processInstanceKey))
                    .send()
                    .join()
                    .items();

            if (processInstances.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Process instance not found for key: " + processInstanceKey);
            }

            ProcessInstance processInstance = processInstances.get(0);

            // 2. Get active and completed nodes
            List<ElementInstance> elementInstances = camundaClient.newElementInstanceSearchRequest()
                    .filter(f -> f.processInstanceKey(processInstanceKey))
                    .send()
                    .join()
                    .items();

            List<String> activeNodes = elementInstances.stream()
                    .filter(e -> "ACTIVE".equals(e.getState().name()))
                    .map(ElementInstance::getElementId)
                    .collect(Collectors.toList());

            List<String> completedNodes = elementInstances.stream()
                    .filter(e -> "COMPLETED".equals(e.getState().name()))
                    .map(ElementInstance::getElementId)
                    .collect(Collectors.toList());

            // 3. Get sequence flows
            List<ProcessInstanceSequenceFlow> flows = camundaClient.newProcessInstanceSequenceFlowsRequest(processInstanceKey)
                    .send()
                    .join();
            
            List<String> sequenceFlows = flows.stream()
                    .map(ProcessInstanceSequenceFlow::getElementId)
                    .collect(Collectors.toList());

            // 4. Get incidents
            List<Incident> incidentRecords = camundaClient.newIncidentSearchRequest()
                    .filter(f -> f.processInstanceKey(processInstanceKey))
                    .send()
                    .join()
                    .items();

            List<String> incidents = incidentRecords.stream()
                    // Assuming incidents with state CREATED or ACTIVE are what we want to show
                    .filter(i -> "CREATED".equals(i.getState().name()) || "ACTIVE".equals(i.getState().name()))
                    .map(Incident::getElementId)
                    .collect(Collectors.toList());

            // 5. Get XML natively from Camunda
            String bpmnProcessId = processInstance.getProcessDefinitionId();
            String bpmnXml = "";
            try {
                // Try fetching directly from Camunda 8.6+ search API
                bpmnXml = camundaClient.newProcessDefinitionGetXmlRequest(processInstance.getProcessDefinitionKey())
                        .send()
                        .join();
            } catch (Exception e) {
                System.err.println("Could not load XML from Camunda directly: " + e.getMessage());
                // Fallback to local storage
                try {
                    bpmnXml = workflowStorageService.getActiveWorkflowXml(bpmnProcessId);
                } catch (Exception ex) {
                    System.err.println("Could not load XML from WorkflowStorageService either: " + ex.getMessage());
                }
            }

            // 6. Build DTO
            ProcessInstanceVisualizationDTO dto = new ProcessInstanceVisualizationDTO();
            dto.setProcessInstanceKey(processInstanceKey);
            dto.setProcessDefinitionKey(processInstance.getProcessDefinitionKey());
            dto.setState(processInstance.getState() != null ? processInstance.getState().name() : "UNKNOWN");
            dto.setBpmnXml(bpmnXml);
            dto.setActiveNodes(activeNodes);
            dto.setCompletedNodes(completedNodes);
            dto.setSequenceFlows(sequenceFlows);
            dto.setIncidents(incidents);

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving visualization data: " + e.getMessage());
        }
    }
}
