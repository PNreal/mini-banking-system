package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffPendingTransactionResponse {
    private UUID transactionId;
    private String type;
    private String status;
    private String customerName;
    private String accountNumber;
    private BigDecimal amount;
    private OffsetDateTime createdAt;
    private String transactionCode;
}


