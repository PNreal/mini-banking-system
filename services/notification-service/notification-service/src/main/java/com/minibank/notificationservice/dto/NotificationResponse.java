package com.minibank.notificationservice.dto;

import com.minibank.notificationservice.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private UUID notificationId;
    private UUID userId;
    private Notification.NotificationType type;
    private String title;
    private String message;
    private String recipientEmail;
    private String recipientPhone;
    private Notification.NotificationStatus status;
    private Notification.NotificationChannel channel;
    private LocalDateTime sentAt;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
    
    public static NotificationResponse fromEntity(Notification notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .recipientEmail(notification.getRecipientEmail())
                .recipientPhone(notification.getRecipientPhone())
                .status(notification.getStatus())
                .channel(notification.getChannel())
                .sentAt(notification.getSentAt())
                .readAt(notification.getReadAt())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

