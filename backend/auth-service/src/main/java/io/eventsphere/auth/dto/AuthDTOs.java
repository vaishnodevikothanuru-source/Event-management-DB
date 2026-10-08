package io.eventsphere.auth.dto;

import io.eventsphere.auth.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

public class AuthDTOs {

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        private User.Role role;
        private String company;
        private String jobTitle;
    }

    @Data
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private UserDTO user;
    }

    @Data
    @Builder
    public static class UserDTO {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private User.Role role;
        private String avatarUrl;
        private String company;
        private String jobTitle;
        private Integer points;
    }
}
