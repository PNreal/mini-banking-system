package com.minibank.transactionservice.dto;

import com.minibank.transactionservice.entity.Transaction;
import com.minibank.transactionservice.entity.TransactionStatus;
import com.minibank.transactionservice.entity.TransactionType;
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
public class TransactionResponse {
    private UUID transactionId;
    private TransactionType type;
    private TransactionStatus status;
    private UUID fromAccountId;
    private UUID toAccountId;
    private BigDecimal amount;
    private OffsetDateTime timestamp;
    private BigDecimal newBalance;
    private String transactionCode;
    private UUID counterId;
    private UUID staffId;

    public static TransactionResponse from(Transaction tx) {
        return TransactionResponse.builder()
                .transactionId(tx.getId())
                .type(tx.getType())
                .status(tx.getStatus())
                .fromAccountId(tx.getFromAccountId())
                .toAccountId(tx.getToAccountId())
                .amount(tx.getAmount())
                .timestamp(tx.getTimestamp())
                .transactionCode(tx.getTransactionCode())
                .counterId(tx.getCounterId())
                .staffId(tx.getStaffId())
                .build();
    }

    public TransactionResponse withBalance(BigDecimal balance) {
        this.newBalance = balance;
        return this;
    }
}


