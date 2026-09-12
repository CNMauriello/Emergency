#!/bin/bash

set -e

DB_USER="${DB_USERNAME}"
DB_PASS="${DB_PASSWORD}"
DB_HOST="${DB_EXPOSED_HOST}"
DB_PORT="${DB_EXPOSED_PORT}"
MYSQL_OPTS="${MYSQL_OPTS:-}"

echo "============================================="
echo "  Esecuzione di populate_all.sql"
echo "============================================="

mysql \
  -h "$DB_HOST" \
  -P "$DB_PORT" \
  -u "$DB_USER" \
  -p"$DB_PASS" \
  $MYSQL_OPTS \
  < /app/populate_all.sql

echo ""
echo "Esecuzione di populate_all.sql completata con successo!"