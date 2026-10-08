package io.eventsphere.event;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@SpringBootApplication
@RestController
@RequestMapping("/api/events")
public class EventServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventServiceApplication.class, args);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "HEALTHY",
            "service", "event-service",
            "activeEvents", 3
        ));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getEvents() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "title", "Global AI & Autonomous Agents Summit 2026",
                "slug", "global-ai-summit-2026",
                "category", "Artificial Intelligence",
                "eventType", "HYBRID",
                "status", "PUBLISHED",
                "startDate", "2026-11-15",
                "capacity", 3500
            )
        ));
    }
}
