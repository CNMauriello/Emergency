#!/bin/bash
echo "Starting Camunda Zeebe Engine..."

sed -i 's/localhost:9200/elasticsearch:9200/g' /app/zeebe/config/application.yaml
sed -i 's/unprotectedApi: false/unprotectedApi: true/g' /app/zeebe/config/application.yaml

export ZEEBE_BROKER_NETWORK_HOST=0.0.0.0
export ZEEBE_BROKER_GATEWAY_NETWORK_HOST=0.0.0.0
/app/zeebe/bin/broker &

echo "Waiting for Zeebe to initialize..."
while ! nc -z localhost 26500; do
  echo "Waiting for Zeebe gRPC on port 26500..."
  sleep 3
done
echo "Zeebe is up and ready!"

# Maintain container running
wait
