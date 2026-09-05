package com.spendy.operator.Controller;

import com.spendy.operator.Service.OperatoreLoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * Endpoint BFF per il Login degli Operatori.
 * Intercetta le credenziali, le inoltra ad AuthMicroService, recupera il JWT
 * e marca l'operatore come Online.
 */
@RestController
@RequestMapping("/api/operators")
public class OperatoreLoginController {

    @Autowired
    private OperatoreLoginService loginService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body("Username and password required");
        }

        try {
            Map<String, Object> result = loginService.login(username, password);
            return ResponseEntity.ok(result);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }
    }

    @Autowired
    private com.spendy.operator.Repository.OperatoreRepository operatoreRepository;

    @PatchMapping("/{id}/logout")
    public ResponseEntity<?> logout(@PathVariable Long id) {
        java.util.Optional<com.spendy.operator.Entity.Operatore> opOpt = operatoreRepository.findById(id);
        if (opOpt.isPresent()) {
            com.spendy.operator.Entity.Operatore operatore = opOpt.get();
            operatore.setStato(com.spendy.operator.Entity.StatoEnum.Offline);
            operatoreRepository.save(operatore);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
