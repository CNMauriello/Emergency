package com.unisannio.emergency.registry.utility;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class HeartbeatManager {
    // Mappa in memoria: Service ID -> Ultimo contatto
    private final ConcurrentHashMap<Long, LocalDateTime> lastContacts = new ConcurrentHashMap<>();

    public void updateHeartbeat(Long serviceId) {
        lastContacts.put(serviceId, LocalDateTime.now());
    }

    public LocalDateTime getLastContact(Long serviceId) {
        return lastContacts.get(serviceId);
    }

    // (Opzionale) Metodo per ottenere la mappa e controllare i servizi scaduti
    public ConcurrentHashMap<Long, LocalDateTime> getAllHeartbeats() {
        return lastContacts;
    }
}