# FARO (First Alert and Response Orchestration) - Sottosistema di Orchestrazione

Il **Sottosistema di Orchestrazione** costituisce il motore decisionale ed esecutivo della piattaforma FARO per la gestione delle emergenze urbane in ambito Smart City. Il suo obiettivo primario è governare il ciclo di vita completo di un'emergenza, dalla ricezione dell'evento validato fino all'ingaggio delle risorse operative e all'isolamento dell'area, coordinando in modo asincrono i sottosistemi verticali che erogano le singole capacità (gestione risorse, comunicazioni, evacuazione).

## Caratteristiche Principali
* **Esecuzione governata**: Mantiene la conoscenza dei piani operativi (workflow BPMN) associati a ciascuna combinazione di categoria e gravità dell'evento.
* **Late Binding e Fallback**: Risolve a runtime gli endpoint concreti dei servizi del territorio, gestendo ritentativi e indisponibilità tramite circuit breaker.
* **Human-in-the-loop**: Quando l'automatismo esaurisce le proprie policy, cede il controllo all'operatore di sala (forzature, salti, interruzioni) garantendo la tracciabilità legale su log immutabile.

## Architettura
Il sistema adotta un'architettura a microservizi con orchestrazione centralizzata (pattern database-per-service):
* **Gestore stato emergenze (GSE)**: Nodo di frontiera. Consuma lo Stream eventi da Kafka partizionato per geohash, deduplica le segnalazioni e gestisce la macchina a stati dell'emergenza.
* **Orchestratore emergenza (ORC)**: Motore decisionale (Spring Boot + Camunda embedded). Recupera il piano, istanzia l'esecuzione ed esegue i task coordinando i vari componenti.
* **Gestore WorkFlow (GWF)**: Custodisce nel DB Workflow le definizioni BPMN dei piani operativi e le loro associazioni.
* **Binder (BND)**: Proxy che realizza il *late binding* interrogando il registro, ordinando le risorse e gestendo iterativamente i fallimenti di rete (policy di fallback).
* **Gestore Servizi (GSV)**: Registro attivo dei servizi del territorio con meccanismo di heartbeat e discovery.
* **Gestore operatori di sala (GOS)**: Backend-for-Frontend (BFF) per la UI. Gestisce il locking pessimistico sull'emergenza e l'audit delle operazioni manuali.
* **UI Operatore di sala**: Client Web per la sala operativa, che visualizza l'avanzamento dei task e fornisce i form di intervento manuale.

## Microservizi
Il progetto è composto da diversi microservizi, ognuno con una responsabilità specifica:

* **GatewayService**: API Gateway centrale che espone i servizi all'esterno e instrada le richieste.
* **AuthMicroService**: Gestisce l'autenticazione degli utenti e la generazione/validazione dei token JWT.
* **EmergencyService**: Gestisce il dominio delle emergenze, salvandone lo stato e i dati associati nel database.
* **OrchestratorService**: Si occupa di orchestrare i flussi di risposta alle emergenze eseguendo i modelli BPMN in integrazione con Camunda.
* **BinderService**: Fornisce la logica per trovare e associare (binding) le risorse, i servizi e le "capabilities" migliori per una determinata emergenza.
* **RegistryService**: Agisce come un registro per mantenere traccia dei servizi e delle risorse disponibili tramite meccanismi di heartbeat.
* **OperatorService**: Gestisce le interazioni per gli operatori umani, incluse le logiche di escalation e la gestione dei ticket.
* **MockService**: Utilizzato per simulare servizi esterni o comportamenti necessari per i test del sistema.
* **UI**: Frontend sviluppato in React per l'interazione da parte degli utenti e degli operatori.


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

## Configurazione dell'Ambiente (`.env`)

Per il corretto avvio del sistema, è necessario creare un file denominato `.env` nella directory principale del progetto. Questo file serve a definire le variabili d'ambiente per il database, la sicurezza e la comunicazione tra i servizi.

