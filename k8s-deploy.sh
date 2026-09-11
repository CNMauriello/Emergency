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
echo "=== DELETE PREVIOUS DB SEEDER JOB ==="

kubectl delete job db-seeder \
  -n "$NAMESPACE" \
  --ignore-not-found=true

echo ""
echo "=== APPLY DB SEEDER ==="

kubectl apply \
  -f k8s/applications/db-seeder/job.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== WAIT FOR DB SEEDER ==="

kubectl wait \
  --for=condition=complete \
  job/db-seeder \
  -n "$NAMESPACE" \
  --timeout=10m

echo ""
echo "=== DB SEEDER COMPLETED ==="

kubectl logs \
  job/db-seeder \
  -n "$NAMESPACE" \
  --all-containers=true

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
