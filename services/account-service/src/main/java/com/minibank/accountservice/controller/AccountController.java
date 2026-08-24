package com.minibank.accountservice.controller;

import com.minibank.accountservice.dto.AccountResponse;
import com.minibank.accountservice.dto.AccountStatusResponse;
import com.minibank.accountservice.dto.ApiResponse;
import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.exception.BadRequestException;
import com.minibank.accountservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final AccountService accountService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AccountResponse>> getMyAccount(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Fetching account info for current user: {}", userId);
        if (userId == null) {
            throw new BadRequestException("X-User-Id header is required");
        }
        Account account = accountService.getByUserId(userId);
        return ResponseEntity.ok(new ApiResponse<>("Account info", AccountResponse.from(account)));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<AccountStatusResponse>> getAccountStatus(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Fetching account status for current user: {}", userId);
        if (userId == null) {
            throw new BadRequestException("X-User-Id header is required");
        }
        Account account = accountService.getByUserId(userId);
        AccountStatusResponse statusResponse = AccountStatusResponse.builder()
                .status(account.getStatus())
                .build();
        return ResponseEntity.ok(new ApiResponse<>("Account status", statusResponse));
    }
}


