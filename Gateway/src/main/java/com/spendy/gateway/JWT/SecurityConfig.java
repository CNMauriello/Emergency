package com.spendy.gateway.JWT;

import com.sun.research.ws.wadl.HTTPMethods;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http,
                                                         JWTAuthenticationFilter jwtAuthenticationFilter) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .cors(cors -> cors.configurationSource(exchange -> {
                    org.springframework.web.cors.CorsConfiguration config = new org.springframework.web.cors.CorsConfiguration();
                    config.addAllowedOrigin("http://localhost:5173");
                    config.addAllowedMethod("*");
                    config.addAllowedHeader("*");
                    config.setAllowCredentials(true);
                    return config;
                }))
                .authorizeExchange(exchange -> exchange
                        .pathMatchers(HttpMethod.OPTIONS).permitAll()
                        // Gateway
                        .pathMatchers(HttpMethod.POST, "/gateway/generate-token").permitAll()
                        .pathMatchers(HttpMethod.POST, "/gateway/verify-token").permitAll()
                        .pathMatchers(HttpMethod.GET,"/").permitAll()
                        // Auth
                        .pathMatchers(HttpMethod.GET,"/api/auth/profile").authenticated()
                        .pathMatchers(HttpMethod.GET,"/api/auth/updateProfile").authenticated()
                        .pathMatchers("/api/auth/**").permitAll()
                        // Emergency Manager
                        .pathMatchers("/api/emergencies", "/api/emergencies/**").hasAnyAuthority("ROLE_USER", "ROLE_ROOM_OPERATOR")
                        // Mock
                        .pathMatchers( "/{host}/api/**").hasAnyAuthority( "ROLE_ROOM_OPERATOR")
                        .pathMatchers("/api/stub_service").permitAll()
                        // Orchestrator
                        .pathMatchers("/api/emergency-triggers").permitAll()
                        .pathMatchers("/api/process-instances/**").permitAll()
                        .pathMatchers("/api/escalations/{ticketId}/resolve").permitAll()
                        .pathMatchers("/api/workflows", "/api/workflows/**").hasAnyAuthority("ROLE_WORKFLOW_EXPERT", "ROLE_ROOM_OPERATOR")
                        //Operatore dei servizi
                        .pathMatchers(HttpMethod.PATCH, "/api/services/{id}").hasAnyAuthority("ROLE_SERVICE_OPERATOR", "ROLE_ROOM_OPERATOR")
                        .pathMatchers(HttpMethod.POST, "/api/services").hasAnyAuthority("ROLE_SERVICE_OPERATOR", "ROLE_ROOM_OPERATOR")
                        .pathMatchers(HttpMethod.GET, "/api/services").hasAnyAuthority("ROLE_SERVICE_OPERATOR", "ROLE_ROOM_OPERATOR")
                        .pathMatchers("/api/capabilities").hasAnyAuthority("ROLE_SERVICE_OPERATOR", "ROLE_ROOM_OPERATOR")
                        .pathMatchers("/api/services/**").hasAnyAuthority("ROLE_SERVICE_OPERATOR", "ROLE_ROOM_OPERATOR")
                        // Operatore di sala
                        .pathMatchers(HttpMethod.POST, "/api/operators/login").permitAll()
                        .pathMatchers(HttpMethod.GET, "/api/operators/escalations/active").hasAnyAuthority("ROLE_ROOM_OPERATOR")
                        .pathMatchers(HttpMethod.GET, "/api/operators/escalations/{ticketId}").hasAnyAuthority("ROLE_ROOM_OPERATOR")
                        .pathMatchers(HttpMethod.POST, "/api/operators/escalations/{ticketId}/resolve").hasAnyAuthority("ROLE_ROOM_OPERATOR")
                        .anyExchange().hasAuthority("ROLE_ROOM_OPERATOR")
                )
                .addFilterBefore(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }


}