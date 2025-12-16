package com.minibank.userservice.service;

import com.minibank.userservice.dto.CreateAccountRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.account-service.url:http://localhost:8082}")
    private String accountServiceUrl;

    @Value("${internal.secret:internal-secret}")
    private String internalSecret;

    public void createAccount(CreateAccountRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<CreateAccountRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Void> response = restTemplate.exchange(
                    accountServiceUrl + "/internal/accounts/create",
                    HttpMethod.POST,
                    entity,
                    Void.class
            );
            log.debug("Account creation triggered for user {}", request.getUserId());
        } catch (Exception ex) {
            log.error("Failed to create account for user {}", request.getUserId(), ex);
            throw new RuntimeException("Failed to create account for user");
        }
    }
}

