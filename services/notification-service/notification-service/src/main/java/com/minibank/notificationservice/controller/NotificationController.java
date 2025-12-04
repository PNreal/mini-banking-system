package com.minibank.notificationservice.controller;

import com.minibank.notificationservice.dto.ApiResponse;
import com.minibank.notificationservice.dto.NotificationRequest;
import com.minibank.notificationservice.dto.NotificationResponse;
import com.minibank.notificationservice.dto.NotificationStatsResponse;
import com.minibank.notificationservice.entity.Notification;
import com.minibank.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> createNotification(
            @Valid @RequestBody NotificationRequest request,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Creating notification request received");
        
        // Use userId from header if provided, otherwise use from request
        if (userId != null) {
            request.setUserId(userId);
        }
        
        NotificationResponse notification = notificationService.createNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(notification));
    }
    
    @GetMapping("/{notificationId}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getNotificationById(
            @PathVariable UUID notificationId) {
        log.info("Getting notification by ID: {}", notificationId);
        
        NotificationResponse notification = notificationService.getNotificationById(notificationId);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByUserId(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Getting notifications for user: {}", userId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<NotificationResponse> notifications = notificationService.getNotificationsByUserId(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications.getContent()));
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications(
            @PathVariable UUID userId) {
        log.info("Getting unread notifications for user: {}", userId);
        
        List<NotificationResponse> notifications = notificationService.getUnreadNotificationsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
    
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotificationsByType(
            @PathVariable UUID userId,
            @PathVariable Notification.NotificationType type) {
        log.info("Getting notifications by type: {} for user: {}", type, userId);
        
        List<NotificationResponse> notifications = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
    
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable UUID notificationId) {
        log.info("Marking notification as read: {}", notificationId);
        
        NotificationResponse notification = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }
    
    @PatchMapping("/user/{userId}/read-all")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @PathVariable UUID userId) {
        log.info("Marking all notifications as read for user: {}", userId);
        
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }
    
    @PostMapping("/{notificationId}/resend")
    public ResponseEntity<ApiResponse<NotificationResponse>> resendNotification(
            @PathVariable UUID notificationId) {
        log.info("Resending notification: {}", notificationId);
        
        NotificationResponse notification = notificationService.resendNotification(notificationId);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }
    
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<ApiResponse<NotificationStatsResponse>> getNotificationStats(
            @PathVariable UUID userId) {
        log.info("Getting notification stats for user: {}", userId);
        
        NotificationStatsResponse stats = notificationService.getNotificationStats(userId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}

