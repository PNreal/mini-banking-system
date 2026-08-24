package com.minibank.logservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KafkaEvent {
    private String eventType;
    private UUID userId;
    private String action;
    private Map<String, Object> data;
    private String timestamp;
}

