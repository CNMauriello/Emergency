#!/bin/bash

# Configurazione MySQL
DB_USER="emergency"
DB_PASS="Emergency123456@" # Cambia se necessario
DB_HOST="localhost"
DB_PORT="3306"

# Nome del database (tutto risiede nello schema registry)
DB_NAME="registry"

echo "============================================="
echo " 1. Esecuzione di populate_all.sql"
echo "============================================="
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < populate_all.sql
if [ $? -ne 0 ]; then
    echo "Errore nell'esecuzione di populate_all.sql"
    exit 1
fi

echo ""
echo "============================================="
echo " 2. Esecuzione di insert_operatori.js"
echo "============================================="
# Richiede Node.js 18+ (per fetch API)
node insert_operatori.js
if [ $? -ne 0 ]; then
    echo "Errore nell'esecuzione di insert_operatori.js"
    exit 1
fi

echo ""
echo "============================================="
echo " 3. Esecuzione di update_roles.sql"
echo "============================================="
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < update_roles.sql
if [ $? -ne 0 ]; then
    echo "Errore nell'esecuzione di update_roles.sql"
    exit 1
fi

echo ""
echo "Tutti i passaggi completati con successo!"
