# Configurazione MySQL
$DB_USER = "emergency"
$DB_PASS = "Emergency123456@" # Cambia se necessario
$DB_HOST = "localhost"
$DB_PORT = "3306"

# Nome del database (tutto risiede nello schema registry)
$DB_NAME = "registry"

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " 1. Esecuzione di populate_all.sql" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
cmd.exe /c "mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < populate_all.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore nell'esecuzione di populate_all.sql" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " 2. Esecuzione di insert_operatori.js" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
# Richiede Node.js 18+ (per fetch API)
node insert_operatori.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore nell'esecuzione di insert_operatori.js" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " 3. Esecuzione di update_roles.sql" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
cmd.exe /c "mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME < update_roles.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Errore nell'esecuzione di update_roles.sql" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Tutti i passaggi completati con successo!" -ForegroundColor Green
