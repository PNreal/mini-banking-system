package com.minibank.transactionservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "counter_staff", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"counter_id", "user_id"})
})
public class CounterStaff {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "counter_staff_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "counter_id", nullable = false)
    private UUID counterId;

    @Column(name = "user_id", nullable = false)
    private UUID userId; // ID của nhân viên (từ user service)

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private java.time.OffsetDateTime createdAt;

    @Column(nullable = false)
    private java.time.OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = java.time.OffsetDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = java.time.OffsetDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = java.time.OffsetDateTime.now();
    }
}

