package com.unisannio.emergency.orchestrator.emergency_orchestrator.service.executor;

import java.util.List;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.client.RestClient;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Capability;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.EmergencyService;

public class CapabilityResolver {
    
    private RestClient registryClient;
    private RestClient serviceClient;
    private List<EmergencyService> emergencyServices;
    
    public CapabilityResolver(RestClient registryClient, RestClient serviceClient) {
        this.registryClient = registryClient;
        this.serviceClient = serviceClient;

        //@TODO: RIMUOVERE è PER "TESTING"
        this.serviceClient = RestClient.builder()
                .baseUrl("http://service-registry")
                .build();
        //chiama il registro
        //riceve tutti gli endpoint e metadati per la data caability
        //le ordina in base ad uno strategy
        //passa la lista all'executor{
    }
    

    public void resolveCapability(Capability capability) {
        
        emergencyServices = getServices(capability.capabilityName());
        emergencyServices = fakeSorter(emergencyServices); //losign original list
        executor(emergencyServices);            
    
  
     
    }

    private List<EmergencyService> getServices(String capabilityName) {
        return emergencyServices = registryClient.get()
                .uri("/services")
                .retrieve()
                .body(new ParameterizedTypeReference<
                        List<EmergencyService>>() {});
       
    }

    private boolean executor(List<EmergencyService> services) {
        for(EmergencyService emergencyService : services) {
            serviceClient.invoke(emergencyService.endpoint());
        }
        return true;
    }
    
    private List<EmergencyService> fakeSorter(List<EmergencyService> services) {
        //sort the list itself
        return services;
    }

    public static void main(String[] args) {
        Capability capability = new Capability("FakeCapability");
        Capability fire = new Capability("FIRE_STATION");
        Capability accident = new Capability("ACCIDENT_RESPONSE");
        Capability suppression = new Capability("FIRE_SUPPRESSION");
        
        CapabilityResolver resolver = new CapabilityResolver(null,null);
        resolver.resolveCapability(capability);
        resolver.resolveCapability(fire);
        resolver.resolveCapability(accident);
        resolver.resolveCapability(suppression);
    }

    

}
