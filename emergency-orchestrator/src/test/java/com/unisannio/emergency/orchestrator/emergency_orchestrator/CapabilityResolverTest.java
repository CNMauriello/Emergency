package com.unisannio.emergency.orchestrator.emergency_orchestrator;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;


import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.unisannio.emergency.orchestrator.emergency_orchestrator.model.Capability;
import com.unisannio.emergency.orchestrator.emergency_orchestrator.service.executor.CapabilityResolver;

class CapabilityResolverTest {

    @Test
    void testCapabilityResolverWithFakeServers() {

        // Registry client
        RestClient.Builder registryBuilder = RestClient.builder().baseUrl("http://fake-registry");
        MockRestServiceServer registryMock = MockRestServiceServer.bindTo(registryBuilder).build();
        RestClient registryClient = registryBuilder.build();


        // Service client
        RestClient.Builder serviceBuilder = RestClient.builder();
        MockRestServiceServer serviceMock = MockRestServiceServer.bindTo(serviceBuilder).build();
        RestClient serviceClient = serviceBuilder.build();


        // Il registry risponde con un servizio disponibile
        //mettere json corrispondente a EmergencyService
        registryMock.expect(
                requestTo("http://fake-registry/services?capability=FIRE_STATION"))
                .andRespond(
                withSuccess("""
                    [
                      {
                        "id": "fire-1",
                        "type": "FIRE_STATION",
                        "capabilities": [{"capabilityName": "FIRE_STATION"}],
                        "endpoint": "http://fake-service/fire",
                        "status": "UP",
                        "avgLatency": 50.0,
                        "currentLoad": 0.3,
                        "position": {"latitude": 41.0, "longitude": 14.0}
                      }
                    ]
                    """,
                    org.springframework.http.MediaType.APPLICATION_JSON)
        );


        // Il servizio chiamato dall'executor risponde 200
        serviceMock.expect(
            requestTo("http://fake-service/fire"))
            .andRespond(withStatus(HttpStatus.OK)
        );


        CapabilityResolver resolver = new CapabilityResolver(registryClient, serviceClient);


        assertDoesNotThrow(() -> resolver.resolveCapability(
                        new Capability("FIRE_STATION")
                )
        );


        registryMock.verify();
        serviceMock.verify();
    }
}