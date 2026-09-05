package com.spendy.gateway;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
@RestController
@SpringBootApplication(scanBasePackages = "com.spendy.gateway")
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @GetMapping("/")
    public Mono<String> home() {
        return Mono.just("🟢 Spendy Gateway è attivo e funzionante! (V. Finale)");
    }

    @org.springframework.context.annotation.Bean
    public org.springframework.cloud.gateway.route.RouteLocator customRouteLocator(org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder builder) {
        return builder.routes()

                .route("AuthMicroService", r -> r
                        .path("/api/auth/**")
                        .uri("http://localhost:8088"))

                .route("RegistryService", r -> r
                        .path("/api/capabilities/**", "/api/services/**")
                        .uri("http://localhost:8081"))

                .route("Orchestrator", r -> r
                        .path("/api/workflows/**", "/api/emergency-triggers/**", "/api/escalations/**")
                        .uri("http://localhost:8083"))

                .route("Emergency", r -> r
                        .path("/api/emergencies/**")
                        .uri("http://localhost:8084"))

                .route("Operator", r -> r
                        .path("/api/operators/**")
                        .uri("http://localhost:8087"))
                .build();
    }
}