# Emergency Project Kubernetes Deployment (Rancher)

Questo documento spiega come eseguire il deployment del progetto Emergency su Kubernetes, in particolare su un ambiente gestito da Rancher.

## 1. Architettura Kubernetes

L'architettura generata riproduce l'ambiente Docker Compose in modo nativo su Kubernetes, introducendo concetti come Deployments, StatefulSets e Services:

* **Namespace**: Tutte le risorse vivono nel namespace `assd-orchestration`.
* **Configurazione**: Variabili d'ambiente separate tra `ConfigMap` (non sensibili) e `Secret` (credenziali).
* **Storage**: Database e broker (MySQL, Elasticsearch) ed il motore di Camunda utilizzano `StatefulSet` e `PersistentVolumeClaim` (PVC) per garantire la persistenza dei dati. Il broker Kafka è invece un servizio condiviso esterno al progetto, residente nel namespace `kafka-shared`.
* **Microservizi**: Sono tutti `Deployment` stateless.
* **Job di Seeding**: Il job `db-seeder` si avvia e attende che MySQL sia pronto, creando le tabelle e inserendo i dati (es. tramite script SQL).
* **Networking**: Tutti i servizi comunicano internamente tramite i `Service` (es. `mysql-db:3306`, `camunda:26500`).

## 2. Prerequisiti

* Cluster Kubernetes accessibile (es. tramite Rancher o `kubectl`).
* Un Container Registry dove caricare le immagini Docker dei microservizi (es. Docker Hub, GitHub Container Registry, GitLab Registry).
* Le immagini Docker del progetto devono essere "buildate" e pubblicate (pushate) sul Registry.

## 3. Build & Push delle Immagini Docker

Poiché Kubernetes non utilizza le immagini presenti sulla tua macchina locale (Docker Daemon), devi pubblicarle in un Registry remoto.
Sostituisci `emergency-registry` con il nome del tuo registry (es. `tuoutente-dockerhub`).

```bash
# Esempio: Gateway Service
docker build -t khondor/gateway-service:latest -f GatewayService/Dockerfile .
docker push khondor/gateway-service:latest

# Procedere analogamente per tutti gli altri microservizi:
# - registry-service
# - auth-service
# - emergency-service
# - operator-service
# - mock-service
# - orchestrator-binder
# - ui

# Per db-seeder (build con Dockerfile ad hoc)
docker build -t emergency-registry/db-seeder:latest -f k8s/applications/db-seeder/Dockerfile .
docker push emergency-registry/db-seeder:latest
```

*Nota*: Se decidi di usare un registry privato, assicurati di configurare l'`imagePullSecret` nel cluster Kubernetes per autorizzare il download.

## 4. Configurazione Secrets

Il file `k8s/config/secrets.yaml` contiene password in formato testo per comodità (tramite `stringData`). **In produzione non versionare mai password in chiaro in Git.** 
Assicurati di personalizzare questi valori prima di fare apply o applicali manualmente tramite l'interfaccia UI di Rancher.

## 5. Deployment tramite `kubectl`

Esegui il deploy rispettando rigorosamente l'ordine seguente. Attendi che i pod di un gruppo siano pronti (`Running`) prima di procedere al gruppo successivo.

**Fase 1: Namespace e Configurazione**
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config/
```

**Fase 2: Infrastruttura (Stateful)**
```bash
kubectl apply -f k8s/infrastructure/mysql/
kubectl apply -f k8s/infrastructure/elasticsearch/
```
*Attendi che mysql-db ed elasticsearch siano in stato RUNNING (Ready 1/1).*

**Fase 3: Camunda (Orchestrator Engine)**
```bash
kubectl apply -f k8s/camunda/
```
*Attendi che Camunda sia pronto. Camunda dipende da Elasticsearch.*

**Fase 4: Microservizi e UI**
```bash
kubectl apply -f k8s/applications/registry-service/
kubectl apply -f k8s/applications/auth-service/
kubectl apply -f k8s/applications/gateway-service/
kubectl apply -f k8s/applications/emergency-service/
kubectl apply -f k8s/applications/operator-service/
kubectl apply -f k8s/applications/mock-service/
kubectl apply -f k8s/applications/orchestrator-binder/
kubectl apply -f k8s/applications/ui/
```

**Fase 5: Database Seeder (Popolamento Dati)**
```bash
kubectl apply -f k8s/applications/db-seeder/
```
Questo creerà un Job. Verifica il log del Job per assicurarti che il database sia stato popolato correttamente.

## 6. Accesso all'Applicazione (Architettura Ingress)

Tutti i microservizi (inclusi Gateway e UI) sono configurati come `ClusterIP` e non esposti direttamente all'esterno tramite NodePort o LoadBalancer. 

L'accesso avviene esclusivamente tramite un Ingress Controller (es. Nginx). L'Ingress instrada il traffico nel seguente modo:
- **Frontend (UI)**: Accessibile alla root `/` (inoltrato a `emergency-ui:5173`)
- **Backend API (Gateway)**: Accessibile tramite il prefisso `/api` (inoltrato a `gateway-service:8090`)

Per esporre l'applicazione, applica l'Ingress:

```bash
kubectl apply -f k8s/ingress/ingress.yaml
```

**Verifica dell'Ingress:**
```bash
kubectl get ingress -n assd-orchestration
```

Una volta assegnato un indirizzo (es. l'IP del nodo Rancher), potrai accedere dal browser a:
`http://<IP_DEL_NODO>/`

*Nota*: Il frontend è stato configurato per utilizzare URL relativi, pertanto le chiamate alle API utilizzeranno in automatico lo stesso origin passando per `/api/...`. Kafka condiviso (su `kafka-shared`) e Camunda non subiscono modifiche o esposizioni.

**Camunda Operate / Tasklist / API:**
Camunda rimane interno al cluster. Per accedervi per finalità di debug/amministrazione usa il port-forward:
```bash
kubectl port-forward svc/camunda 8080:8080 -n assd-orchestration
```
Accessibile all'indirizzo: `http://localhost:8080` (Opera su `http://localhost:8080/operate`)

## 7. Verifica e Troubleshooting

- **Generic HTTP Job Worker (Orchestrator-Binder):** Il servizio orchestrator-binder si connette a Camunda tramite `camunda:26500` (gRPC). Usa `kubectl logs deployment/orchestrator-binder -n assd-orchestration` per verificare che non vi siano eccezioni gRPC.
- **Connessione a Kafka Condiviso:** L'applicativo si aspetta che Kafka sia raggiungibile tramite il namespace condiviso all'indirizzo `kafka.kafka-shared:9092`. Usa un pod temporaneo in `assd-orchestration` per diagnosticare problemi DNS (es. `kubectl run netshoot --rm -i --tty --image nicolaka/netshoot -n assd-orchestration -- nslookup kafka.kafka-shared`).
- **Risoluzione DNS interna:** Se un servizio non riesce a parlare con un altro (es. gateway non vede auth), controlla gli URL configurati nella ConfigMap. Il formato corretto è `http://<nome-service>:8080`.
- **Risorse (CPU/Memory):** Nei manifest sono stati forniti Request/Limit di base. Per macchine universitarie ristrette, potresti dover abbassare la memoria di Kafka e Camunda se i nodi sono in sofferenza (`OOMKilled`).
