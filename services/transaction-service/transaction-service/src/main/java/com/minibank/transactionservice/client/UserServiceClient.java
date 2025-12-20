package com.minibank.transactionservice.client;

import com.minibank.transactionservice.dto.UserResponse;
import com.minibank.transactionservice.exception.BadRequestException;
import com.minibank.transactionservice.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.user-service.url:http://localhost:8081}")
    private String userServiceUrl;
    @Value("${services.internal-secret:internal-secret}")
    private String internalSecret;

    public UserResponse getUser(UUID userId) {
        String url = userServiceUrl + "/internal/users/" + userId;
        return exchange(url, HttpMethod.GET, null, UserResponse.class);
    }

    public UserResponse getUserByEmail(String email) {
        String encoded = URLEncoder.encode(email, StandardCharsets.UTF_8);
        String url = userServiceUrl + "/internal/users/by-email?email=" + encoded;
        return exchange(url, HttpMethod.GET, null, UserResponse.class);
    }

    private <T> T exchange(String url, HttpMethod method, Object body, Class<T> clazz) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Object> entity = new HttpEntity<>(body, headers);
            ResponseEntity<T> response = restTemplate.exchange(url, method, entity, clazz);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound ex) {
            throw new NotFoundException("User not found when calling User Service");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new BadRequestException("Invalid request to User Service: " + ex.getResponseBodyAsString());
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new BadRequestException("Unauthorized when calling User Service");
        } catch (Exception ex) {
            log.error("Error calling User Service {} {}: {}", method, url, ex.getMessage());
            throw new BadRequestException("User Service call failed: " + ex.getMessage());
        }
    }
}

