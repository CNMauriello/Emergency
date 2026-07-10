package com.unisannio.emergency.orchestrator.emergency_orchestrator.service.scheduler;

public class FakeSchedulerMain {
public static void main(String[] args) {

        Step download = new Step("Download", () -> sleep(2000));
        Step parse = new Step("Parse", () -> sleep(1000));
        Step validate = new Step("Validate", () -> sleep(1500));
        Step save = new Step("Save", () -> sleep(500));

        parse.dependsOn(download);
        validate.dependsOn(download);
        save.dependsOn(parse);
        save.dependsOn(validate);

        DagScheduler scheduler = new DagScheduler(4);

        scheduler.schedule(save).join();

        scheduler.shutdown();

        System.out.println("Workflow completato.");
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
