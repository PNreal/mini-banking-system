package com.minibank.transactionservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class AccountResponse {
    private UUID accountId;
    private UUID userId;
    private BigDecimal balance;
    private String status;
}


