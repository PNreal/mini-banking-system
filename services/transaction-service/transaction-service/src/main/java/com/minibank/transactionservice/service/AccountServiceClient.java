package com.minibank.transactionservice.service;

import com.minibank.transactionservice.dto.AccountResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.account-service.url}")
    private String accountServiceUrl;

    @Value("${services.internal-secret}")
    private String internalSecret;

    public AccountResponse getAccount(UUID accountId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/" + accountId;
            ResponseEntity<AccountResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, AccountResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch account: " + e.getMessage(), e);
        }
    }

    public AccountResponse getAccountByUserId(UUID userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/by-user/" + userId;
            ResponseEntity<AccountResponse> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, AccountResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching account for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch account: " + e.getMessage(), e);
        }
    }

    public AccountResponse updateBalance(UUID accountId, BigDecimal amount) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            headers.set("Content-Type", "application/json");

            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String url = accountServiceUrl + "/internal/accounts/" + accountId + "/update-balance";
            ResponseEntity<AccountResponse> response = restTemplate.exchange(
                    url, HttpMethod.PATCH, entity, AccountResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error updating balance for account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to update balance: " + e.getMessage(), e);
        }
    }

    public AccountResponse transfer(UUID fromAccountId, UUID toAccountId, BigDecimal amount) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalSecret);
            headers.set("Content-Type", "application/json");

            Map<String, Object> body = new HashMap<>();
            body.put("fromAccountId", fromAccountId.toString());
            body.put("toAccountId", toAccountId.toString());
            body.put("amount", amount);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            String url = accountServiceUrl + "/internal/accounts/transfer";
            ResponseEntity<AccountResponse> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, AccountResponse.class);

            return response.getBody();
        } catch (Exception e) {
            log.error("Error transferring from {} to {}: {}", fromAccountId, toAccountId, e.getMessage(), e);
            throw new RuntimeException("Failed to transfer: " + e.getMessage(), e);
        }
    }
}

