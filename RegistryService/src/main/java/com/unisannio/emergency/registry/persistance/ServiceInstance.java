package com.unisannio.emergency.registry.persistance;


import java.util.Set;

import jakarta.persistence.*;

@Entity // SQL: CREATE TABLE service_instance (...
public class ServiceInstance {
	
	@Id // SQL: PRIMARY KEY
	@GeneratedValue (strategy = GenerationType.IDENTITY) // SQL: id BIGINT AUTO_INCREMENT
	private long id;
	
	//Colonna normale in SQL
	private String endpoint;
	
	@Enumerated(EnumType.STRING) //È un ENUM in SQL ->  type VARCHAR(30) NOT NULL, CHECK (type IN ('FIRE_STATION', 'HOSPITAL', 'POLICE')) 
	private ServiceType type;
	
	@Enumerated(EnumType.STRING)
    private ServiceStatus status;

    private double avgLatency;

    private double currentLoad;

    private double latitude;

    private double longitude;
	
    @ManyToMany
    // Relazione molti-a-molti:
    // un ServiceInstance ha molte Capability
    // una Capability appartiene a molti ServiceInstance
    //
    // SQL serve un tabella ponte
    // CREATE TABLE service_instance_capability (
    // service_instance_id VARCHAR(64) NOT NULL,
    // capability_id BIGINT NOT NULL,

    // PRIMARY KEY(service_instance_id, capability_id),

    // FOREIGN KEY(service_instance_id)
    //    REFERENCES service_instance(id),

    // FOREIGN KEY(capability_id)
    //    REFERENCES capability(id)
    // );

    @JoinTable(
        name = "service_instance_capability",
        // SQL: CREATE TABLE service_instance_capability (...)

        joinColumns = @JoinColumn(name = "service_instance_id"),
        // Foreign Key verso questa entity (ServiceInstance)
        // SQL:
        // service_instance_id BIGINT
        // FOREIGN KEY -> service_instance(id)

        inverseJoinColumns = @JoinColumn(name = "capability_id")
        // Foreign Key verso l'altra entity (Capability)
        // SQL:
        // capability_id BIGINT
        // FOREIGN KEY -> capability(id)
    )
    private Set<Capability> capabilities; // Lato owner

        public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public ServiceType getType() {
        return type;
    }

    public void setType(ServiceType type) {
        this.type = type;
    }

    public ServiceStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceStatus status) {
        this.status = status;
    }

    public double getAvgLatency() {
        return avgLatency;
    }

    public void setAvgLatency(double avgLatency) {
        this.avgLatency = avgLatency;
    }

    public double getCurrentLoad() {
        return currentLoad;
    }

    public void setCurrentLoad(double currentLoad) {
        this.currentLoad = currentLoad;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public Set<Capability> getCapabilities() {
        return capabilities;
    }

    public void setCapabilities(Set<Capability> capabilities) {
        this.capabilities = capabilities;
    }
}


