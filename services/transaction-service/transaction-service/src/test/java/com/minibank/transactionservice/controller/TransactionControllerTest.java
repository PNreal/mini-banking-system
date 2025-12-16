package com.minibank.transactionservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minibank.transactionservice.dto.DepositRequest;
import com.minibank.transactionservice.dto.TransactionResponse;
import com.minibank.transactionservice.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TransactionControllerTest {

    private final TransactionService transactionService = org.mockito.Mockito.mock(TransactionService.class);

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new TransactionController(transactionService))
            .setControllerAdvice(new com.minibank.transactionservice.exception.GlobalExceptionHandler())
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deposit_withValidHeaderAndBody_returnsSuccess() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        TransactionResponse response = TransactionResponse.builder()
                .transactionId(transactionId)
                .type("DEPOSIT")
                .amount(BigDecimal.valueOf(100_000))
                .toAccountId(UUID.randomUUID())
                .status("SUCCESS")
                .build();

        when(transactionService.deposit(eq(userId), any(DepositRequest.class)))
                .thenReturn(response);

        DepositRequest request = new DepositRequest(BigDecimal.valueOf(100_000));

        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.transactionId").value(transactionId.toString()));
    }

    @Test
    void deposit_withoutUserHeader_returnsUnauthorized() throws Exception {
        DepositRequest request = new DepositRequest(BigDecimal.valueOf(100_000));

        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void deposit_withInvalidAmount_returnsBadRequest() throws Exception {
        // amount <= 0 violates @Positive
        DepositRequest request = new DepositRequest(BigDecimal.valueOf(-10));

        mockMvc.perform(post("/api/v1/transactions/deposit")
                        .header("X-User-Id", UUID.randomUUID().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_INPUT"));
    }
}


