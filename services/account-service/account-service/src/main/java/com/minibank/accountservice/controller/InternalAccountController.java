package com.minibank.accountservice.controller;

import com.minibank.accountservice.dto.AccountResponse;
import com.minibank.accountservice.dto.ApiResponse;
import com.minibank.accountservice.dto.BalanceResponse;
import com.minibank.accountservice.dto.CreateAccountRequest;
import com.minibank.accountservice.dto.TransferRequest;
import com.minibank.accountservice.dto.UpdateBalanceRequest;
import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/internal/accounts")
@RequiredArgsConstructor
public class InternalAccountController {

    private final AccountService accountService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<AccountResponse>> create(@Valid @RequestBody CreateAccountRequest request) {
        Account created = accountService.createAccount(request);
        return ResponseEntity.ok(new ApiResponse<>("Account created", AccountResponse.from(created)));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<AccountResponse> getByUser(@PathVariable UUID userId) {
        Account account = accountService.getByUserId(userId);
        return ResponseEntity.ok(AccountResponse.from(account));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<AccountResponse> getById(@PathVariable UUID accountId) {
        Account account = accountService.getById(accountId);
        return ResponseEntity.ok(AccountResponse.from(account));
    }

    @GetMapping("/{accountId}/balance")
    public ResponseEntity<BalanceResponse> getBalance(@PathVariable UUID accountId) {
        Account account = accountService.getById(accountId);
        return ResponseEntity.ok(BalanceResponse.builder()
                .accountId(account.getId())
                .balance(account.getBalance())
                .build());
    }

    @PatchMapping("/{accountId}/update-balance")
    public ResponseEntity<AccountResponse> updateBalance(@PathVariable UUID accountId,
                                                         @Valid @RequestBody UpdateBalanceRequest request) {
        Account updated = accountService.updateBalance(accountId, request);
        return ResponseEntity.ok(AccountResponse.from(updated));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<String>> transfer(@Valid @RequestBody TransferRequest request) {
        accountService.transfer(request);
        return ResponseEntity.ok(new ApiResponse<>("Transfer completed", "OK"));
    }

    @PatchMapping("/{accountId}/freeze")
    public ResponseEntity<ApiResponse<String>> freeze(@PathVariable UUID accountId) {
        accountService.freeze(accountId);
        return ResponseEntity.ok(new ApiResponse<>("Account frozen", "OK"));
    }

    @PatchMapping("/{accountId}/unfreeze")
    public ResponseEntity<ApiResponse<String>> unfreeze(@PathVariable UUID accountId) {
        accountService.unfreeze(accountId);
        return ResponseEntity.ok(new ApiResponse<>("Account unfrozen", "OK"));
    }

    @PatchMapping("/{accountId}/lock")
    public ResponseEntity<ApiResponse<String>> lock(@PathVariable UUID accountId) {
        accountService.lock(accountId);
        return ResponseEntity.ok(new ApiResponse<>("Account locked", "OK"));
    }

    @PatchMapping("/{accountId}/unlock")
    public ResponseEntity<ApiResponse<String>> unlock(@PathVariable UUID accountId) {
        accountService.unlock(accountId);
        return ResponseEntity.ok(new ApiResponse<>("Account unlocked", "OK"));
    }

    /**
     * Kích hoạt tài khoản sau khi KYC được approve
     * Tạo số tài khoản chính thức cho user
     */
    @PostMapping("/activate-kyc/{userId}")
    public ResponseEntity<ApiResponse<AccountResponse>> activateAfterKyc(@PathVariable UUID userId) {
        Account account = accountService.activateAfterKyc(userId);
        return ResponseEntity.ok(new ApiResponse<>("Account activated after KYC", AccountResponse.from(account)));
    }
}

