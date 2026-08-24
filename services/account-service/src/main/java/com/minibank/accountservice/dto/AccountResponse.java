package com.minibank.accountservice.dto;

import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.entity.AccountStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Value
@Builder
public class AccountResponse {
    UUID accountId;
    String accountNumber;
    UUID userId;
    BigDecimal balance;
    AccountStatus status;
    LocalDateTime createdAt;

    public static AccountResponse from(Account account) {
        return AccountResponse.builder()
                .accountId(account.getId())
                .accountNumber(account.getAccountNumber())
                .userId(account.getUserId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .createdAt(account.getCreatedAt())
                .build();
    }
}