Ecco come configurare le diverse sezioni del file `.env`:

### 1. Database (MySQL)
Devi impostare le credenziali principali di connessione al database:
* **Host e Porte:** Specifica il nome dell'host interno (`DB_HOST`, tipicamente il nome del container es: `mysql-db`) e la porta di base (`DB_PORT`, es: `3306`). Definisci anche l'host e la porta esposti verso l'esterno (`DB_EXPOSED_HOST` e `DB_EXPOSED_PORT`) per permettere l'esecuzione di script SQL.
* **Credenziali:** Imposta username (`DB_USERNAME`), password dell'utente (`DB_PASSWORD`) e la password di root (`DB_ROOT_PASSWORD`) per l'inizializzazione del database.

### 2. Sicurezza (JWT e CORS)
* **JWT:** Inserisci una stringa sicura in `JWT_SECRET` per la firma dei token e imposta il tempo di validità in millisecondi in `JWT_EXPIRATION` (ad esempio `3600000` per un'ora).
* **CORS:** Utilizza la variabile `CORS_ALLOWED_ORIGINS` per specificare l'URL del tuo frontend (ad esempio l'ambiente locale sulla porta `5173`), in modo che il Gateway accetti le richieste dalla UI.

### 3. URL dei Servizi Interni ed Endpoint
Ogni microservizio deve conoscere la posizione degli altri per poter comunicare:
* Definisci gli URL di base per ogni servizio interno assegnando il nome del container e la relativa porta (es. `REGISTRY_SERVICE_URL`, `BINDER_SERVICE_URL`, `GATEWAY_URL`, ecc.).
* Specifica i percorsi esatti per endpoint particolari utilizzati dal sistema, come le URL per le candidature del Binder (`BINDER_CANDIDATES_URL`), per le escalation degli operatori (`OPERATOR_ESCALATIONS_URL`) e per i webhook (`ESCALATION_WEBHOOK_URL`).

### 4. Code, Orchestrazione e Storage
* **Camunda:** Imposta gli indirizzi gRPC e REST (`CAMUNDA_GRPC_ADDRESS` e `CAMUNDA_REST_ADDRESS`) affinché l'Orchestrator possa connettersi al motore Camunda.
* **Kafka:** Specifica il server di bootstrap di Kafka (`KAFKA_BOOTSTRAP_SERVERS`, tipicamente `kafka:9092`) per la gestione degli eventi.
* **Storage BPMN:** Indica il percorso nel container dove l'orchestratore andrà a leggere i file BPMN tramite `WORKFLOW_STORAGE_PATH` (es. `/app/bpmns/`).

## Istruzioni di Avvio e Deploy

Il progetto supporta nativamente due modalità per il deploy: Docker Compose (ideale per sviluppo locale) e Kubernetes (ideale per la produzione).

### Utilizzando Docker
Per un avvio rapido in ambiente locale isolato:
1. Assicurati che il file `.env` sia configurato correttamente nella root.
2. Esegui lo script bash dedicato:
   ```bash
   chmod +x docker-deploy.sh
   ./docker-deploy.sh
   ```
   *(Questo avvierà tutti i container definiti nel file `docker-compose.yml`)*.

### Utilizzando Kubernetes
Per il deploy completo su un cluster K8s:
1. Assicurati di avere il cluster attivo e configurato (es. Minikube o cloud provider).
2. Esegui lo script:
   ```bash
   chmod +x k8s-deploy.sh
   ./k8s-deploy.sh
   ```
   *(Tutti i manifesti per applicazioni, configmap, secrets e ingress si trovano nella cartella `k8s/`)*.

## Team
Progetto realizzato per la **CINI Smart City University Challenge 2026** (co-located with I-Cities 2026).

**Partecipanti:**
* Giuseppe Riccio
* Lucia Simeone
* Carlo Nicolò Mauriello
