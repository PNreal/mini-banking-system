package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.AmountRequest;
import com.minibank.transactionservice.dto.ApiResponse;
import com.minibank.transactionservice.dto.CounterDepositRequest;
import com.minibank.transactionservice.dto.PagedResponse;
import com.minibank.transactionservice.dto.TransactionResponse;
import com.minibank.transactionservice.dto.TransferRequest;
import com.minibank.transactionservice.entity.TransactionType;
import com.minibank.transactionservice.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(@Valid @RequestBody AmountRequest request,
                                                                    @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Deposit request for user {}", userId);
        TransactionResponse response = transactionService.deposit(request.getAmount(), userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit-counter")
    public ResponseEntity<ApiResponse<TransactionResponse>> depositAtCounter(@Valid @RequestBody CounterDepositRequest request,
                                                                             @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Counter deposit request for user {} at counter {}", userId, request.getCounterId());
        TransactionResponse response = transactionService.depositAtCounter(request.getAmount(), userId, request.getCounterId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit-counter/{transactionId}/confirm")
    public ResponseEntity<ApiResponse<TransactionResponse>> confirmCounterDeposit(
            @PathVariable UUID transactionId,
            @RequestHeader(value = "X-User-Id", required = false) UUID staffId) {
        log.info("Confirm counter deposit for transaction {} by staff {}", transactionId, staffId);
        TransactionResponse response = transactionService.confirmCounterDeposit(transactionId, staffId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit-counter/{transactionId}/cancel")
    public ResponseEntity<ApiResponse<TransactionResponse>> cancelCounterDeposit(
            @PathVariable UUID transactionId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Cancel counter deposit for transaction {} by user {}", transactionId, userId);
        TransactionResponse response = transactionService.cancelCounterDeposit(transactionId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(@Valid @RequestBody AmountRequest request,
                                                                     @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Withdraw request for user {}", userId);
        TransactionResponse response = transactionService.withdraw(request.getAmount(), userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(@Valid @RequestBody TransferRequest request,
                                                                     @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Transfer request from user {} to account {}", userId, request.getToAccountId());
        TransactionResponse response = transactionService.transfer(request.getAmount(), userId, request.getToAccountId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> history(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        PagedResponse<TransactionResponse> response = transactionService.history(userId, type, from, to, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @PathVariable UUID transactionId) {
        log.info("Get transaction {} for user {}", transactionId, userId);
        TransactionResponse response = transactionService.getTransaction(userId, transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}


