package com.minibank.userservice.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private String role;
        private UUID userId;

        public String getAccessToken() {
            return accessToken;
        }
        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
        public String getRefreshToken() {
            return refreshToken;
        }
        public void setRefreshToken(String refreshToken) {
            this.refreshToken = refreshToken;
        }
        public String getRole() {
            return role;
        }
        public void setRole(String role) {
            this.role = role;
        }
        public UUID getUserId() {
            return userId;
        }
        public void setUserId(UUID userId) {
            this.userId = userId;
        }
}
