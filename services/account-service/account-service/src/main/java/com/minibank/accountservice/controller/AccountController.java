package com.minibank.accountservice.controller;

import com.minibank.accountservice.dto.AccountRequest;
import com.minibank.accountservice.dto.AccountResponse;
import com.minibank.accountservice.dto.ApiResponse;
import com.minibank.accountservice.dto.BalanceUpdateRequest;
import com.minibank.accountservice.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {
    
    private final AccountService accountService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<AccountResponse>> createAccount(
            @Valid @RequestBody AccountRequest request,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Creating account request received");
        
        // Use userId from header if provided, otherwise use from request
        if (userId != null) {
            request.setUserId(userId);
        }
        
        AccountResponse account = accountService.createAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(account));
    }
    
    @GetMapping("/{accountId}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountById(
            @PathVariable UUID accountId) {
        log.info("Getting account by ID: {}", accountId);
        
        AccountResponse account = accountService.getAccountById(accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountByNumber(
            @PathVariable String accountNumber) {
        log.info("Getting account by number: {}", accountNumber);
        
        AccountResponse account = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccountsByUserId(
            @PathVariable UUID userId) {
        log.info("Getting accounts for user: {}", userId);
        
        List<AccountResponse> accounts = accountService.getAccountsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }
    
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getActiveAccountsByUserId(
            @PathVariable UUID userId) {
        log.info("Getting active accounts for user: {}", userId);
        
        List<AccountResponse> accounts = accountService.getActiveAccountsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }
    
    @PutMapping("/balance")
    public ResponseEntity<ApiResponse<AccountResponse>> updateBalance(
            @Valid @RequestBody BalanceUpdateRequest request) {
        log.info("Updating balance for account: {}", request.getAccountId());
        
        AccountResponse account = accountService.updateBalance(request);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @PatchMapping("/{accountId}/lock")
    public ResponseEntity<ApiResponse<AccountResponse>> lockAccount(
            @PathVariable UUID accountId) {
        log.info("Locking account: {}", accountId);
        
        AccountResponse account = accountService.lockAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @PatchMapping("/{accountId}/unlock")
    public ResponseEntity<ApiResponse<AccountResponse>> unlockAccount(
            @PathVariable UUID accountId) {
        log.info("Unlocking account: {}", accountId);
        
        AccountResponse account = accountService.unlockAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @PatchMapping("/{accountId}/freeze")
    public ResponseEntity<ApiResponse<AccountResponse>> freezeAccount(
            @PathVariable UUID accountId) {
        log.info("Freezing account: {}", accountId);
        
        AccountResponse account = accountService.freezeAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @PatchMapping("/{accountId}/unfreeze")
    public ResponseEntity<ApiResponse<AccountResponse>> unfreezeAccount(
            @PathVariable UUID accountId) {
        log.info("Unfreezing account: {}", accountId);
        
        AccountResponse account = accountService.unfreezeAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
    
    @PatchMapping("/{accountId}/close")
    public ResponseEntity<ApiResponse<AccountResponse>> closeAccount(
            @PathVariable UUID accountId) {
        log.info("Closing account: {}", accountId);
        
        AccountResponse account = accountService.closeAccount(accountId);
        return ResponseEntity.ok(ApiResponse.success(account));
    }
}

