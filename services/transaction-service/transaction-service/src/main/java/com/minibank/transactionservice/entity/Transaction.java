package com.minibank.transactionservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transaction", indexes = {
    @Index(name = "idx_transaction_timestamp", columnList = "timestamp"),
    @Index(name = "idx_transaction_from_acc", columnList = "from_acc"),
    @Index(name = "idx_transaction_to_acc", columnList = "to_acc"),
    @Index(name = "idx_transaction_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "trans_id")
    private UUID transId;

    @Column(name = "from_acc")
    private UUID fromAcc;

    @Column(name = "to_acc")
    private UUID toAcc;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    @NotNull
    @Positive
    private BigDecimal amount;

    @Column(name = "type", nullable = false, length = 20)
    @NotNull
    private String type;

    @Column(name = "timestamp", nullable = false)
    @NotNull
    private LocalDateTime timestamp;

    @Column(name = "status", nullable = false, length = 20)
    @NotNull
    private String status;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}

