package com.unisannio.emergency.orchestrator.emergency_orchestrator.dto;

import java.util.List;

public class ProcessInstanceVisualizationDTO {
    private Long processInstanceKey;
    private Long processDefinitionKey;
    private String state;
    private String bpmnXml;
    private List<String> activeNodes;
    private List<String> completedNodes;
    private List<String> sequenceFlows;
    private List<String> incidents;

    // Getters and Setters
    public Long getProcessInstanceKey() { return processInstanceKey; }
    public void setProcessInstanceKey(Long processInstanceKey) { this.processInstanceKey = processInstanceKey; }

    public Long getProcessDefinitionKey() { return processDefinitionKey; }
    public void setProcessDefinitionKey(Long processDefinitionKey) { this.processDefinitionKey = processDefinitionKey; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getBpmnXml() { return bpmnXml; }
    public void setBpmnXml(String bpmnXml) { this.processDefinitionKey = processDefinitionKey; this.bpmnXml = bpmnXml; }

    public List<String> getActiveNodes() { return activeNodes; }
    public void setActiveNodes(List<String> activeNodes) { this.activeNodes = activeNodes; }

    public List<String> getCompletedNodes() { return completedNodes; }
    public void setCompletedNodes(List<String> completedNodes) { this.completedNodes = completedNodes; }

    public List<String> getSequenceFlows() { return sequenceFlows; }
    public void setSequenceFlows(List<String> sequenceFlows) { this.sequenceFlows = sequenceFlows; }

    public List<String> getIncidents() { return incidents; }
    public void setIncidents(List<String> incidents) { this.incidents = incidents; }
}
