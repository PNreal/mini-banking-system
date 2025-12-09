package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private UUID accountId;
    private UUID userId;
    private BigDecimal balance;
    private String status;
}

