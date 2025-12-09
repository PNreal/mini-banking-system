package com.minibank.transactionservice.dto;

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
public class TransactionResponse {
    private UUID transactionId;
    private String type;
    private BigDecimal amount;
    private UUID fromAccountId;
    private UUID toAccountId;
    private String status;
    private LocalDateTime timestamp;
    private BigDecimal newBalance;
}

