package com.unisannio.emergency.orchestrator.emergency_orchestrator.service.scheduler;

import java.util.*;


class Step {
    private final String name;
    private final Runnable action;
    private final List<Step> dependencies = new ArrayList<>();

    public Step(String name, Runnable action) {
        this.name = name;
        this.action = action;
    }

    public void dependsOn(Step step) {
        dependencies.add(step  );
    }

    public String getName() {
        return name;
    }

    public Runnable getAction() {
        return action;
    }

    public List<Step> getDependencies() {
        return dependencies;
    }
}
