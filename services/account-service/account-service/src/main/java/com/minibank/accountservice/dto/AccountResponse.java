package com.minibank.accountservice.dto;

import com.minibank.accountservice.entity.Account;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountResponse {
    private UUID accountId;
    private UUID userId;
    private String accountNumber;
    private Account.AccountType accountType;
    private BigDecimal balance;
    private String currency;
    private Account.AccountStatus status;
    private Boolean isLocked;
    private Boolean isFrozen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static AccountResponse fromEntity(Account account) {
        return AccountResponse.builder()
                .accountId(account.getAccountId())
                .userId(account.getUserId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus())
                .isLocked(account.getIsLocked())
                .isFrozen(account.getIsFrozen())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}

