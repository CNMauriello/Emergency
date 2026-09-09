#!/bin/bash

DB_USER="${DB_USERNAME}"
DB_PASS="${DB_PASSWORD}"
DB_HOST="${DB_EXPOSED_HOST}"
DB_PORT="${DB_EXPOSED_PORT}"

# I database sono ora specificati nei singoli script SQL

echo "============================================="
echo " 1. Esecuzione di populate_all.sql"
echo "============================================="
MYSQL_OPTS="${MYSQL_OPTS:-}"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" $MYSQL_OPTS < populate_all.sql
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
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" $MYSQL_OPTS < update_roles.sql
if [ $? -ne 0 ]; then
    echo "Errore nell'esecuzione di update_roles.sql"
    exit 1
fi

echo ""
echo "Tutti i passaggi completati con successo!"
