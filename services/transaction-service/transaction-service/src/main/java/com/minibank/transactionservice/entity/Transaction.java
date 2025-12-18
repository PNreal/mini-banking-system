package com.minibank.transactionservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @Column(name = "trans_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "from_acc")
    private UUID fromAccountId;

    @Column(name = "to_acc")
    private UUID toAccountId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    @Column(nullable = false)
    private OffsetDateTime timestamp;

    @Column(length = 50)
    private String transactionCode;

    @Column(name = "staff_id")
    private UUID staffId; // ID của nhân viên xử lý (cho COUNTER_DEPOSIT)

    @Column(name = "counter_id")
    private UUID counterId; // ID của quầy giao dịch

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (timestamp == null) {
            timestamp = OffsetDateTime.now();
        }
    }
}


