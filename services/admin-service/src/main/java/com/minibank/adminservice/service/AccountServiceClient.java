package com.minibank.adminservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.account-service.url}")
    private String accountServiceUrl;
    @Value("${services.internal-secret:internal-secret}")
    private String internalSecret;

    public UUID getAccountIdByUser(UUID userId, String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/by-user/" + userId;
            var response = restTemplate.exchange(url, HttpMethod.GET, entity, com.minibank.adminservice.dto.AccountResponse.class);
            if (response.getBody() == null || response.getBody().getAccountId() == null) {
                throw new IllegalStateException("Account not found for user " + userId);
            }
            return response.getBody().getAccountId();
        } catch (Exception e) {
            log.error("Error getting account by user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Failed to get account by user", e);
        }
    }

    public void freezeAccount(UUID accountId, String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/" + accountId + "/freeze";
            restTemplate.exchange(url, HttpMethod.PATCH, entity, Void.class);
            log.info("Account {} frozen successfully", accountId);
        } catch (Exception e) {
            log.error("Error freezing account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to freeze account", e);
        }
    }

    public void unfreezeAccount(UUID accountId, String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/" + accountId + "/unfreeze";
            restTemplate.exchange(url, HttpMethod.PATCH, entity, Void.class);
            log.info("Account {} unfrozen successfully", accountId);
        } catch (Exception e) {
            log.error("Error unfreezing account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to unfreeze account", e);
        }
    }

    public void lockAccount(UUID accountId, String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/" + accountId + "/lock";
            restTemplate.exchange(url, HttpMethod.PATCH, entity, Void.class);
            log.info("Account {} locked successfully", accountId);
        } catch (Exception e) {
            log.error("Error locking account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to lock account", e);
        }
    }

    public void unlockAccount(UUID accountId, String authToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authToken);
            headers.set("X-Internal-Secret", internalSecret);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String url = accountServiceUrl + "/internal/accounts/" + accountId + "/unlock";
            restTemplate.exchange(url, HttpMethod.PATCH, entity, Void.class);
            log.info("Account {} unlocked successfully", accountId);
        } catch (Exception e) {
            log.error("Error unlocking account {}: {}", accountId, e.getMessage(), e);
            throw new RuntimeException("Failed to unlock account", e);
        }
    }
}

