package com.spendy.operator.DTO;

public class EscalationResolutionRequest {
    private String operatorId;
    private String resolutionStrategy;
    private String justification;

    public EscalationResolutionRequest() {
    }

    public EscalationResolutionRequest(String operatorId, String resolutionStrategy, String justification) {
        this.operatorId = operatorId;
        this.resolutionStrategy = resolutionStrategy;
        this.justification = justification;
    }

    public String getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(String operatorId) {
        this.operatorId = operatorId;
    }

    public String getResolutionStrategy() {
        return resolutionStrategy;
    }

    public void setResolutionStrategy(String resolutionStrategy) {
        this.resolutionStrategy = resolutionStrategy;
    }

    public String getJustification() {
        return justification;
    }

    public void setJustification(String justification) {
        this.justification = justification;
    }
}
