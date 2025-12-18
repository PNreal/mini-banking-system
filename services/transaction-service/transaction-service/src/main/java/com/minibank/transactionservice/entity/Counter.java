package com.minibank.transactionservice.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "counters")
public class Counter {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "counter_id", nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String counterCode; // Mã quầy (VD: Q001, Q002)

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 200)
    private String address;

    @Column(nullable = false)
    private Integer maxStaff; // Số nhân viên tối đa

    @Column(name = "admin_user_id")
    private UUID adminUserId; // ID của admin quầy (người quản lý quầy)

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

