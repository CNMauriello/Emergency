-- Script per l'inserimento iniziale di 3 Operatori di Sala
-- Assicurarsi che gli auth_user_id (1, 2, 3) corrispondano agli id reali presenti nel database dell'AuthMicroService.

INSERT INTO operatori (auth_user_id, nome, cognome, ruolo, stato) VALUES 
(1, 'Mario', 'Rossi', 'Supervisor', 'Offline'),
(2, 'Luigi', 'Verdi', 'Dispatcher', 'Offline'),
(3, 'Giulia', 'Bianchi', 'Operator', 'Offline');
