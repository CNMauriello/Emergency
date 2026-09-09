#!/bin/bash
echo "Starting Camunda Zeebe Engine..."
export ZEEBE_BROKER_NETWORK_HOST=0.0.0.0
/app/zeebe/bin/broker &

echo "Waiting for Zeebe to initialize (15s)..."
sleep 15

echo "Starting BinderService..."
java -jar /app/binder.jar &

echo "Starting OrchestratorService..."
java -jar /app/orchestrator.jar
