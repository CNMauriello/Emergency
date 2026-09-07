package com.unisannio.emergency.emergencies.persistance.repository;

import com.unisannio.emergency.emergencies.persistance.Emergency;
import com.unisannio.emergency.emergencies.model.EmergencyStatus; // Assicurati di importare l'Enum
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmergencyRepository extends JpaRepository<Emergency, Long> {

    Optional<Emergency> findByEventId(String eventId);

    @Query("SELECT e FROM Emergency e WHERE e.status <> :closedStatus AND e.eventType = :eventType " +
            "AND ABS(e.latitude - :lat) < 0.005 AND ABS(e.longitude - :lon) < 0.005")
    List<Emergency> findActiveEmergenciesNearby(
            @Param("eventType") String eventType,
            @Param("lat") double lat,
            @Param("lon") double lon,
            @Param("closedStatus") EmergencyStatus closedStatus // <-- Tipo aggiornato a Enum
    );
}