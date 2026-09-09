package com.spendy.auth.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

// @Configuration (Commentato per evitare CORS duplicati col Gateway)
public class CorsGlobalConfiguration {

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins}")
    private String corsAllowedOrigins;

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        if (corsAllowedOrigins != null) {
            for (String origin : corsAllowedOrigins.split(",")) {
                corsConfig.addAllowedOrigin(origin.trim());
            }
        }
        corsConfig.addAllowedMethod("*");
        corsConfig.addAllowedHeader("*");
        corsConfig.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return new CorsFilter(source);
    }
}

