#!/bin/bash

set -e

NAMESPACE="assd-orchestration"

export KUBECONFIG="$HOME/.kube/assd.yaml"

echo "========================================"
echo "   KUBERNETES DEPLOY"
echo "========================================"

echo ""
echo "=== CHECK KUBERNETES CONNECTION ==="

kubectl get pods -n "$NAMESPACE" >/dev/null

echo "Kubernetes connection OK"

echo ""
echo "=== CURRENT PODS ==="

kubectl get pods -n "$NAMESPACE"

echo ""
echo "=== DELETE APPLICATION PODS ==="

kubectl delete pod -l app=auth-service \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=emergency-service \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=gateway-service \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=mock-service \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=operator-service \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=registry-service \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=orchestrator-binder \
  -n "$NAMESPACE" \
  --ignore-not-found=true

kubectl delete pod -l app=emergency-ui \
  -n "$NAMESPACE" \
  --ignore-not-found=true

echo ""
echo "=== APPLY CONFIGURATION ==="

kubectl apply \
  -f k8s/config/configmap.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/config/secrets.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== APPLY MYSQL ==="

kubectl apply \
  -f k8s/infrastructure/mysql/configmap.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/infrastructure/mysql/mysql.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== APPLY ELASTICSEARCH ==="

kubectl apply \
  -f k8s/infrastructure/elasticsearch/elasticsearch.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== APPLY CAMUNDA ==="

kubectl apply \
  -f k8s/camunda/camunda.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== WAIT FOR INFRASTRUCTURE ==="

kubectl rollout status \
  statefulset/mysql-db \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status \
  statefulset/elasticsearch \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status \
  statefulset/camunda \
  -n "$NAMESPACE" \
  --timeout=10m

echo ""
echo "=== APPLY APPLICATIONS ==="

kubectl apply \
  -f k8s/applications/auth-service/auth.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/emergency-service/emergency.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/gateway-service/gateway.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/mock-service/mock.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/operator-service/operator.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/registry-service/registry.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/orchestrator-binder/orchestrator-binder.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/applications/ui/ui.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== FORCE IMAGE PULL ==="

kubectl patch deployment auth-service \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment emergency-service \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"emergency-service","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment gateway-service \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"gateway-service","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment mock-service \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"mock-service","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment operator-service \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"operator-service","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment registry-service \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"registry-service","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment orchestrator-binder \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"orchestrator-binder","imagePullPolicy":"Always"}]}}}}'

kubectl patch deployment emergency-ui \
  -n "$NAMESPACE" \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"emergency-ui","imagePullPolicy":"Always"}]}}}}'

echo ""
echo "=== WAIT FOR APPLICATIONS ==="

kubectl rollout status deployment/auth-service \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/emergency-service \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/gateway-service \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/mock-service \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/operator-service \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/registry-service \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/orchestrator-binder \
  -n "$NAMESPACE" \
  --timeout=10m

kubectl rollout status deployment/emergency-ui \
  -n "$NAMESPACE" \
  --timeout=10m

echo ""
echo "=== ALL APPLICATIONS READY ==="

kubectl get pods -n "$NAMESPACE"

echo ""
echo "=== CLEAR APPLICATION DATABASES ==="

DATABASES="auth_db emergency_db operator_db orchestrator_db registry_db"

