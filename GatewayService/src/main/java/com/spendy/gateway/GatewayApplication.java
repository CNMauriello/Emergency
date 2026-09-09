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

    @org.springframework.beans.factory.annotation.Value("${gateway.routes.auth.url}")
    private String authUrl;

    @org.springframework.beans.factory.annotation.Value("${gateway.routes.registry.url}")
    private String registryUrl;

    @org.springframework.beans.factory.annotation.Value("${gateway.routes.orchestrator.url}")
    private String orchestratorUrl;

    @org.springframework.beans.factory.annotation.Value("${gateway.routes.emergency.url}")
    private String emergencyUrl;

    @org.springframework.beans.factory.annotation.Value("${gateway.routes.operator.url}")
    private String operatorUrl;

    @org.springframework.beans.factory.annotation.Value("${gateway.routes.mock.url}")
    private String mockUrl;

    @org.springframework.context.annotation.Bean
    public org.springframework.cloud.gateway.route.RouteLocator customRouteLocator(org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder builder) {
        return builder.routes()

                .route("AuthMicroService", r -> r
                        .path("/api/auth/**")
                        .uri(authUrl))

                .route("RegistryService", r -> r
                        .path("/api/capabilities/**", "/api/services/**")
                        .uri(registryUrl))

                .route("Orchestrator", r -> r
                        .path("/api/workflows/**", "/api/emergency-triggers/**", "/api/escalations/**", "/api/process-instances/**")
                        .uri(orchestratorUrl))

                .route("Emergency", r -> r
                        .path("/api/emergencies/**")
                        .uri(emergencyUrl))

                .route("Operator", r -> r
                        .path("/api/operators/**", "/api/audit", "/api/audit/**")
                        .uri(operatorUrl))
                .route("Mock", r ->r
                        .path( "/{host}/api/**", "/api/evacuation_service", "/api/dispatch", "/api/military-intervention", "/api/health_service")
                        .uri(mockUrl))
                .build();
    }
}