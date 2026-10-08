package io.eventsphere.analytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AnalyticsServiceApplication.class, args);
    }

    @GetMapping("/platform-summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(Map.of(
            "totalRevenue", 2489500,
            "totalRegistrations", 38940,
            "platformEngagementRate", 88.4,
            "activeEvents", 28
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "HEALTHY",
            "service", "analytics-service"
        ));
    }
}