for DB in $DATABASES; do
  echo ""
  echo "Clearing database: $DB"

  TABLES=$(kubectl exec mysql-db-0 \
    -n "$NAMESPACE" \
    -- mysql \
    -u emergency \
    -p'Emergency123456@' \
    -N \
    -e "SELECT table_name FROM information_schema.tables WHERE table_schema='$DB' AND table_type='BASE TABLE';")

  if [ -n "$TABLES" ]; then
    for TABLE in $TABLES; do
      echo "  TRUNCATE $DB.$TABLE"

      kubectl exec mysql-db-0 \
        -n "$NAMESPACE" \
        -- mysql \
        -u emergency \
        -p'Emergency123456@' \
        -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE \`$DB\`.\`$TABLE\`; SET FOREIGN_KEY_CHECKS=1;"
    done
  else
    echo "  No tables found in $DB"
  fi
done

echo ""
echo "=== DATABASE CLEAR COMPLETED ==="

echo ""
echo "=== VERIFY DATABASES ==="

for DB in $DATABASES; do
  echo ""
  echo "Database: $DB"

  kubectl exec mysql-db-0 \
    -n "$NAMESPACE" \
    -- mysql \
    -u emergency \
    -p'Emergency123456@' \
    -N \
    -e "SELECT CONCAT(table_name, ': ', table_rows, ' rows') FROM information_schema.tables WHERE table_schema='$DB' AND table_type='BASE TABLE';"
done

echo ""
echo "=== POPULATE STATIC DATA ==="

kubectl exec mysql-db-0 \
  -n "$NAMESPACE" \
  -- mysql \
  -u emergency \
  -p'Emergency123456@' \
  -e "

USE registry_db;

INSERT INTO capability (name) VALUES
('SearchAndRescue'),
('FireSuppression'),
('MedicalEmergency'),
('TraumaCare'),
('Ambulance'),
('PoliceIntervention'),
('CrowdControl'),
('DisasterResponse'),
('WaterRescue'),
('HelicopterRescue'),
('HazmatResponse'),
('Evacuation'),
('EmergencyCommunication'),
('MountainRescue'),
('FloodResponse');

INSERT INTO emergency_service
    (avg_latency, current_load, endpoint, latitude, longitude, status, type)
VALUES
(18.5, 32.0, 'http://172.31.0.110:8090/fire-station-napoli.local/api', 40.8518, 14.2681, 'UP', 'FIRE_STATION'),
(25.2, 45.0, 'http://172.31.0.110:8090/fire-station-salerno.local/api', 40.6824, 14.7681, 'UP', 'FIRE_STATION'),
(41.7, 67.0, 'http://172.31.0.110:8090/fire-station-caserta.local/api', 41.0747, 14.3320, 'DEGRADED', 'FIRE_STATION'),
(12.3, 28.0, 'http://172.31.0.110:8090/hospital-napoli.local/api', 40.8522, 14.2685, 'UP', 'HOSPITAL'),
(35.8, 71.0, 'http://172.31.0.110:8090/hospital-salerno.local/api', 40.6782, 14.7653, 'DEGRADED', 'HOSPITAL'),
(15.6, 19.0, 'http://172.31.0.110:8090/hospital-caserta.local/api', 41.0731, 14.3325, 'UP', 'HOSPITAL'),
(22.4, 38.0, 'http://172.31.0.110:8090/police-napoli.local/api', 40.8467, 14.2516, 'UP', 'POLICE'),
(19.8, 52.0, 'http://172.31.0.110:8090/police-salerno.local/api', 40.6810, 14.7680, 'UP', 'POLICE'),
(55.4, 89.0, 'http://172.31.0.110:8090/police-caserta.local/api', 41.0745, 14.3328, 'DEGRADED', 'POLICE'),
(8.7, 14.0, 'http://172.31.0.110:8090/fire-station-pozzuoli.local/api', 40.8231, 14.1216, 'UP', 'FIRE_STATION'),
(29.3, 43.0, 'http://172.31.0.110:8090/hospital-pozzuoli.local/api', 40.8230, 14.1220, 'UP', 'HOSPITAL'),
(17.1, 26.0, 'http://172.31.0.110:8090/police-pozzuoli.local/api', 40.8235, 14.1225, 'UP', 'POLICE'),
(63.2, 92.0, 'http://172.31.0.110:8090/fire-station-avellino.local/api', 40.9140, 14.7920, 'DEGRADED', 'FIRE_STATION'),
(14.9, 22.0, 'http://172.31.0.110:8090/hospital-avellino.local/api', 40.9150, 14.7915, 'UP', 'HOSPITAL'),
(31.5, 61.0, 'http://172.31.0.110:8090/police-avellino.local/api', 40.9145, 14.7925, 'UP', 'POLICE'),
(11.2, 17.0, 'http://172.31.0.110:8090/fire-station-benevento.local/api', 41.1297, 14.7826, 'UP', 'FIRE_STATION'),
(27.6, 48.0, 'http://172.31.0.110:8090/hospital-benevento.local/api', 41.1298, 14.7820, 'UP', 'HOSPITAL'),
(46.8, 76.0, 'http://172.31.0.110:8090/police-benevento.local/api', 41.1300, 14.7830, 'DEGRADED', 'POLICE'),
(9.4, 12.0, 'http://172.31.0.110:8090/fire-station-sorrento.local/api', 40.6263, 14.3758, 'UP', 'FIRE_STATION'),
(21.7, 34.0, 'http://172.31.0.110:8090/hospital-sorrento.local/api', 40.6268, 14.3762, 'UP', 'HOSPITAL');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 1, id FROM capability WHERE name IN ('FireSuppression','SearchAndRescue','HazmatResponse','DisasterResponse');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 2, id FROM capability WHERE name IN ('FireSuppression','SearchAndRescue','WaterRescue','DisasterResponse');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 3, id FROM capability WHERE name IN ('FireSuppression','HazmatResponse','DisasterResponse');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 4, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance','DisasterResponse');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 5, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance','Evacuation');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 6, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 7, id FROM capability WHERE name IN ('PoliceIntervention','CrowdControl','EmergencyCommunication');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 8, id FROM capability WHERE name IN ('PoliceIntervention','CrowdControl','EmergencyCommunication','Evacuation');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 9, id FROM capability WHERE name IN ('PoliceIntervention','CrowdControl','EmergencyCommunication');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 10, id FROM capability WHERE name IN ('FireSuppression','WaterRescue','SearchAndRescue');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 11, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance','WaterRescue');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 12, id FROM capability WHERE name IN ('PoliceIntervention','CrowdControl','EmergencyCommunication');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 13, id FROM capability WHERE name IN ('FireSuppression','MountainRescue','SearchAndRescue');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 14, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance','MountainRescue');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 15, id FROM capability WHERE name IN ('PoliceIntervention','EmergencyCommunication','MountainRescue');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 16, id FROM capability WHERE name IN ('FireSuppression','DisasterResponse','FloodResponse');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 17, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance','DisasterResponse');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 18, id FROM capability WHERE name IN ('PoliceIntervention','CrowdControl','Evacuation');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 19, id FROM capability WHERE name IN ('FireSuppression','WaterRescue','SearchAndRescue');

INSERT INTO emergency_service_capability (service_instance_id, capability_id)
SELECT 20, id FROM capability WHERE name IN ('MedicalEmergency','TraumaCare','Ambulance','WaterRescue','HelicopterRescue');

USE orchestrator_db;

INSERT INTO workflows (process_key, event_type, severity, version, enabled) VALUES
('FIRE_CRITICAL', 'FIRE', 'CRITICAL', 1, true),
('FIRE_HIGH', 'FIRE', 'HIGH', 1, true),
('FIRE_MEDIUM', 'FIRE', 'MEDIUM', 1, true),
('FIRE_LOW', 'FIRE', 'LOW', 1, true),
('FLOOD_CRITICAL', 'FLOOD', 'CRITICAL', 1, true),
('FLOOD_HIGH', 'FLOOD', 'HIGH', 1, true),
('FLOOD_MEDIUM', 'FLOOD', 'MEDIUM', 1, true),
('FLOOD_LOW', 'FLOOD', 'LOW', 1, true),
('HEALTH_CRISIS_CRITICAL', 'HEALTH_CRISIS', 'CRITICAL', 1, true),
('CAR_CRASH_CRITICAL', 'CAR_CRASH', 'CRITICAL', 1, true),
('CAR_CRASH_HIGH', 'CAR_CRASH', 'HIGH', 1, true),
('CAR_CRASH_MEDIUM', 'CAR_CRASH', 'MEDIUM', 1, true),
('CAR_CRASH_LOW', 'CAR_CRASH', 'LOW', 1, true);

USE registry_db;

SELECT 'capability' AS table_name, COUNT(*) AS total FROM capability
UNION ALL
SELECT 'emergency_service', COUNT(*) FROM emergency_service
UNION ALL
SELECT 'emergency_service_capability', COUNT(*) FROM emergency_service_capability;
"

echo ""
echo "=== STATIC DATA POPULATION COMPLETED ==="
echo ""
echo "=== WAIT FOR GATEWAY HTTP ==="

kubectl run gateway-wait \
  --rm -i \
  --restart=Never \
  -n "$NAMESPACE" \
  --image=curlimages/curl:8.10.1 \
  -- sh -c '
    echo "Waiting for gateway-service:8090..."

    until curl -sS --max-time 5 http://gateway-service:8090/ > /dev/null 2>&1; do
      echo "Gateway not ready yet..."
      sleep 5
    done

    echo "Gateway HTTP endpoint is ready!"
  '

echo ""
echo "=== WAIT FOR AUTH SERVICE ==="

kubectl run auth-wait \
  --rm -i \
  --restart=Never \
  -n "$NAMESPACE" \
  --image=curlimages/curl:8.10.1 \
  -- sh -c '
    echo "Waiting for auth-service:8088..."

    until curl -sS --max-time 5 http://auth-service:8088/actuator > /dev/null 2>&1; do
      echo "AuthService not ready yet..."
      sleep 5
    done

    echo "AuthService HTTP endpoint is ready!"
  '

echo ""
echo "=== REGISTER OPERATORS ==="

kubectl run debug-network \
  --rm -i \
  --restart=Never \
  -n "$NAMESPACE" \
  --image=curlimages/curl:8.10.1 \
  -- sh -c '
    register_operator() {
      NAME="$1"
      PAYLOAD="$2"

      echo ""
      echo "=== REGISTER $NAME ==="

      ATTEMPT=1

      while [ "$ATTEMPT" -le 10 ]; do
        echo "Attempt $ATTEMPT/10..."

        HTTP_CODE=$(curl -sS \
          -o /tmp/response.txt \
          -w "%{http_code}" \
          -X POST "http://gateway-service:8090/api/auth/register" \
          -H "Content-Type: application/json" \
          -d "$PAYLOAD" || true)

        if [ "$HTTP_CODE" = "200" ]; then
          cat /tmp/response.txt
          echo ""
          echo "$NAME registrato"
          return 0
        fi

        echo "HTTP $HTTP_CODE"
        cat /tmp/response.txt
        echo ""
        echo "Registration failed, retrying in 5 seconds..."
        sleep 5

        ATTEMPT=$((ATTEMPT + 1))
      done

      echo "ERROR: impossibile registrare $NAME dopo 10 tentativi"
      return 1
    }

    register_operator \
      "MARIO ROSSI" \
      "{\"username\":\"mario.rossi\",\"email\":\"mario.rossi@emergency.com\",\"password\":\"Password123!\",\"name\":\"Mario\",\"surname\":\"Rossi\"}"

    register_operator \
      "LUIGI VERDI" \
      "{\"username\":\"luigi.verdi\",\"email\":\"luigi.verdi@emergency.com\",\"password\":\"Password123!\",\"name\":\"Luigi\",\"surname\":\"Verdi\"}"

    register_operator \
      "GIULIA BIANCHI" \
      "{\"username\":\"giulia.bianchi\",\"email\":\"giulia.bianchi@emergency.com\",\"password\":\"Password123!\",\"name\":\"Giulia\",\"surname\":\"Bianchi\"}"

    register_operator \
      "MARIA VIOLA" \
      "{\"username\":\"maria.viola\",\"email\":\"maria.viola@emergency.com\",\"password\":\"Password123!\",\"name\":\"Maria\",\"surname\":\"Viola\"}"

    register_operator \
      "GIACOMO NERI" \
      "{\"username\":\"giacomo.neri\",\"email\":\"giacomo.neri@emergency.com\",\"password\":\"Password123!\",\"name\":\"Giacomo\",\"surname\":\"Neri\"}"

    echo ""
    echo "=== ALL OPERATORS REGISTERED ==="
  '

echo ""
echo "=== POPULATE OPERATOR RECORDS ==="

kubectl exec mysql-db-0 \
  -n "$NAMESPACE" \
  -- mysql \
  -u emergency \
  -p'Emergency123456@' \
  -e "
USE operator_db;

INSERT INTO operators (auth_user_id, nome, cognome, ruolo, stato) VALUES
(1, 'Mario', 'Rossi', 'Supervisor', 'Offline'),
(2, 'Luigi', 'Verdi', 'Dispatcher', 'Offline'),
(3, 'Giulia', 'Bianchi', 'Operator', 'Offline');
"

echo "Operator records populated."

echo ""
echo "=== UPDATE OPERATOR ROLES ==="

kubectl exec mysql-db-0 \
  -n "$NAMESPACE" \
  -- mysql \
  -u emergency \
  -p'Emergency123456@' \
  -e "
USE auth_db;

UPDATE users
SET role = 'ROLE_ROOM_OPERATOR'
WHERE name IN ('Mario', 'Luigi', 'Giulia')
  AND surname IN ('Rossi', 'Verdi', 'Bianchi');

UPDATE users
SET role = 'ROLE_WORKFLOW_EXPERT'
WHERE name = 'Maria'
  AND surname = 'Viola';

UPDATE users
SET role = 'ROLE_SERVICE_OPERATOR'
WHERE name = 'Giacomo'
  AND surname = 'Neri';
"

echo ""
echo "=== VERIFY OPERATORS AND ROLES ==="

kubectl exec mysql-db-0 \
  -n "$NAMESPACE" \
  -- mysql \
  -u emergency \
  -p'Emergency123456@' \
  -e "
USE auth_db;

SELECT
  id_user,
  username,
  name,
  surname,
  role
FROM users
WHERE surname IN ('Rossi', 'Verdi', 'Bianchi', 'Viola', 'Neri')
ORDER BY id_user;
"

echo ""
echo "=== APPLY INGRESS ==="

kubectl apply \
  -f k8s/ingress/ingress.yaml \
  -n "$NAMESPACE"

echo ""
echo "========================================"
echo "   KUBERNETES DEPLOY COMPLETED"
echo "========================================"

echo ""
echo "=== FINAL POD STATUS ==="

kubectl get pods -n "$NAMESPACE"

echo ""
echo "=== FINAL SERVICES ==="

kubectl get svc -n "$NAMESPACE"

echo ""
echo "Deploy completato."