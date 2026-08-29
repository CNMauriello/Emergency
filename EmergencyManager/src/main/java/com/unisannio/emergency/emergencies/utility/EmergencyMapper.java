package com.unisannio.emergency.emergencies.utility;

import com.unisannio.emergency.emergencies.model.EmergencyResponseDto;
import com.unisannio.emergency.emergencies.persistance.Emergency;
import org.springframework.stereotype.Component;

@Component
public class EmergencyMapper {

    public EmergencyResponseDto toDto(Emergency e) {
        if (e == null) {
            return null;
        }

        EmergencyResponseDto dto = new EmergencyResponseDto();
        dto.setId(e.getId());
        dto.setEventId(e.getEventId());
        dto.setEventType(e.getEventType());
        dto.setSeverity(e.getSeverity());
        dto.setStatus(String.valueOf(e.getStatus()));
        dto.setLatitude(e.getLatitude());
        dto.setLongitude(e.getLongitude());
        dto.setWorkflowInstanceId(e.getWorkflowInstanceId());
        dto.setHistory(e.getHistory());

        return dto;
    }
}