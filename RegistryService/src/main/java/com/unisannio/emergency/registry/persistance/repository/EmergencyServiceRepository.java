package com.unisannio.emergency.registry.persistance.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.data.jpa.repository.Query;
//import org.springframework.data.repository.query.Param;

import com.unisannio.emergency.registry.persistance.EmergencyService;

//Spring Data Repository - Repository Pattern
public interface EmergencyServiceRepository 
        extends JpaRepository<EmergencyService, Long> {

    List<EmergencyService> findDistinctByCapabilities_Name(String name);

    //Oppure si può usare @Query per scrivere la query manualmente, se si vuole più controllo
  /*
    @Query("""
    SELECT DISTINCT si
    FROM EmergencyService si
    JOIN si.capabilities c
    WHERE c.name = :name
    """)
    List<EmergencyService> findByCapability(@Param("name") String name);*/
}