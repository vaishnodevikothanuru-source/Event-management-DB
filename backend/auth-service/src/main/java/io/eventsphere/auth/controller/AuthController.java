package io.eventsphere.auth.controller;

import io.eventsphere.auth.dto.AuthDTOs;
import io.eventsphere.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthDTOs.AuthResponse> register(@Valid @RequestBody AuthDTOs.RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthDTOs.AuthResponse> login(@Valid @RequestBody AuthDTOs.LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "HEALTHY",
            "service", "auth-service",
            "timestamp", System.currentTimeMillis()
        ));
    }
}
