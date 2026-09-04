USE registry;

-- ============================================================
-- RESET DATABASE
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS emergency_service_capability;
DROP TABLE IF EXISTS emergency_service;
DROP TABLE IF EXISTS capability;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- CREATE TABLE: CAPABILITY
-- ============================================================

CREATE TABLE capability (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY UK_capability_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- CREATE TABLE: EMERGENCY SERVICE
-- ============================================================

CREATE TABLE emergency_service (
    id BIGINT NOT NULL AUTO_INCREMENT,
    avg_latency DOUBLE NOT NULL,
    current_load DOUBLE NOT NULL,
    endpoint VARCHAR(255) DEFAULT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    status ENUM('DEGRADED','DOWN','UP') DEFAULT NULL,
    type ENUM('FIRE_STATION','HOSPITAL','POLICE') DEFAULT NULL,

    PRIMARY KEY (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- CREATE TABLE: EMERGENCY SERVICE <-> CAPABILITY
-- ============================================================

CREATE TABLE emergency_service_capability (
    service_instance_id BIGINT NOT NULL,
    capability_id BIGINT NOT NULL,

    PRIMARY KEY (service_instance_id, capability_id),

    KEY idx_capability_id (capability_id),

    CONSTRAINT fk_esc_service
        FOREIGN KEY (service_instance_id)
        REFERENCES emergency_service (id),

    CONSTRAINT fk_esc_capability
        FOREIGN KEY (capability_id)
        REFERENCES capability (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- ============================================================
-- CAPABILITIES
-- ============================================================

INSERT INTO capability (name) VALUES
('SearchAndRescue'),
('FireSuppression'),
('MedicalEmergency'),
('TraumaCare'),
('Ambulance'),
('PoliceIntervention'),
('CrowdControl'),
('DisasterResponse'),
('WaterRescue'),
('HelicopterRescue'),
('HazmatResponse'),
('Evacuation'),
('EmergencyCommunication'),
('MountainRescue'),
('FloodResponse');


-- ============================================================
-- EMERGENCY SERVICES
-- ============================================================

INSERT INTO emergency_service
    (avg_latency, current_load, endpoint, latitude, longitude, status, type)
VALUES

-- 1
(18.5, 32.0,
 'http://localhost:8089/fire-station-napoli.local/api',
 40.8518, 14.2681,
 'UP', 'FIRE_STATION'),

-- 2
(25.2, 45.0,
 'http://localhost:8089/fire-station-salerno.local/api',
 40.6824, 14.7681,
 'UP', 'FIRE_STATION'),

-- 3
(41.7, 67.0,
 'http://localhost:8089/fire-station-caserta.local/api',
 41.0747, 14.3320,
 'DEGRADED', 'FIRE_STATION'),

-- 4
(12.3, 28.0,
 'http://localhost:8089/hospital-napoli.local/api',
 40.8522, 14.2685,
 'UP', 'HOSPITAL'),

-- 5
(35.8, 71.0,
 'http://localhost:8089/hospital-salerno.local/api',
 40.6782, 14.7653,
 'DEGRADED', 'HOSPITAL'),

-- 6
(15.6, 19.0,
 'http://localhost:8089/hospital-caserta.local/api',
 41.0731, 14.3325,
 'UP', 'HOSPITAL'),

-- 7
(22.4, 38.0,
 'http://localhost:8089/police-napoli.local/api',
 40.8467, 14.2516,
 'UP', 'POLICE'),

-- 8
(19.8, 52.0,
 'http://localhost:8089/police-salerno.local/api',
 40.6810, 14.7680,
 'UP', 'POLICE'),

-- 9
(55.4, 89.0,
 'http://localhost:8089/police-caserta.local/api',
 41.0745, 14.3328,
 'DEGRADED', 'POLICE'),

-- 10
(8.7, 14.0,
 'http://localhost:8089/fire-station-pozzuoli.local/api',
 40.8231, 14.1216,
 'UP', 'FIRE_STATION'),

-- 11
(29.3, 43.0,
 'http://localhost:8089/hospital-pozzuoli.local/api',
 40.8230, 14.1220,
 'UP', 'HOSPITAL'),

-- 12
(17.1, 26.0,
 'http://localhost:8089/police-pozzuoli.local/api',
 40.8235, 14.1225,
 'UP', 'POLICE'),

-- 13
(63.2, 92.0,
 'http://localhost:8089/fire-station-avellino.local/api',
 40.9140, 14.7920,
 'DEGRADED', 'FIRE_STATION'),

-- 14
(14.9, 22.0,
 'http://localhost:8089/hospital-avellino.local/api',
 40.9150, 14.7915,
 'UP', 'HOSPITAL'),

-- 15
(31.5, 61.0,
 'http://localhost:8089/police-avellino.local/api',
 40.9145, 14.7925,
 'UP', 'POLICE'),

-- 16
(11.2, 17.0,
 'http://localhost:8089/fire-station-benevento.local/api',
 41.1297, 14.7826,
 'UP', 'FIRE_STATION'),

-- 17
(27.6, 48.0,
 'http://localhost:8089/hospital-benevento.local/api',
 41.1298, 14.7820,
 'UP', 'HOSPITAL'),

-- 18
(46.8, 76.0,
 'http://localhost:8089/police-benevento.local/api',
 41.1300, 14.7830,
 'DEGRADED', 'POLICE'),

-- 19
(9.4, 12.0,
 'http://localhost:8089/fire-station-sorrento.local/api',
 40.6263, 14.3758,
 'UP', 'FIRE_STATION'),

-- 20
(21.7, 34.0,
 'http://localhost:8089/hospital-sorrento.local/api',
 40.6268, 14.3762,
 'UP', 'HOSPITAL');


-- ============================================================
-- RELAZIONI
-- ============================================================

-- ============================================================
-- FIRE STATION 1 - Napoli
-- ID: 1
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 1, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'SearchAndRescue',
    'HazmatResponse',
    'DisasterResponse'
);


-- ============================================================
-- FIRE STATION 2 - Salerno
-- ID: 2
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 2, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'SearchAndRescue',
    'WaterRescue',
    'DisasterResponse'
);


-- ============================================================
-- FIRE STATION 3 - Caserta
-- ID: 3
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 3, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'HazmatResponse',
    'DisasterResponse'
);


-- ============================================================
-- HOSPITAL 1 - Napoli
-- ID: 4
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 4, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance',
    'DisasterResponse'
);


-- ============================================================
-- HOSPITAL 2 - Salerno
-- ID: 5
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 5, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance',
    'Evacuation'
);


