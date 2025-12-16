package com.minibank.notificationservice.service;

import com.minibank.notificationservice.dto.WebSocketMessage;
import com.minibank.notificationservice.entity.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Push transaction notification to user
     */
    public void pushTransactionNotification(UUID userId, UUID transactionId, String type, 
                                           Double amount, String status, Double newBalance) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .event("TRANSACTION")
                    .transactionId(transactionId)
                    .type(type)
                    .amount(amount)
                    .status(status)
                    .newBalance(newBalance)
                    .timestamp(LocalDateTime.now())
                    .build();

            String destination = "/topic/transactions/" + userId;
            messagingTemplate.convertAndSend(destination, message);
            log.info("Pushed transaction notification to user {} via WebSocket", userId);
        } catch (Exception e) {
            log.error("Failed to push transaction notification via WebSocket: {}", e.getMessage(), e);
        }
    }

    /**
     * Push account status notification to user
     */
    public void pushAccountStatusNotification(UUID userId, String status, String reason) {
        try {
            WebSocketMessage message = WebSocketMessage.builder()
                    .event("ACCOUNT_STATUS")
                    .status(status)
                    .reason(reason)
                    .timestamp(LocalDateTime.now())
                    .build();

            String destination = "/topic/account-status/" + userId;
            messagingTemplate.convertAndSend(destination, message);
            log.info("Pushed account status notification to user {} via WebSocket", userId);
        } catch (Exception e) {
            log.error("Failed to push account status notification via WebSocket: {}", e.getMessage(), e);
        }
    }

    /**
     * Push security alert to user
     */
    public void pushSecurityAlert(UUID userId, String message) {
        try {
            WebSocketMessage wsMessage = WebSocketMessage.builder()
                    .event("SECURITY_ALERT")
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();

            String destination = "/topic/security/" + userId;
            messagingTemplate.convertAndSend(destination, wsMessage);
            log.info("Pushed security alert to user {} via WebSocket", userId);
        } catch (Exception e) {
            log.error("Failed to push security alert via WebSocket: {}", e.getMessage(), e);
        }
    }

    /**
     * Push system broadcast to all users
     */
    public void pushSystemBroadcast(String message) {
        try {
            WebSocketMessage wsMessage = WebSocketMessage.builder()
                    .event("SYSTEM_BROADCAST")
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();

            messagingTemplate.convertAndSend("/topic/system", wsMessage);
            log.info("Pushed system broadcast via WebSocket");
        } catch (Exception e) {
            log.error("Failed to push system broadcast via WebSocket: {}", e.getMessage(), e);
        }
    }

    /**
     * Push notification based on notification entity
     */
    public void pushNotification(Notification notification) {
        try {
            UUID userId = notification.getUserId();
            Notification.NotificationType type = notification.getType();

            WebSocketMessage message = WebSocketMessage.builder()
                    .event("NOTIFICATION")
                    .notificationId(notification.getNotificationId())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .type(type.name())
                    .timestamp(notification.getCreatedAt())
                    .build();

            // Determine destination based on notification type
            String destination;
            if (type == Notification.NotificationType.TRANSACTION_SUCCESS || 
                type == Notification.NotificationType.TRANSACTION_FAILED) {
                destination = "/topic/transactions/" + userId;
            } else if (type == Notification.NotificationType.ACCOUNT_LOCKED ||
                      type == Notification.NotificationType.ACCOUNT_UNLOCKED ||
                      type == Notification.NotificationType.ACCOUNT_FROZEN ||
                      type == Notification.NotificationType.ACCOUNT_UNFROZEN) {
                destination = "/topic/account-status/" + userId;
            } else if (type == Notification.NotificationType.SECURITY_ALERT) {
                destination = "/topic/security/" + userId;
            } else {
                // Default to general notification channel
                destination = "/topic/notifications/" + userId;
            }

            messagingTemplate.convertAndSend(destination, message);
            log.info("Pushed notification {} to user {} via WebSocket", notification.getNotificationId(), userId);
        } catch (Exception e) {
            log.error("Failed to push notification via WebSocket: {}", e.getMessage(), e);
        }
    }
}

