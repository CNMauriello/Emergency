package com.emergency.mock.MockService;

import org.apache.coyote.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
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

    @GetMapping("/api/evacuation_service")
    public ResponseEntity<Map<String, Boolean>> getStubService(HttpServletRequest request) {
        logger.info("========== REQUEST ==========");
        logger.info("Method: {}", request.getMethod());
        logger.info("URL: {}", request.getRequestURI());
        
        return ResponseEntity.ok(Map.of("areEvacuated", true));
    }

    @GetMapping("/api/health_service")
    public ResponseEntity<Map<String, Boolean>> getHealthService(HttpServletRequest request) {
        logger.info("========== REQUEST ==========");
        logger.info("Method: {}", request.getMethod());
        logger.info("URL: {}", request.getRequestURI());

        // Restituisce il campo isStabilized atteso dal task BPMN
        return ResponseEntity.ok(Map.of("isStabilized", true));
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

    @PostMapping("/api/dispatch")
    public ResponseEntity<Map<String, String>> dispatchEvacuation(HttpServletRequest request , @RequestBody Map<String, String> code) {

        List<String> validCodes = List.of("048521278323", "048521278324", "048521278325");

        logger.info("========== REQUEST ==========");
        logger.info("Method: {}", request.getMethod());
        logger.info("URL: {}", request.getRequestURI());
        String authorizationCode = code.get("authorizationCode");
        if (authorizationCode != null && validCodes.contains(authorizationCode)) {
            logger.info("Result: 200 OK");
            boolean success = new java.util.Random().nextBoolean();
            if(success){
                return ResponseEntity.ok(Map.of("message", "Risorse mobilitate"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Nessuna risorsa disponibile"));
            }
        } else {
            logger.info("Result: 401 Unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid authorization code"));
        }
    }

    @PostMapping("/api/military-intervention")
    public ResponseEntity<Map<String, String>> militaryIntervention(HttpServletRequest request) {
        logger.info("========== REQUEST ==========");
        logger.info("Method: {}", request.getMethod());
        logger.info("URL: {}", request.getRequestURI());
        logger.info("Result: 200 OK - Intervento militare autorizzato");
        return ResponseEntity.ok(Map.of("message", "Intervento militare autorizzato"));
    }
}
