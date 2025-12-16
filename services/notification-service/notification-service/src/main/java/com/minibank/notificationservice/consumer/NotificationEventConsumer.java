package com.minibank.notificationservice.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minibank.notificationservice.dto.NotificationRequest;
import com.minibank.notificationservice.entity.Notification;
import com.minibank.notificationservice.service.NotificationService;
import com.minibank.notificationservice.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {
    
    private final NotificationService notificationService;
    private final WebSocketService webSocketService;
    private final ObjectMapper objectMapper;
    
    @KafkaListener(topics = "TRANSACTION_COMPLETED", groupId = "notification-service-group")
    public void consumeTransactionCompleted(String message, Acknowledgment acknowledgment) {
        try {
            log.info("Received TRANSACTION_COMPLETED event: {}", message);
            Map<String, Object> event = objectMapper.readValue(message, 
                new TypeReference<Map<String, Object>>() {});
            
            UUID userId = UUID.fromString((String) event.get("userId"));
            String type = (String) event.getOrDefault("type", "DEPOSIT");
            Object amountObj = event.get("amount");
            Double amount = amountObj instanceof Number ? ((Number) amountObj).doubleValue() : 
                           amountObj != null ? Double.parseDouble(amountObj.toString()) : 0.0;
            String status = (String) event.getOrDefault("status", "SUCCESS");
            Object balanceObj = event.get("newBalance");
            Double newBalance = balanceObj instanceof Number ? ((Number) balanceObj).doubleValue() : 
                               balanceObj != null ? Double.parseDouble(balanceObj.toString()) : null;
            UUID transactionId = event.get("transactionId") != null ? 
                                UUID.fromString(event.get("transactionId").toString()) : null;
            
            // Push WebSocket notification immediately
            webSocketService.pushTransactionNotification(userId, transactionId, type, amount, status, newBalance);
            
            NotificationRequest request = NotificationRequest.builder()
                    .userId(userId)
                    .type(Notification.NotificationType.TRANSACTION_SUCCESS)
                    .title("Transaction Completed")
                    .message(String.format("Your transaction of %s has been completed successfully.", amount))
                    .channel(Notification.NotificationChannel.EMAIL)
                    .recipientEmail((String) event.get("userEmail"))
                    .build();
            
            notificationService.createNotification(request);
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing TRANSACTION_COMPLETED event: {}", e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "ACCOUNT_EVENT", groupId = "notification-service-group")
    public void consumeAccountEvent(String message, Acknowledgment acknowledgment) {
        try {
            log.info("Received ACCOUNT_EVENT: {}", message);
            Map<String, Object> event = objectMapper.readValue(message, 
                new TypeReference<Map<String, Object>>() {});
            
            UUID userId = UUID.fromString((String) event.get("userId"));
            String eventType = (String) event.get("eventType");
            Notification.NotificationType notificationType = mapAccountEventType(eventType);
            
            if (notificationType != null) {
                String status = mapEventTypeToStatus(eventType);
                String reason = (String) event.getOrDefault("reason", "Account status changed");
                
                // Push WebSocket notification immediately
                webSocketService.pushAccountStatusNotification(userId, status, reason);
                
                NotificationRequest request = NotificationRequest.builder()
                        .userId(userId)
                        .type(notificationType)
                        .title(getTitleForAccountEvent(eventType))
                        .message((String) event.getOrDefault("message", getTitleForAccountEvent(eventType)))
                        .channel(Notification.NotificationChannel.IN_APP)
                        .build();
                
                notificationService.createNotification(request);
            }
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing ACCOUNT_EVENT: {}", e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "ADMIN_ACTION", groupId = "notification-service-group")
    public void consumeAdminAction(String message, Acknowledgment acknowledgment) {
        try {
            log.info("Received ADMIN_ACTION event: {}", message);
            Map<String, Object> event = objectMapper.readValue(message, 
                new TypeReference<Map<String, Object>>() {});
            
            UUID userId = UUID.fromString((String) event.get("targetUserId"));
            String action = (String) event.getOrDefault("action", "Unknown action");
            String message = String.format("Admin action performed on your account: %s", action);
            
            // Push WebSocket security alert immediately
            webSocketService.pushSecurityAlert(userId, message);
            
            NotificationRequest request = NotificationRequest.builder()
                    .userId(userId)
                    .type(Notification.NotificationType.SECURITY_ALERT)
                    .title("Account Activity Alert")
                    .message(message)
                    .channel(Notification.NotificationChannel.EMAIL)
                    .recipientEmail((String) event.get("userEmail"))
                    .build();
            
            notificationService.createNotification(request);
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing ADMIN_ACTION event: {}", e.getMessage(), e);
        }
    }
    
    private Notification.NotificationType mapAccountEventType(String eventType) {
        return switch (eventType) {
            case "ACCOUNT_CREATED" -> Notification.NotificationType.ACCOUNT_CREATED;
            case "ACCOUNT_LOCKED" -> Notification.NotificationType.ACCOUNT_LOCKED;
            case "ACCOUNT_UNLOCKED" -> Notification.NotificationType.ACCOUNT_UNLOCKED;
            case "ACCOUNT_FROZEN" -> Notification.NotificationType.ACCOUNT_FROZEN;
            case "ACCOUNT_UNFROZEN" -> Notification.NotificationType.ACCOUNT_UNFROZEN;
            default -> null;
        };
    }
    
    private String getTitleForAccountEvent(String eventType) {
        return switch (eventType) {
            case "ACCOUNT_CREATED" -> "Account Created";
            case "ACCOUNT_LOCKED" -> "Account Locked";
            case "ACCOUNT_UNLOCKED" -> "Account Unlocked";
            case "ACCOUNT_FROZEN" -> "Account Frozen";
            case "ACCOUNT_UNFROZEN" -> "Account Unfrozen";
            default -> "Account Update";
        };
    }
    
    private String mapEventTypeToStatus(String eventType) {
        return switch (eventType) {
            case "ACCOUNT_LOCKED" -> "LOCKED";
            case "ACCOUNT_UNLOCKED" -> "UNLOCKED";
            case "ACCOUNT_FROZEN" -> "FROZEN";
            case "ACCOUNT_UNFROZEN" -> "UNFROZEN";
            default -> "ACTIVE";
        };
    }
}

