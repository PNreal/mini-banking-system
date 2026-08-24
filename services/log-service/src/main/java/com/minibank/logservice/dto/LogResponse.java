package com.minibank.logservice.dto;

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
public class LogResponse {
    private UUID logId;
    private UUID userId;
    private String action;
    private String detail;
    private LocalDateTime time;
}

