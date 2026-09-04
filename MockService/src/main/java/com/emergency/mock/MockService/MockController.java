package com.emergency.mock.MockService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;
import java.util.Set;

@RestController
public class MockController {

    private static final Logger logger = LoggerFactory.getLogger(MockController.class);

    private static final Set<String> DEGRADED_HOSTS = Set.of(
            "fire-station-caserta.local",
            "hospital-salerno.local",
            "police-caserta.local",
            "fire-station-avellino.local",
            "police-benevento.local"
    );

    @GetMapping("/api/stub_service")
    public ResponseEntity<Map<String, Boolean>> getStubService(HttpServletRequest request) {
        logger.info("========== REQUEST ==========");
        logger.info("Method: {}", request.getMethod());
        logger.info("URL: {}", request.getRequestURI());
        
        return ResponseEntity.ok(Map.of("areEvacuated", true));
    }

    @GetMapping("/{host}/api")
    public ResponseEntity<Void> getApi(@PathVariable("host") String host, HttpServletRequest request) {
        logger.info("========== REQUEST ==========");
        logger.info("Method: {}", request.getMethod());
        logger.info("URL: {}", request.getRequestURI());
        logger.info("Host in path: {}", host);

        if (host != null) {
            String domain = host;
            // Nel caso arrivasse con la porta
            if (host.contains(":")) {
                domain = host.split(":")[0];
            }
            if (DEGRADED_HOSTS.contains(domain)) {
                logger.info("Result: 503 Service Unavailable (DEGRADED host)");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
            }
        }
        logger.info("Result: 200 OK");
        return ResponseEntity.ok().build();
    }
}
