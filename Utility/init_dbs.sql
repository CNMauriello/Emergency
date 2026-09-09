-- Create the databases if they don't already exist
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS operator_db;
CREATE DATABASE IF NOT EXISTS emergency_db;
CREATE DATABASE IF NOT EXISTS registry_db;
CREATE DATABASE IF NOT EXISTS orchestrator_db;

-- Grant privileges to the emergency user for each database
GRANT ALL PRIVILEGES ON auth_db.* TO 'emergency'@'%';
GRANT ALL PRIVILEGES ON operator_db.* TO 'emergency'@'%';
GRANT ALL PRIVILEGES ON emergency_db.* TO 'emergency'@'%';
GRANT ALL PRIVILEGES ON registry_db.* TO 'emergency'@'%';
GRANT ALL PRIVILEGES ON orchestrator_db.* TO 'emergency'@'%';

-- Apply the changes
FLUSH PRIVILEGES;
