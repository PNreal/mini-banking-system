package com.minibank.transactionservice.client;

import com.minibank.transactionservice.dto.AccountResponse;
import com.minibank.transactionservice.dto.AccountTransferRequest;
import com.minibank.transactionservice.dto.UpdateBalanceRequest;
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

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountServiceClient {

    private final RestTemplate restTemplate;

    @Value("${services.account-service.url:http://localhost:8082/api}")
    private String accountServiceUrl;
    @Value("${services.internal-secret:internal-secret}")
    private String internalSecret;

    public AccountResponse getAccountByUser(UUID userId) {
        String url = accountServiceUrl + "/internal/accounts/by-user/" + userId;
        return exchange(url, HttpMethod.GET, null, AccountResponse.class);
    }

    public AccountResponse getAccount(UUID accountId) {
        String url = accountServiceUrl + "/internal/accounts/" + accountId;
        return exchange(url, HttpMethod.GET, null, AccountResponse.class);
    }

    public AccountResponse updateBalance(UUID accountId, UpdateBalanceRequest request) {
        String url = accountServiceUrl + "/internal/accounts/" + accountId + "/update-balance";
        return exchange(url, HttpMethod.PATCH, request, AccountResponse.class);
    }

    public void transfer(AccountTransferRequest request) {
        String url = accountServiceUrl + "/internal/accounts/transfer";
        exchange(url, HttpMethod.POST, request, Void.class);
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
            throw new NotFoundException("Resource not found when calling Account Service");
        } catch (HttpClientErrorException.BadRequest ex) {
            throw new BadRequestException("Invalid request to Account Service: " + ex.getResponseBodyAsString());
        } catch (HttpClientErrorException.Unauthorized ex) {
            throw new BadRequestException("Unauthorized when calling Account Service");
        } catch (Exception ex) {
            log.error("Error calling Account Service {} {}: {}", method, url, ex.getMessage());
            throw new BadRequestException("Account Service call failed: " + ex.getMessage());
        }
    }
}


