-- ============================================================
-- AUTH MICROSERVICE - UPDATE RUOLI
-- ============================================================
USE auth_db;

-- Questo script aggiorna il ruolo degli utenti (Mario, Luigi, Giulia)
-- da ROLE_USER a ROLE_ROOM_OPERATOR nel database di autenticazione.

UPDATE users
SET role = 'ROLE_ROOM_OPERATOR'
WHERE name IN ('Mario', 'Luigi', 'Giulia') AND surname IN ('Rossi', 'Verdi', 'Bianchi');

UPDATE users
SET role = 'ROLE_WORKFLOW_EXPERT'
WHERE name IN ('Maria') AND surname IN ('Viola');

UPDATE users
SET role = 'ROLE_SERVICE_OPERATOR'
WHERE name IN ('Giacomo') AND surname IN ('Neri');
