package com.spendy.operator.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "operatori")
public class Operatore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "auth_user_id", unique = true, nullable = false)
    private Long authUserId;

    @Column(name = "nome", nullable = false)
    private String nome;

    @Column(name = "cognome", nullable = false)
    private String cognome;

    @Enumerated(EnumType.STRING)
    @Column(name = "ruolo", nullable = false)
    private RuoloEnum ruolo;

    @Enumerated(EnumType.STRING)
    @Column(name = "stato", nullable = false)
    private StatoEnum stato;

    public Operatore() {
    }

    public Operatore(Long authUserId, String nome, String cognome, RuoloEnum ruolo, StatoEnum stato) {
        this.authUserId = authUserId;
        this.nome = nome;
        this.cognome = cognome;
        this.ruolo = ruolo;
        this.stato = stato;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAuthUserId() {
        return authUserId;
    }

    public void setAuthUserId(Long authUserId) {
        this.authUserId = authUserId;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCognome() {
        return cognome;
    }

    public void setCognome(String cognome) {
        this.cognome = cognome;
    }

    public RuoloEnum getRuolo() {
        return ruolo;
    }

    public void setRuolo(RuoloEnum ruolo) {
        this.ruolo = ruolo;
    }

    public StatoEnum getStato() {
        return stato;
    }

    public void setStato(StatoEnum stato) {
        this.stato = stato;
    }
}
