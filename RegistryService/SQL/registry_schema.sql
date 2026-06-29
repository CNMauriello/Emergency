CREATE TABLE service_instance (
	id BIGINT AUTO_INCREMENT  PRIMARY KEY,
    endpoint        VARCHAR(255) NOT NULL,			
    type            VARCHAR(30) NOT NULL, 			  
		CHECK (type IN ('FIRE_STATION', 'HOSPITAL', 'POLICE')),
    status          VARCHAR(30) NOT NULL,			
		CHECK (status IN ('UP' 'DOWN')),
    avg_latency DOUBLE PRECISION NOT NULL
		CHECK (avg_latency >= 0),
    current_load    DOUBLE PRECISION NOT NULL
		CHECK (current_load BETWEEN 0 AND 100),
	latitude DECIMAL(9,6) NOT NULL
		CHECK (latitude BETWEEN -90 AND 90),
	longitude DECIMAL(9,6) NOT NULL
		CHECK (longitude BETWEEN -180 AND 180)
);


CREATE TABLE capability (
    id      BIGINT AUTO_INCREMENT  PRIMARY KEY,
    name    VARCHAR(100) UNIQUE NOT NULL
);



CREATE TABLE service_instance_capability (
    service_instance_id VARCHAR(64) NOT NULL,
    capability_id BIGINT NOT NULL,

    PRIMARY KEY(service_instance_id, capability_id),

    FOREIGN KEY(service_instance_id)
        REFERENCES service_instance(id),

    FOREIGN KEY(capability_id)
        REFERENCES capability(id)
);