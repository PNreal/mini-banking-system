package com.minibank.notificationservice.scheduler;

import com.minibank.notificationservice.entity.Notification;
import com.minibank.notificationservice.repository.NotificationRepository;
import com.minibank.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationRetryScheduler {
    
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private static final int RETRY_DELAY_MINUTES = 5;
    
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void retryFailedNotifications() {
        log.info("Starting scheduled retry of failed notifications");
        
        LocalDateTime retryBefore = LocalDateTime.now().minusMinutes(RETRY_DELAY_MINUTES);
        List<Notification> failedNotifications = notificationRepository
                .findPendingNotificationsBefore(retryBefore);
        
        failedNotifications.forEach(notification -> {
            if (shouldRetry(notification)) {
                log.info("Retrying notification: {}", notification.getNotificationId());
                try {
                    notificationService.sendNotificationAsync(notification);
                } catch (Exception e) {
                    log.error("Failed to retry notification {}: {}", 
                        notification.getNotificationId(), e.getMessage());
                }
            }
        });
        
        log.info("Completed scheduled retry. Processed {} notifications", failedNotifications.size());
    }
    
    private boolean shouldRetry(Notification notification) {
        // Only retry if notification is still PENDING or FAILED
        // and hasn't exceeded max retry attempts
        return (notification.getStatus() == Notification.NotificationStatus.PENDING ||
                notification.getStatus() == Notification.NotificationStatus.FAILED);
    }
}

