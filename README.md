# FARO (First Alert and Response Orchestration) - Sottosistema di Orchestrazione

Il **Sottosistema di Orchestrazione** costituisce il motore decisionale ed esecutivo della piattaforma FARO per la gestione delle emergenze urbane in ambito Smart City. Il suo obiettivo primario è governare il ciclo di vita completo di un'emergenza, dalla ricezione dell'evento validato fino all'ingaggio delle risorse operative e all'isolamento dell'area, coordinando in modo asincrono i sottosistemi verticali che erogano le singole capacità (gestione risorse, comunicazioni, evacuazione).

## Caratteristiche Principali
* **Esecuzione governata**: Mantiene la conoscenza dei piani operativi (workflow BPMN) associati a ciascuna combinazione di categoria e gravità dell'evento.
* **Late Binding e Fallback**: Risolve a runtime gli endpoint concreti dei servizi del territorio, gestendo ritentativi e indisponibilità tramite circuit breaker.
* **Human-in-the-loop**: Quando l'automatismo esaurisce le proprie policy, cede il controllo all'operatore di sala (forzature, salti, interruzioni) garantendo la tracciabilità legale su log immutabile.

## Architettura e Microservizi
Il sistema adotta un'architettura a microservizi con orchestrazione centralizzata (pattern database-per-service):
* **Gestore stato emergenze (GSE)**: Nodo di frontiera. Consuma lo Stream eventi da Kafka partizionato per geohash, deduplica le segnalazioni e gestisce la macchina a stati dell'emergenza.
* **Orchestratore emergenza (ORC)**: Motore decisionale (Spring Boot + Camunda embedded). Recupera il piano, istanzia l'esecuzione ed esegue i task coordinando i vari componenti.
* **Gestore WorkFlow (GWF)**: Custodisce nel DB Workflow le definizioni BPMN dei piani operativi e le loro associazioni.
* **Binder (BND)**: Proxy che realizza il *late binding* interrogando il registro, ordinando le risorse e gestendo iterativamente i fallimenti di rete (policy di fallback).
* **Gestore Servizi (GSV)**: Registro attivo dei servizi del territorio con meccanismo di heartbeat e discovery.
* **Gestore operatori di sala (GOS)**: Backend-for-Frontend (BFF) per la UI. Gestisce il locking pessimistico sull'emergenza e l'audit delle operazioni manuali.
* **UI Operatore di sala**: Client Web per la sala operativa, che visualizza l'avanzamento dei task e fornisce i form di intervento manuale.

## Architettura e Microservizi
Il progetto adotta un'architettura a microservizi con orchestrazione centralizzata. La repository contiene i seguenti moduli principali:

*   **`Orchestrator`**: Il nucleo decisionale basato su Spring Boot e Camunda BPMN 2.0. Gestisce l'esecuzione dei piani operativi in risposta alle emergenze.
*   **`EmergencyManager`**: Frontiera della catena di orchestrazione. Consuma lo Stream eventi (via Kafka), deduplica le segnalazioni e gestisce la macchina a stati dell'emergenza.
*   **`BinderService`**: Realizza il *late binding*. Risolve a runtime gli endpoint concreti dei servizi del territorio da ingaggiare applicando policy di fallback e circuit breaker.
*   **`RegistryService`**: Registro dei servizi del territorio con pattern heartbeat. Espone API per la registrazione, l'aggiornamento e la discovery delle capability.
*   **`ui-registry`**: Interfaccia Web per la sala operativa, che permette il monitoraggio in tempo reale, la visualizzazione dei workflow e l'ingaggio manuale delle risorse.
*   **`GenericServiceStub`**: Stub (Node.js) utilizzato per simulare le API dei servizi esterni del territorio durante lo sviluppo e i test.

*(Nota: L'infrastruttura globale comprende ulteriori componenti logici come il Gestore Segnalazioni, l'Analizzatore Trend e il Modulo ML, impiegati nella fase di stream processing e rilevamento).*


## Stack Tecnologico
* **Backend**: Java 21, Spring Boot
* **Orchestrazione Processi**: Camunda BPMN 2.0 (embedded nell'Orchestratore)
* **Message Broker & Event Streaming**: Apache Kafka (pub/sub per lo stream eventi)
* **Database**: MySQL via JDBC (DB Emergenze, DB Workflow, DB Operatori di sala, Registro servizi)
* **Connettori**: HTTP / REST (application/json) per le comunicazioni sincrone.
* **Frontend Web / Mobile**: Node.js / HTML / CSS / Tailwind (Dashboard Operatori)

## Configurazione
Per configurare correttamente l'ambiente, è necessario creare un file `.env` nella root del progetto. Di seguito le principali variabili di configurazione supportate:

### Database (MySQL)
* `DB_HOST`: Host del database MySQL (default: `localhost`)
* `DB_PORT`: Porta di connessione (default: `3306`)
* `DB_USERNAME`: Username del database
* `DB_PASSWORD`: Password dell'utente

### Sicurezza (JWT)
* `JWT_SECRET`: Chiave segreta utilizzata per firmare e verificare i token JWT
* `JWT_EXPIRATION`: Durata di validità del token in millisecondi (es. `3600000` per 1 ora)

### API Gateway & CORS
* `GATEWAY_URL`: URL dell'API Gateway
* `CORS_ALLOWED_ORIGINS`: Origini consentite per le richieste dal frontend (es. `http://localhost:5173`)

### Microservizi
Indirizzi base per la comunicazione interna tra i microservizi:
* `REGISTRY_SERVICE_URL`
* `BINDER_SERVICE_URL`
* `ORCHESTRATOR_SERVICE_URL`
* `EMERGENCY_SERVICE_URL`
* `OPERATOR_SERVICE_URL`
* `AUTH_INTERNAL_URL`
* `MOCK_SERVICE_URL`

### Indirizzi specifici e Webhooks
* `BINDER_CANDIDATES_URL`: Endpoint per il calcolo dei candidati
* `OPERATOR_ESCALATIONS_URL`: Endpoint per gestire l'escalation manuale
* `ESCALATION_WEBHOOK_URL`: Webhook per notificare le escalation

### Camunda 8 (Orchestrazione)
* `CAMUNDA_GRPC_ADDRESS`: Indirizzo gRPC di Camunda (default: `http://localhost:26500`)
* `CAMUNDA_REST_ADDRESS`: Indirizzo REST API di Camunda (default: `http://localhost:8080`)

### Kafka e Storage
* `KAFKA_BOOTSTRAP_SERVERS`: Indirizzo del broker Kafka (default: `localhost:9092`)
* `WORKFLOW_STORAGE_PATH`: Percorso di archiviazione locale per le definizioni BPMN (es. `src/main/resources/`)

## Team
Progetto realizzato per la **CINI Smart City University Challenge 2026** (co-located with I-Cities 2026).

**Partecipanti:**
* Giuseppe Riccio
* Lucia Simeone
* Carlo Nicolò Mauriello
