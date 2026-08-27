package com.unisannio.emergency.binder.controller;

import com.unisannio.emergency.binder.model.BinderRequest;
import com.unisannio.emergency.binder.service.BinderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/binder")
public class BinderController {

    private final BinderService binderService;

    public BinderController(BinderService binderService) {
        this.binderService = binderService;
    }

    @PostMapping("/candidates")
    public ResponseEntity<List<String>> getCandidates(@RequestBody BinderRequest request) {
        List<String> candidates = binderService.getSortedCandidates(request);
        if (candidates.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(candidates);
    }
}