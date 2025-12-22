package com.minibank.accountservice.controller;

import com.minibank.accountservice.config.TestKafkaConfig;
import com.minibank.accountservice.dto.TransferRequest;
import com.minibank.accountservice.dto.UpdateBalanceRequest;
import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.entity.AccountStatus;
import com.minibank.accountservice.repository.AccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@ContextConfiguration(classes = {TestKafkaConfig.class})
class InternalAccountControllerTest {

    @LocalServerPort
    private int port;

    private RestClient restClient;

    @Autowired
    private AccountRepository accountRepository;

    private static final String SECRET = "test-secret";

    private UUID acc1;
    private UUID acc2;
    private UUID user1;
    private UUID user2;

    @BeforeEach
    void setUp() {
        restClient = RestClient.builder()
                .baseUrl("http://localhost:" + port + "/api")
                .defaultHeader("X-Internal-Secret", SECRET)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
        accountRepository.deleteAll();
        user1 = UUID.randomUUID();
        user2 = UUID.randomUUID();
        acc1 = UUID.randomUUID();
        acc2 = UUID.randomUUID();

        Account a1 = new Account();
        a1.setId(acc1);
        a1.setUserId(user1);
        a1.setBalance(new BigDecimal("100000"));
        a1.setStatus(AccountStatus.ACTIVE);

        Account a2 = new Account();
        a2.setId(acc2);
        a2.setUserId(user2);
        a2.setBalance(new BigDecimal("50000"));
        a2.setStatus(AccountStatus.ACTIVE);

        accountRepository.save(a1);
        accountRepository.save(a2);
    }

    @Test
    void getByUser_shouldReturnAccount() {
        AccountResponse resp = restClient.get()
                .uri("/internal/accounts/by-user/{userId}", user1)
                .retrieve()
                .body(AccountResponse.class);

        assertThat(resp).isNotNull();
        assertThat(resp.getUserId()).isEqualTo(user1);
        assertThat(resp.getAccountId()).isEqualTo(acc1);
        assertThat(resp.getBalance()).isEqualByComparingTo("100000");
    }

    @Test
    void updateBalance_deposit_shouldIncrease() {
        UpdateBalanceRequest req = new UpdateBalanceRequest();
        req.setOperation(UpdateBalanceRequest.Operation.DEPOSIT);
        req.setAmount(new BigDecimal("1000"));

        AccountResponse resp = restClient.patch()
                .uri("/internal/accounts/{id}/update-balance", acc1)
                .body(req)
                .retrieve()
                .body(AccountResponse.class);

        assertThat(resp).isNotNull();
        assertThat(resp.getBalance()).isEqualByComparingTo("101000");
    }

    @Test
    void transfer_shouldMoveBalanceBetweenAccounts() {
        TransferRequest req = new TransferRequest();
        req.setFromAccountId(acc1);
        req.setToAccountId(acc2);
        req.setAmount(new BigDecimal("10000"));

        ApiResponseString transferResp = restClient.post()
                .uri("/internal/accounts/transfer")
                .body(req)
                .retrieve()
                .body(ApiResponseString.class);
        assertThat(transferResp).isNotNull();
        assertThat(transferResp.getMessage()).isEqualTo("Transfer completed");

        BalanceResponse balance1 = restClient.get()
                .uri("/internal/accounts/{id}/balance", acc1)
                .retrieve()
                .body(BalanceResponse.class);
        BalanceResponse balance2 = restClient.get()
                .uri("/internal/accounts/{id}/balance", acc2)
                .retrieve()
                .body(BalanceResponse.class);

        assertThat(balance1).isNotNull();
        assertThat(balance2).isNotNull();
        assertThat(balance1.getBalance()).isEqualByComparingTo("90000");
        assertThat(balance2.getBalance()).isEqualByComparingTo("60000");
    }

    @Test
    void freeze_thenUpdateBalance_shouldReturnBadRequest() {
        ApiResponseString freezeResp = restClient.patch()
                .uri("/internal/accounts/{id}/freeze", acc1)
                .retrieve()
                .body(ApiResponseString.class);
        assertThat(freezeResp).isNotNull();

        UpdateBalanceRequest req = new UpdateBalanceRequest();
        req.setOperation(UpdateBalanceRequest.Operation.DEPOSIT);
        req.setAmount(new BigDecimal("1000"));

        try {
            restClient.patch()
                    .uri("/internal/accounts/{id}/update-balance", acc1)
                    .body(req)
                    .retrieve()
                    .toBodilessEntity();
        } catch (HttpClientErrorException ex) {
            HttpStatusCode status = ex.getStatusCode();
            assertThat(status.is4xxClientError()).isTrue();
            return;
        }
        throw new AssertionError("Expected 4xx response");
    }

    // Simple typed DTOs for assertions
    private static class ApiResponseString {
        private String message;
        private String data;

        public String getMessage() {
            return message;
        }

        public String getData() {
            return data;
        }
    }

    private static class AccountResponse {
        private UUID accountId;
        private UUID userId;
        private BigDecimal balance;
        private AccountStatus status;

        public UUID getAccountId() {
            return accountId;
        }

        public UUID getUserId() {
            return userId;
        }

        public BigDecimal getBalance() {
            return balance;
        }

        public AccountStatus getStatus() {
            return status;
        }
    }

    private static class BalanceResponse {
        private UUID accountId;
        private BigDecimal balance;

        public UUID getAccountId() {
            return accountId;
        }

        public BigDecimal getBalance() {
            return balance;
        }
    }
}

