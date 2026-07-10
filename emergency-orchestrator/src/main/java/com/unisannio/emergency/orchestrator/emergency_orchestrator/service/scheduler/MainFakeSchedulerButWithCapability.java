package com.unisannio.emergency.orchestrator.emergency_orchestrator.service.scheduler;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Capability;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.service.executor.CapabilityResolver;

public class MainFakeSchedulerButWithCapability {
public static void main(String[] args) {
        Capability capability = new Capability("FakeCapability");
        Capability fire = new Capability("FIRE_STATION");
        Capability accident = new Capability("ACCIDENT_RESPONSE");
        Capability suppression = new Capability("FIRE_SUPPRESSION");
        
        CapabilityResolver resolver = new CapabilityResolver(null,null);

        Step download = new Step(capability.capabilityName(),  () -> resolver.resolveCapability(capability));
        Step parse    = new Step(fire.capabilityName(),        () -> resolver.resolveCapability(fire));
        Step validate = new Step(accident.capabilityName(),    () -> resolver.resolveCapability(accident));
        Step save     = new Step(suppression.capabilityName(), () -> resolver.resolveCapability(suppression));

        parse.dependsOn(download);
        validate.dependsOn(download);
        save.dependsOn(parse);
        save.dependsOn(validate);

        DagScheduler scheduler = new DagScheduler(4);

        scheduler.schedule(save).join();

        scheduler.shutdown();

        System.out.println("Workflow completato.");
    }


    

}
