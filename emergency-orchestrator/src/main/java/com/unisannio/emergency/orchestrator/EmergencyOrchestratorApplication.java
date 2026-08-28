package com.unisannio.emergency.orchestrator.emergency_orchestrator.delegates;

import org.camunda.bpm.engine.RuntimeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class EmergencyOrchestratorApplication implements CommandLineRunner {

    @Autowired
    private RuntimeService runtimeService;

    public static void main(String[] args) {
        SpringApplication.run(EmergencyOrchestratorApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Inizio Test Locale: Find Capability Provider ===");

        // 1. Prepariamo la mappa 'event' richiesta dal FindCapabilityProvidersDelegate
        Map<String, Object> event = new HashMap<>();
        event.put("latitude", 40.8518);
        event.put("longitude", 14.2681);
        // Aggiungi qui altri campi necessari all'evento

        // 2. Prepariamo le variabili di processo
        Map<String, Object> variables = new HashMap<>();
        variables.put("event", event);
        variables.put("requiredCapability", "Ambulance");

        try {
            // 3. Avvio del processo tramite l'ID definito nel file Find Capability Provider.bpmn
            runtimeService.startProcessInstanceByKey("Process_0t95rly", variables);

            System.out.println("=== Test Avviato con Successo! Controlla i log dei delegate ===");
        } catch (Exception e) {
            System.err.println("Errore durante l'avvio del test: " + e.getMessage());
        }
    }
}