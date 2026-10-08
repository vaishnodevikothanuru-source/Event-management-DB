package io.eventsphere.notification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@SpringBootApplication
@RestController
@RequestMapping("/api/notifications")
public class NotificationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }

    @KafkaListener(topics = "notification-events", groupId = "notification-group")
    public void consumeNotificationEvent(String message) {
        System.out.println("[Kafka Notification Consumer] Dispatched email/in-app alert: " + message);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "HEALTHY",
            "service", "notification-service",
            "channel", "Kafka + Email Dispatcher"
        ));
    }
}
