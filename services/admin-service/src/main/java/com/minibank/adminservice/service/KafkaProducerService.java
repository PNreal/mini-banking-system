package com.minibank.adminservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topics.admin-action}")
    private String adminActionTopic;

    public void sendAdminActionEvent(UUID adminId, UUID targetUserId, String action) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("adminId", adminId.toString());
            event.put("targetUserId", targetUserId.toString());
            event.put("action", action);
            event.put("time", LocalDateTime.now().toString());

            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(adminActionTopic, payload);
            log.info("Sent ADMIN_ACTION event: adminId={}, targetUserId={}, action={}", adminId, targetUserId, action);
        } catch (JsonProcessingException e) {
            log.error("Error serializing admin action event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to send admin action event", e);
        }
    }
}

