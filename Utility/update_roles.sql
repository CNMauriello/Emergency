-- ============================================================
-- AUTH MICROSERVICE - UPDATE RUOLI
-- ============================================================
-- Questo script aggiorna il ruolo degli utenti (Mario, Luigi, Giulia)
-- da ROLE_USER a ROLE_ROOM_OPERATOR nel database di autenticazione.

UPDATE users
SET role = 'ROLE_ROOM_OPERATOR'
WHERE name IN ('Mario', 'Luigi', 'Giulia') AND surname IN ('Rossi', 'Verdi', 'Bianchi');
