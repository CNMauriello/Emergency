#!/bin/bash

set -e

NAMESPACE="assd-orchestration"
DOCKER_USER="khondor"
PLATFORM="linux/amd64"
export KUBECONFIG="$HOME/.kube/assd.yaml"

IMAGES=(
  "auth-service"
  "emergency-service"
  "gateway-service"
  "mock-service"
  "operator-service"
  "registry-service"
  "orchestrator-binder"
  "ui"
)

DEPLOYMENTS=(
  "auth-service"
  "emergency-service"
  "gateway-service"
  "mock-service"
  "operator-service"
  "registry-service"
  "orchestrator-binder"
  "emergency-ui"
)

echo "========================================"
echo "  DEPLOY ASSD ORCHESTRATION"
echo "========================================"

if [ "$1" = "seed" ]; then
  echo ""
  echo "=== BUILD DB SEEDER ==="

  docker build \
    --platform "$PLATFORM" \
    -t "$DOCKER_USER/db-seeder:latest" \
    -f k8s/applications/db-seeder/Dockerfile .

  docker push "$DOCKER_USER/db-seeder:latest"

  echo ""
  echo "=== DELETE PREVIOUS SEEDER JOB ==="

  kubectl delete job db-seeder \
    -n "$NAMESPACE" \
    --ignore-not-found=true

  echo ""
  echo "=== APPLY SEEDER ==="

  kubectl apply \
    -f k8s/applications/db-seeder/job.yaml \
    -n "$NAMESPACE"

  echo ""
  echo "=== WAIT FOR SEEDER ==="

  kubectl wait \
    --for=condition=complete \
    job/db-seeder \
    -n "$NAMESPACE" \
    --timeout=10m

  echo ""
  echo "=== SEEDER COMPLETED ==="

  kubectl logs \
    job/db-seeder \
    -n "$NAMESPACE"

  exit 0
fi

echo ""
echo "=== CHECK EXISTING PODS ==="

PODS=$(kubectl get pods \
  -n "$NAMESPACE" \
  -o name \
  2>/dev/null || true)

if [ -n "$PODS" ]; then
  echo "Pod trovati nel namespace $NAMESPACE:"
  echo "$PODS"

  echo ""
  echo "=== DELETE EXISTING APPLICATION PODS ==="

  for DEPLOYMENT in "${DEPLOYMENTS[@]}"; do
    PODS_FOR_DEPLOYMENT=$(kubectl get pods \
      -n "$NAMESPACE" \
      -l "app=$DEPLOYMENT" \
      -o name \
      2>/dev/null || true)

    if [ -n "$PODS_FOR_DEPLOYMENT" ]; then
      echo "Elimino Pod di $DEPLOYMENT:"
      echo "$PODS_FOR_DEPLOYMENT"

      kubectl delete $PODS_FOR_DEPLOYMENT \
        -n "$NAMESPACE" \
        --ignore-not-found=true
    fi
  done
else
  echo "Nessun Pod presente."
fi

echo ""
echo "=== BUILD AND PUSH IMAGES ==="

docker build --platform "$PLATFORM" -t "$DOCKER_USER/auth-service:latest" -f AuthMicroService/Dockerfile .
docker push "$DOCKER_USER/auth-service:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/emergency-service:latest" -f EmergencyService/Dockerfile .
docker push "$DOCKER_USER/emergency-service:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/gateway-service:latest" -f GatewayService/Dockerfile .
docker push "$DOCKER_USER/gateway-service:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/mock-service:latest" -f MockService/Dockerfile .
docker push "$DOCKER_USER/mock-service:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/operator-service:latest" -f OperatorService/Dockerfile .
docker push "$DOCKER_USER/operator-service:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/registry-service:latest" -f RegistryService/Dockerfile .
docker push "$DOCKER_USER/registry-service:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/orchestrator-binder:latest" -f Dockerfile.orchestrator-binder .
docker push "$DOCKER_USER/orchestrator-binder:latest"

docker build --platform "$PLATFORM" -t "$DOCKER_USER/ui:latest" -f UI/Dockerfile UI
docker push "$DOCKER_USER/ui:latest"

echo ""
echo "=== APPLY CONFIGURATION ==="

kubectl apply \
  -f k8s/config/configmap.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/config/secret.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== APPLY DATABASE ==="

kubectl apply \
  -f k8s/infrastructure/mysql-init-configmap.yaml \
  -n "$NAMESPACE"

kubectl apply \
  -f k8s/infrastructure/mysql.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== APPLY ELASTICSEARCH ==="

kubectl apply \
  -f k8s/infrastructure/elasticsearch.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== APPLY CAMUNDA ==="

kubectl apply \
  -f k8s/infrastructure/camunda.yaml \
  -n "$NAMESPACE"

echo ""
echo "=== WAIT INFRASTRUCTURE ==="

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

kubectl apply -f k8s/applications/auth-service/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/emergency-service/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/gateway-service/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/mock-service/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/operator-service/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/registry-service/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/orchestrator-binder/deployment.yaml -n "$NAMESPACE"
kubectl apply -f k8s/applications/ui/deployment.yaml -n "$NAMESPACE"

echo ""
echo "=== SET IMAGE PULL POLICY ==="

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
echo "=== WAIT APPLICATIONS ==="

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
echo "=== APPLY INGRESS ==="

kubectl apply \
  -f k8s/ingress.yaml \
  -n "$NAMESPACE"

echo ""
echo "========================================"
echo "  DEPLOY COMPLETATO"
echo "========================================"

kubectl get pods -n "$NAMESPACE"