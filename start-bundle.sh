#!/bin/bash
echo "Starting Camunda Zeebe Engine..."

sed -i 's/localhost:9200/elasticsearch:9200/g' /app/zeebe/config/application.yaml
sed -i 's/unprotectedApi: false/unprotectedApi: true/g' /app/zeebe/config/application.yaml

export ZEEBE_BROKER_NETWORK_HOST=0.0.0.0
/app/zeebe/bin/broker &

echo "Waiting for Zeebe to initialize..."
while ! curl -s http://localhost:8080 > /dev/null; do
  echo "Waiting for Zeebe on port 8080..."
  sleep 3
done
echo "Zeebe is up!"

echo "Starting BinderService..."
java -jar /app/binder.jar &

echo "Starting OrchestratorService..."
java -jar /app/orchestrator.jar
