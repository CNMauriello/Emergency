# FARO Infrastructure Agent Rules

Queste regole sono da applicare globalmente nello sviluppo dei microservizi del progetto FARO.

## 1. Audit Logging
- Tutte le operazioni critiche degli operatori e i login devono essere tracciate su un DB locale.
- Il tracciamento va effettuato in modalità append-only su entità come `AuditLog`. Nessun record di audit log deve mai essere aggiornato o cancellato (immutabilità).

## 2. Unit Testing & MockMvc
- È obbligatorio automatizzare la scrittura di test unitari per i Controller (BFF) generati.
- Usa `JUnit 5` e `MockMvc` per coprire i flussi di login, simulando/mockando le chiamate HTTP esterne (es. `WebClient` verso AuthMicroService).
- Assicurati che i flussi di errore (401, 403, 404, 500) siano anch'essi coperti.
