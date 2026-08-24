package com.minibank.notificationservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WebSocketMessage {
    private String event;
    private UUID notificationId;
    private UUID transactionId;
    private String type;
    private Double amount;
    private String status;
    private Double newBalance;
    private String message;
    private String title;
    private String reason;
    private LocalDateTime timestamp;
}

