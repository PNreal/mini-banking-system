package com.minibank.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationStatsResponse {
    private long totalNotifications;
    private long unreadCount;
    private long readCount;
    private long sentCount;
    private long failedCount;
}

