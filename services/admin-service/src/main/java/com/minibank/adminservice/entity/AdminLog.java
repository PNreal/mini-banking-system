package com.minibank.adminservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_logs", indexes = {
    @Index(name = "idx_admin_logs_admin_id", columnList = "admin_id"),
    @Index(name = "idx_admin_logs_target_user", columnList = "target_user"),
    @Index(name = "idx_admin_logs_time", columnList = "time")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "admin_log_id")
    private UUID adminLogId;

    @Column(name = "admin_id", nullable = false)
    @NotNull
    private UUID adminId;

    @Column(name = "action", nullable = false, length = 100)
    @NotBlank
    private String action; // FREEZE, UNFREEZE, LOCK, UNLOCK

    @Column(name = "target_user", nullable = false)
    @NotNull
    private UUID targetUser;

    @Column(name = "time", nullable = false)
    private LocalDateTime time;

    @PrePersist
    protected void onCreate() {
        if (time == null) {
            time = LocalDateTime.now();
        }
    }
}

