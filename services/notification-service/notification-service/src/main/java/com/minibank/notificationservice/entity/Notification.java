package com.minibank.notificationservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "notification_id")
    private UUID notificationId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "recipient_email", length = 255)
    private String recipientEmail;
    
    @Column(name = "recipient_phone", length = 20)
    private String recipientPhone;
    
    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private NotificationStatus status;
    
    @Column(name = "channel", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private NotificationChannel channel;
    
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = NotificationStatus.PENDING;
        }
    }
    
    public enum NotificationType {
        TRANSACTION_SUCCESS,
        TRANSACTION_FAILED,
        ACCOUNT_CREATED,
        ACCOUNT_LOCKED,
        ACCOUNT_UNLOCKED,
        ACCOUNT_FROZEN,
        ACCOUNT_UNFROZEN,
        BALANCE_LOW,
        PAYMENT_DUE,
        SECURITY_ALERT,
        SYSTEM_UPDATE,
        PROMOTIONAL
    }
    
    public enum NotificationStatus {
        PENDING,
        SENT,
        DELIVERED,
        FAILED,
        READ
    }
    
    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH,
        IN_APP
    }
}

