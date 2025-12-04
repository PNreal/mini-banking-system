package com.minibank.notificationservice.service;

import com.minibank.notificationservice.dto.NotificationRequest;
import com.minibank.notificationservice.dto.NotificationResponse;
import com.minibank.notificationservice.dto.NotificationStatsResponse;
import com.minibank.notificationservice.entity.Notification;
import com.minibank.notificationservice.exception.NotificationNotFoundException;
import com.minibank.notificationservice.exception.NotificationServiceException;
import com.minibank.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    
    @Transactional
    public NotificationResponse createNotification(NotificationRequest request) {
        log.info("Creating notification for user: {}, type: {}", request.getUserId(), request.getType());
        
        // Validate channel-specific requirements
        validateChannelRequirements(request);
        
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .type(request.getType())
                .title(request.getTitle())
                .message(request.getMessage())
                .channel(request.getChannel())
                .recipientEmail(request.getRecipientEmail())
                .recipientPhone(request.getRecipientPhone())
                .status(Notification.NotificationStatus.PENDING)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        log.info("Notification created: {}", savedNotification.getNotificationId());
        
        // Send notification asynchronously
        sendNotificationAsync(savedNotification);
        
        return NotificationResponse.fromEntity(savedNotification);
    }
    
    public NotificationResponse getNotificationById(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                    String.format("Notification not found with ID: %s", notificationId)));
        
        return NotificationResponse.fromEntity(notification);
    }
    
    public List<NotificationResponse> getNotificationsByUserId(UUID userId) {
        List<Notification> notifications = notificationRepository.findByUserId(userId);
        return notifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public Page<NotificationResponse> getNotificationsByUserId(UUID userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserId(userId, pageable);
        return notifications.map(NotificationResponse::fromEntity);
    }
    
    public List<NotificationResponse> getUnreadNotificationsByUserId(UUID userId) {
        List<Notification> notifications = notificationRepository.findUnreadNotificationsByUserId(userId);
        return notifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<NotificationResponse> getNotificationsByType(UUID userId, Notification.NotificationType type) {
        List<Notification> notifications = notificationRepository.findByUserIdAndType(userId, type);
        return notifications.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                    String.format("Notification not found with ID: %s", notificationId)));
        
        if (notification.getStatus() != Notification.NotificationStatus.READ) {
            notification.setStatus(Notification.NotificationStatus.READ);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
            log.info("Notification marked as read: {}", notificationId);
        }
        
        return NotificationResponse.fromEntity(notification);
    }
    
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unreadNotifications = notificationRepository.findUnreadNotificationsByUserId(userId);
        LocalDateTime now = LocalDateTime.now();
        
        unreadNotifications.forEach(notification -> {
            notification.setStatus(Notification.NotificationStatus.READ);
            notification.setReadAt(now);
        });
        
        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked {} notifications as read for user: {}", unreadNotifications.size(), userId);
    }
    
    @Transactional
    public NotificationResponse resendNotification(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException(
                    String.format("Notification not found with ID: %s", notificationId)));
        
        notification.setStatus(Notification.NotificationStatus.PENDING);
        notification.setSentAt(null);
        Notification updatedNotification = notificationRepository.save(notification);
        
        try {
            sendNotification(updatedNotification);
        } catch (Exception e) {
            log.error("Failed to resend notification: {}", e.getMessage());
            updatedNotification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.save(updatedNotification);
            throw new NotificationServiceException("Failed to resend notification: " + e.getMessage());
        }
        
        return NotificationResponse.fromEntity(updatedNotification);
    }
    
    public NotificationStatsResponse getNotificationStats(UUID userId) {
        List<Notification> allNotifications = notificationRepository.findByUserId(userId);
        
        long total = allNotifications.size();
        long unread = notificationRepository.countUnreadByUserId(userId);
        long read = allNotifications.stream()
                .filter(n -> n.getStatus() == Notification.NotificationStatus.READ)
                .count();
        long sent = allNotifications.stream()
                .filter(n -> n.getStatus() == Notification.NotificationStatus.SENT)
                .count();
        long failed = allNotifications.stream()
                .filter(n -> n.getStatus() == Notification.NotificationStatus.FAILED)
                .count();
        
        return NotificationStatsResponse.builder()
                .totalNotifications(total)
                .unreadCount(unread)
                .readCount(read)
                .sentCount(sent)
                .failedCount(failed)
                .build();
    }
    
    private void validateChannelRequirements(NotificationRequest request) {
        switch (request.getChannel()) {
            case EMAIL:
                if (request.getRecipientEmail() == null || request.getRecipientEmail().isEmpty()) {
                    throw new NotificationServiceException("Email address is required for EMAIL channel");
                }
                break;
            case SMS:
                if (request.getRecipientPhone() == null || request.getRecipientPhone().isEmpty()) {
                    throw new NotificationServiceException("Phone number is required for SMS channel");
                }
                break;
            case PUSH:
            case IN_APP:
                // No additional requirements
                break;
        }
    }
    
    @Async("notificationTaskExecutor")
    public void sendNotificationAsync(Notification notification) {
        try {
            sendNotification(notification);
        } catch (Exception e) {
            log.error("Failed to send notification asynchronously: {}", e.getMessage(), e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.save(notification);
        }
    }
    
    private void sendNotification(Notification notification) {
        log.info("Sending notification via {} channel: {}", notification.getChannel(), notification.getNotificationId());
        
        switch (notification.getChannel()) {
            case EMAIL:
                sendEmail(notification);
                break;
            case SMS:
                sendSMS(notification);
                break;
            case PUSH:
                sendPushNotification(notification);
                break;
            case IN_APP:
                // In-app notifications are automatically available
                notification.setStatus(Notification.NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
                notificationRepository.save(notification);
                break;
        }
    }
    
    private void sendEmail(Notification notification) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(notification.getRecipientEmail());
            helper.setSubject(notification.getTitle());
            helper.setText(buildEmailHtmlContent(notification), true);
            
            mailSender.send(mimeMessage);
            
            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notificationRepository.save(notification);
            
            log.info("Email sent successfully to: {}", notification.getRecipientEmail());
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage(), e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notificationRepository.save(notification);
            throw new NotificationServiceException("Failed to send email: " + e.getMessage());
        }
    }
    
    private String buildEmailHtmlContent(Notification notification) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f9f9f9; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Mini Banking System</h1>
                    </div>
                    <div class="content">
                        <h2>%s</h2>
                        <p>%s</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated message. Please do not reply.</p>
                        <p>&copy; 2025 Mini Banking System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            notification.getTitle(), 
            notification.getMessage().replace("\n", "<br>"));
    }
    
    private void sendSMS(Notification notification) {
        // In a real implementation, integrate with SMS provider (Twilio, AWS SNS, etc.)
        log.info("SMS notification would be sent to: {}", notification.getRecipientPhone());
        log.warn("SMS sending not implemented - using mock");
        
        // Mock implementation
        notification.setStatus(Notification.NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
    
    private void sendPushNotification(Notification notification) {
        // In a real implementation, integrate with push notification service (FCM, APNS, etc.)
        log.info("Push notification would be sent to user: {}", notification.getUserId());
        log.warn("Push notification sending not implemented - using mock");
        
        // Mock implementation
        notification.setStatus(Notification.NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }
}

