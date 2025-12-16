package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.*;
import com.minibank.transactionservice.exception.TransactionException;
import com.minibank.transactionservice.service.TransactionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
@Validated
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody DepositRequest request) {

        UUID userId = extractUserIdOrThrow(userIdHeader, "/api/v1/transactions/deposit");
        TransactionResponse response = transactionService.deposit(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody WithdrawRequest request) {

        UUID userId = extractUserIdOrThrow(userIdHeader, "/api/v1/transactions/withdraw");
        TransactionResponse response = transactionService.withdraw(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody TransferRequest request) {

        UUID userId = extractUserIdOrThrow(userIdHeader, "/api/v1/transactions/transfer");
        TransactionResponse response = transactionService.transfer(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {

        UUID userId = extractUserIdOrThrow(userIdHeader, "/api/v1/transactions/history");

        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("timestamp").descending());
        Page<TransactionResponse> transactions = transactionService.getTransactionHistory(
                userId, type, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    private UUID extractUserIdOrThrow(String userIdHeader, String path) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            throw new TransactionException(
                    "UNAUTHORIZED",
                    "User ID is required",
                    HttpStatus.UNAUTHORIZED
            );
        }
        try {
            return UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new TransactionException(
                    "INVALID_INPUT",
                    "X-User-Id header must be a valid UUID",
                    HttpStatus.BAD_REQUEST
            );
        }
    }
}

