package com.spendy.gateway.JWT;

import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class JWTReactiveAuthenticationManager implements ReactiveAuthenticationManager {

    private final TokenManager tokenManager;

    public JWTReactiveAuthenticationManager(TokenManager tokenManager) {
        this.tokenManager = tokenManager;
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        Object credentials = authentication.getCredentials();
        if (credentials == null) {
            return Mono.error(new RuntimeException("No JWT token found in credentials"));
        }
        String token = credentials.toString();

        io.jsonwebtoken.Claims claims = tokenManager.verifyToken(token);
        if (claims != null && claims.getSubject() != null) {
            String username = claims.getSubject();
            String role = claims.get("role", String.class);
            List<SimpleGrantedAuthority> authorities = (role != null) 
                    ? Collections.singletonList(new SimpleGrantedAuthority(role)) 
                    : Collections.emptyList();
            return Mono.just(new UsernamePasswordAuthenticationToken(username, token, authorities));
        }
        return Mono.empty();
    }
}