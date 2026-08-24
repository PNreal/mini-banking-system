package com.minibank.adminservice.service;

import com.minibank.adminservice.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.user-service.url}")
    private String userServiceUrl;
    @Value("${services.internal-secret:internal-secret}")
    private String internalSecret;

    public List<UserResponse> getAllUsers(String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret); // Service-to-service authentication
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = userServiceUrl + "/internal/users";
            ResponseEntity<List<UserResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<UserResponse>>() {}
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling User Service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch users from User Service", e);
        }
    }

    public UserResponse getUserById(UUID userId, String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = userServiceUrl + "/internal/users/" + userId;
            ResponseEntity<UserResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    UserResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Error calling User Service for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch user from User Service", e);
        }
    }

    public void lockUser(UUID userId, String authToken) {
        callPatch(userServiceUrl + "/internal/users/" + userId + "/lock", authToken, "lock user");
    }

    public void unlockUser(UUID userId, String authToken) {
        callPatch(userServiceUrl + "/internal/users/" + userId + "/unlock", authToken, "unlock user");
    }

    private void callPatch(String url, String authToken, String action) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            restTemplate.exchange(url, HttpMethod.PATCH, entity, Void.class);
            log.info("User Service {} succeeded: {}", action, url);
        } catch (Exception e) {
            log.error("Error calling User Service to {}: {}", action, e.getMessage(), e);
            throw new RuntimeException("Failed to " + action, e);
        }
    }
}

