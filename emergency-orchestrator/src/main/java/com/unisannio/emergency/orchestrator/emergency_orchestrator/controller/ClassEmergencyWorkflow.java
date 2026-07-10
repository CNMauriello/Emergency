package com.unisannio.emergency.orchestrator.emergency_orchestrator.controller;

import java.util.List;

import org.springframework.stereotype.Controller;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyEvent;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyService;


import com.unisannio.emergency.orchestrator.emergency_orchestrator.util.RankingStrategy;

@Controller
public class ClassEmergencyWorkflow {
   
    private RankingStrategy strategy;
  

    public ClassEmergencyWorkflow(RankingStrategy strategy) {
      this.strategy = strategy;
        
    }

    
    public final void execute(EmergencyEvent event){
        validate(event); //
       
        /*ServiceResolution resolution = resolver.resolve(event); //Qua prende il workflow (Factory o db)
        EmergencyService chosen = strategy.select(workflow.services());   //Qua strategy per prendere dal registry i servizi disponibili (il registry altra classe che gestisce hashmap e Db)
        Scheduler callServices(chosenQueue, chosenParallel); //Chiamata HTTP
        /*
        try {
          callService(chosen, event); //Chiamata HTTP
        }
        catch(UnavaibleService us){
             ExplicitFallbackHandling();
        }
        */
        /*Evacuate(Workflow workflow);
        postProcess(event); // Esempio logging/ */
    }
    
    // STEP FISSI
    private void validate(EmergencyEvent event){}
    private void postProcess(EmergencyEvent event){}
    private void callService(EmergencyService s){            }
    
    //private List<EmergencyService> ExplicitFallbackHandling() (List<EmergencyService> list, EmergencyService s){

    }

