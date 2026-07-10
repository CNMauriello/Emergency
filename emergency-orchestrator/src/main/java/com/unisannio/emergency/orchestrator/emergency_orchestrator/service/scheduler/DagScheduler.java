package com.unisannio.emergency.orchestrator.emergency_orchestrator.service.scheduler;

import java.util.Map;
import java.util.concurrent.*;

public class DagScheduler {

    private final ExecutorService executor;
    private final Map<Step, CompletableFuture<Void>> futures = new ConcurrentHashMap<>();

    public DagScheduler(int threads) {
        executor = Executors.newFixedThreadPool(threads);
    }

    public CompletableFuture<Void> schedule(Step step) {
        return futures.computeIfAbsent(step, this::createFuture);
    }

    private CompletableFuture<Void> createFuture(Step step) {

        CompletableFuture<?>[] deps = step.getDependencies()
                .stream()
                .map(this::schedule)
                .toArray(CompletableFuture[]::new);

        return CompletableFuture
                .allOf(deps)
                .thenRunAsync(() -> {
                    System.out.println(
                        Thread.currentThread().getName() +
                        " -> Eseguo " + step.getName());

                    step.getAction().run();
                }, executor);
    }

    public void shutdown() {
        executor.shutdown();
    }
}
