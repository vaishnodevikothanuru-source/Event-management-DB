package io.eventsphere.registration;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/registrations")
public class RegistrationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RegistrationServiceApplication.class, args);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "HEALTHY",
            "service", "registration-service"
        ));
    }
}
