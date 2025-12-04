package com.minibank.logservice.consumer;

import com.minibank.logservice.dto.LogRequest;
import com.minibank.logservice.service.LogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class LogEventConsumer {

    private final LogService logService;

    @KafkaListener(topics = "${kafka.topics.user-event}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeUserEvent(@Payload String payload,
                                 @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                 Acknowledgment acknowledgment) {
        try {
            log.info("Received USER_EVENT from topic: {}, payload: {}", topic, payload);
            processEvent(payload, "USER_EVENT");
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing USER_EVENT: {}", e.getMessage(), e);
            // Acknowledge even on error to prevent infinite reprocessing
            // In production, consider implementing retry logic or dead letter queue
            acknowledgment.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.transaction-completed}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeTransactionEvent(@Payload String payload,
                                         @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                         Acknowledgment acknowledgment) {
        try {
            log.info("Received TRANSACTION_COMPLETED from topic: {}, payload: {}", topic, payload);
            processEvent(payload, "TRANSACTION_COMPLETED");
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing TRANSACTION_COMPLETED: {}", e.getMessage(), e);
            // Acknowledge even on error to prevent infinite reprocessing
            acknowledgment.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.admin-action}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeAdminActionEvent(@Payload String payload,
                                        @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                        Acknowledgment acknowledgment) {
        try {
            log.info("Received ADMIN_ACTION from topic: {}, payload: {}", topic, payload);
            processEvent(payload, "ADMIN_ACTION");
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing ADMIN_ACTION: {}", e.getMessage(), e);
            // Acknowledge even on error to prevent infinite reprocessing
            acknowledgment.acknowledge();
        }
    }

    @KafkaListener(topics = "${kafka.topics.account-event}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeAccountEvent(@Payload String payload,
                                    @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                                    Acknowledgment acknowledgment) {
        try {
            log.info("Received ACCOUNT_EVENT from topic: {}, payload: {}", topic, payload);
            processEvent(payload, "ACCOUNT_EVENT");
            acknowledgment.acknowledge();
        } catch (Exception e) {
            log.error("Error processing ACCOUNT_EVENT: {}", e.getMessage(), e);
            // Acknowledge even on error to prevent infinite reprocessing
            acknowledgment.acknowledge();
        }
    }

    private void processEvent(String payload, String eventType) {
        try {
            // Simple JSON parsing - extract userId and action from JSON string
            // In production, use proper JSON library or Spring's ObjectMapper
            UUID userId = extractUserIdFromJson(payload);
            String action = extractActionFromJson(payload, eventType);
            String detail = "Event Type: " + eventType + ", Payload: " + payload;

            LogRequest logRequest = LogRequest.builder()
                    .userId(userId)
                    .action(action)
                    .detail(detail)
                    .build();

            logService.createLog(logRequest);
            log.debug("Successfully processed event: {} for user: {}", eventType, userId);
        } catch (Exception e) {
            log.error("Error processing event {}: {}", eventType, e.getMessage(), e);
            throw new RuntimeException("Failed to process event: " + eventType, e);
        }
    }

    private UUID extractUserIdFromJson(String json) {
        // Simple extraction - look for "userId" or "user_id" field
        // Support both quoted and unquoted UUIDs
        String userIdPattern = "\"userId\"\\s*:\\s*\"([^\"]+)\"";
        String userIdPattern2 = "\"user_id\"\\s*:\\s*\"([^\"]+)\"";
        String userIdPattern3 = "\"userId\"\\s*:\\s*([a-fA-F0-9\\-]{36})";
        String userIdPattern4 = "\"user_id\"\\s*:\\s*([a-fA-F0-9\\-]{36})";
        
        java.util.regex.Pattern[] patterns = {
            java.util.regex.Pattern.compile(userIdPattern),
            java.util.regex.Pattern.compile(userIdPattern2),
            java.util.regex.Pattern.compile(userIdPattern3),
            java.util.regex.Pattern.compile(userIdPattern4)
        };
        
        for (java.util.regex.Pattern pattern : patterns) {
            java.util.regex.Matcher matcher = pattern.matcher(json);
            if (matcher.find()) {
                try {
                    return UUID.fromString(matcher.group(1));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid UUID format found: {}", matcher.group(1));
                }
            }
        }
        
        log.error("userId not found in payload: {}", json);
        throw new IllegalArgumentException("userId not found in payload");
    }

    private String extractActionFromJson(String json, String eventType) {
        // Simple extraction - look for "action" field
        String actionPattern = "\"action\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(actionPattern);
        java.util.regex.Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return eventType;
    }

}

