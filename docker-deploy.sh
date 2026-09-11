#!/bin/bash

set -e

DOCKER_USER="khondor"
PLATFORM="linux/amd64"

echo "========================================"
echo "   DOCKER BUILD & PUSH"
echo "========================================"

echo ""
echo "=== auth-service ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/auth-service:latest" \
  -f AuthMicroService/Dockerfile .

docker push "$DOCKER_USER/auth-service:latest"

echo ""
echo "=== emergency-service ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/emergency-service:latest" \
  -f EmergencyService/Dockerfile .

docker push "$DOCKER_USER/emergency-service:latest"

echo ""
echo "=== gateway-service ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/gateway-service:latest" \
  -f GatewayService/Dockerfile .

docker push "$DOCKER_USER/gateway-service:latest"

echo ""
echo "=== mock-service ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/mock-service:latest" \
  -f MockService/Dockerfile .

docker push "$DOCKER_USER/mock-service:latest"

echo ""
echo "=== operator-service ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/operator-service:latest" \
  -f OperatorService/Dockerfile .

docker push "$DOCKER_USER/operator-service:latest"

echo ""
echo "=== registry-service ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/registry-service:latest" \
  -f RegistryService/Dockerfile .

docker push "$DOCKER_USER/registry-service:latest"

echo ""
echo "=== orchestrator-binder ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/orchestrator-binder:latest" \
  -f Dockerfile.orchestrator-binder .

docker push "$DOCKER_USER/orchestrator-binder:latest"

echo ""
echo "=== ui ==="

docker build \
  --platform "$PLATFORM" \
  -t "$DOCKER_USER/ui:latest" \
  -f UI/Dockerfile UI

docker push "$DOCKER_USER/ui:latest"

echo ""
echo "========================================"
echo "   DOCKER DEPLOY COMPLETED"
echo "========================================"
