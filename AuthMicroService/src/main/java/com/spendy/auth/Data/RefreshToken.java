package com.spendy.auth.Data;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "token")
    private String token;

    @Column(name = "username")
    private String username;

    @Column(name = "expiryDate")
    private LocalDateTime expiryDate;

    public RefreshToken() {}

    public RefreshToken(String token, String username, LocalDateTime expiryDate) {
        this.token = token;
        this.username = username;
        this.expiryDate = expiryDate;
    }

    public String getToken() { return token; }
    public String getUsername() { return username; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
}