-- ============================================================
-- HOSPITAL 3 - Caserta
-- ID: 6
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 6, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance'
);


-- ============================================================
-- POLICE 1 - Napoli
-- ID: 7
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 7, id
FROM capability
WHERE name IN (
    'PoliceIntervention',
    'CrowdControl',
    'EmergencyCommunication'
);


-- ============================================================
-- POLICE 2 - Salerno
-- ID: 8
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 8, id
FROM capability
WHERE name IN (
    'PoliceIntervention',
    'CrowdControl',
    'EmergencyCommunication',
    'Evacuation'
);


-- ============================================================
-- POLICE 3 - Caserta
-- ID: 9
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 9, id
FROM capability
WHERE name IN (
    'PoliceIntervention',
    'CrowdControl',
    'EmergencyCommunication'
);


-- ============================================================
-- FIRE STATION 4 - Pozzuoli
-- ID: 10
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 10, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'WaterRescue',
    'SearchAndRescue'
);


-- ============================================================
-- HOSPITAL 4 - Pozzuoli
-- ID: 11
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 11, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance',
    'WaterRescue'
);


-- ============================================================
-- POLICE 4 - Pozzuoli
-- ID: 12
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 12, id
FROM capability
WHERE name IN (
    'PoliceIntervention',
    'CrowdControl',
    'EmergencyCommunication'
);


-- ============================================================
-- FIRE STATION 5 - Avellino
-- ID: 13
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 13, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'MountainRescue',
    'SearchAndRescue'
);


-- ============================================================
-- HOSPITAL 5 - Avellino
-- ID: 14
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 14, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance',
    'MountainRescue'
);


-- ============================================================
-- POLICE 5 - Avellino
-- ID: 15
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 15, id
FROM capability
WHERE name IN (
    'PoliceIntervention',
    'EmergencyCommunication',
    'MountainRescue'
);


-- ============================================================
-- FIRE STATION 6 - Benevento
-- ID: 16
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 16, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'DisasterResponse',
    'FloodResponse'
);


-- ============================================================
-- HOSPITAL 6 - Benevento
-- ID: 17
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 17, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance',
    'DisasterResponse'
);


-- ============================================================
-- POLICE 6 - Benevento
-- ID: 18
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 18, id
FROM capability
WHERE name IN (
    'PoliceIntervention',
    'CrowdControl',
    'Evacuation'
);


-- ============================================================
-- FIRE STATION 7 - Sorrento
-- ID: 19
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 19, id
FROM capability
WHERE name IN (
    'FireSuppression',
    'WaterRescue',
    'SearchAndRescue'
);


-- ============================================================
-- HOSPITAL 7 - Sorrento
-- ID: 20
-- ============================================================

INSERT INTO emergency_service_capability
(service_instance_id, capability_id)
SELECT 20, id
FROM capability
WHERE name IN (
    'MedicalEmergency',
    'TraumaCare',
    'Ambulance',
    'WaterRescue'
);


-- ============================================================
-- VERIFICA COMPLETA
-- ============================================================

SELECT
    es.id,
    es.type,
    es.status,
    es.current_load,
    es.avg_latency,
    es.latitude,
    es.longitude,
    es.endpoint,
    GROUP_CONCAT(
        c.name
        ORDER BY c.name
        SEPARATOR ', '
    ) AS capabilities
FROM emergency_service es

LEFT JOIN emergency_service_capability esc
    ON es.id = esc.service_instance_id

LEFT JOIN capability c
    ON esc.capability_id = c.id

GROUP BY
    es.id,
    es.type,
    es.status,
    es.current_load,
    es.avg_latency,
    es.latitude,
    es.longitude,
    es.endpoint

ORDER BY es.id;


-- ============================================================
-- VERIFICA NUMERO RECORD
-- ============================================================

SELECT 'capability' AS table_name, COUNT(*) AS total
FROM capability

UNION ALL

SELECT 'emergency_service', COUNT(*)
FROM emergency_service

UNION ALL

SELECT 'emergency_service_capability', COUNT(*)
FROM emergency_service_capability;
