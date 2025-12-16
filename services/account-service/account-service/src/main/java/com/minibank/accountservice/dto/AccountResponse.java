package com.minibank.accountservice.dto;

import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.entity.AccountStatus;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class AccountResponse {
    UUID accountId;
    UUID userId;
    BigDecimal balance;
    AccountStatus status;

    public static AccountResponse from(Account account) {
        return AccountResponse.builder()
                .accountId(account.getId())
                .userId(account.getUserId())
                .balance(account.getBalance())
                .status(account.getStatus())
                .build();
    }
}

