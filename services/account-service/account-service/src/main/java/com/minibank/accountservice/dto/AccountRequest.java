package com.minibank.accountservice.dto;

import com.minibank.accountservice.entity.Account;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountRequest {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Account type is required")
    private Account.AccountType accountType;
    
    @Positive(message = "Initial balance must be positive")
    private BigDecimal initialBalance;
    
    @NotNull(message = "Currency is required")
    private String currency;
}

