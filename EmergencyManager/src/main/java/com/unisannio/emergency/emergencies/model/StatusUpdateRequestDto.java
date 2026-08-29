package com.unisannio.emergency.emergencies.model;

public class StatusUpdateRequestDto {

    private String status;
    private String workflowInstanceId;

    public StatusUpdateRequestDto() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWorkflowInstanceId() {
        return workflowInstanceId;
    }

    public void setWorkflowInstanceId(String workflowInstanceId) {
        this.workflowInstanceId = workflowInstanceId;
    }
}