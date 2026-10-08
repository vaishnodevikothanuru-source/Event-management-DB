package io.eventsphere.auth.service;

import io.eventsphere.auth.dto.AuthDTOs;
import io.eventsphere.auth.entity.User;
import io.eventsphere.auth.repository.UserRepository;
import io.eventsphere.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public AuthDTOs.AuthResponse register(AuthDTOs.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + req.getEmail());
        }

        User user = User.builder()
                .email(req.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(req.getRole() != null ? req.getRole() : User.Role.ATTENDEE)
                .company(req.getCompany())
                .jobTitle(req.getJobTitle())
                .points(100)
                .isEmailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Publish Kafka UserRegistered Event
        try {
            kafkaTemplate.send("user-events", "UserRegistered", savedUser.getEmail());
        } catch (Exception e) {
            // Graceful log fallback
            System.err.println("Kafka dispatch skipped in standalone mode: " + e.getMessage());
        }

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getId());

        return AuthDTOs.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToDTO(savedUser))
                .build();
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or credentials");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthDTOs.AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToDTO(user))
                .build();
    }

    private AuthDTOs.UserDTO mapToDTO(User user) {
        return AuthDTOs.UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .company(user.getCompany())
                .jobTitle(user.getJobTitle())
                .points(user.getPoints())
                .build();
    }
}
