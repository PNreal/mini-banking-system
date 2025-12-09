package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.*;
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
        
        UUID userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User ID is required", "/api/v1/transactions/deposit"));
        }

        try {
            TransactionResponse response = transactionService.deposit(userId, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Deposit failed: {}", e.getMessage());
            String errorCode = getErrorCode(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(errorCode, e.getMessage(), "/api/v1/transactions/deposit"));
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody WithdrawRequest request) {
        
        UUID userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User ID is required", "/api/v1/transactions/withdraw"));
        }

        try {
            TransactionResponse response = transactionService.withdraw(userId, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Withdraw failed: {}", e.getMessage());
            String errorCode = getErrorCode(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(errorCode, e.getMessage(), "/api/v1/transactions/withdraw"));
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody TransferRequest request) {
        
        UUID userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User ID is required", "/api/v1/transactions/transfer"));
        }

        try {
            TransactionResponse response = transactionService.transfer(userId, request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Transfer failed: {}", e.getMessage());
            String errorCode = getErrorCode(e.getMessage());
            HttpStatus status = errorCode.equals("RECEIVER_ACCOUNT_NOT_FOUND") ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            return ResponseEntity.status(status)
                    .body(ApiResponse.error(errorCode, e.getMessage(), "/api/v1/transactions/transfer"));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        
        UUID userId = extractUserId(userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User ID is required", "/api/v1/transactions/history"));
        }

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
            Page<TransactionResponse> transactions = transactionService.getTransactionHistory(
                    userId, type, from, to, pageable);
            return ResponseEntity.ok(ApiResponse.success(transactions));
        } catch (RuntimeException e) {
            log.error("Failed to fetch transaction history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("TRANSACTION_HISTORY_ERROR", e.getMessage(), "/api/v1/transactions/history"));
        }
    }

    private UUID extractUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String getErrorCode(String message) {
        if (message.contains("not found")) {
            return "ACCOUNT_NOT_FOUND";
        }
        if (message.contains("not active")) {
            return "ACCOUNT_INVALID_STATUS";
        }
        if (message.contains("Insufficient")) {
            return "INSUFFICIENT_BALANCE";
        }
        if (message.contains("Receiver account not found")) {
            return "RECEIVER_ACCOUNT_NOT_FOUND";
        }
        if (message.contains("status is invalid")) {
            return "RECEIVER_ACCOUNT_INVALID_STATUS";
        }
        return "TRANSACTION_FAILED";
    }
}

