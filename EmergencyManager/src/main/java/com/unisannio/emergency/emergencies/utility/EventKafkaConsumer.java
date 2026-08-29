package com.unisannio.emergency.emergencies.utility;

import com.unisannio.emergency.emergencies.model.IncomingEventDto;
import com.unisannio.emergency.emergencies.service.EmergencyStateService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class EventKafkaConsumer {

    private static final Logger log = LoggerFactory.getLogger(EventKafkaConsumer.class);
    private final EmergencyStateService stateService;

    public EventKafkaConsumer(EmergencyStateService stateService) {
        this.stateService = stateService;
    }

    @KafkaListener(topics = "stream-eventi", groupId = "gse-utility-group")
    public void consumeEvent(IncomingEventDto eventPayload) {
        log.info("Ricevuto evento validato dallo stream: ID {}", eventPayload.getEventId());
        try {
            stateService.handleIncomingEvent(eventPayload);
        } catch (Exception e) {
            log.error("Errore durante l'elaborazione dell'evento {}", eventPayload.getEventId(), e);
        }
    }
}