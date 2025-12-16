package com.minibank.logservice.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    private static final UUID UNKNOWN_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

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
            JsonNode root = parsePayload(payload);
            UUID userId = extractUserId(root, eventType);
            String action = extractAction(root, eventType);
            String detail = root != null ? root.toString() : payload;

            LogRequest logRequest = LogRequest.builder()
                    .userId(userId != null ? userId : UNKNOWN_USER_ID)
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

    private JsonNode parsePayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception e) {
            log.warn("Cannot parse payload as JSON, fallback to raw string: {}", e.getMessage());
            return null;
        }
    }

    private UUID extractUserId(JsonNode root, String eventType) {
        if (root == null) {
            return null;
        }
        switch (eventType) {
            case "USER_EVENT":
            case "ACCOUNT_EVENT":
            case "TRANSACTION_COMPLETED":
                JsonNode userIdNode = root.path("userId");
                return userIdNode.isMissingNode() || userIdNode.isNull() ? null : toUuid(userIdNode.asText());
            case "ADMIN_ACTION":
                // Ưu tiên user bị tác động, fallback admin
                JsonNode targetUserNode = root.path("targetUserId");
                if (!targetUserNode.isMissingNode() && !targetUserNode.isNull()) {
                    UUID targetUser = toUuid(targetUserNode.asText());
                    if (targetUser != null) {
                        return targetUser;
                    }
                }
                JsonNode adminIdNode = root.path("adminId");
                return adminIdNode.isMissingNode() || adminIdNode.isNull() ? null : toUuid(adminIdNode.asText());
            default:
                JsonNode defaultUserIdNode = root.path("userId");
                return defaultUserIdNode.isMissingNode() || defaultUserIdNode.isNull() ? null : toUuid(defaultUserIdNode.asText());
        }
    }

    private String extractAction(JsonNode root, String eventType) {
        if (root == null) {
            return eventType;
        }
        JsonNode actionNode = root.path("action");
        if (!actionNode.isMissingNode() && !actionNode.isNull()) {
            String action = actionNode.asText();
            if (action != null && !action.isBlank()) {
                return action.toUpperCase();
            }
        }
        // Transaction event có field type/status
        if (root.hasNonNull("type") && root.hasNonNull("status")) {
            return (root.get("type").asText("") + "_" + root.get("status").asText("")).toUpperCase();
        }
        if (root.hasNonNull("type")) {
            return root.get("type").asText("").toUpperCase();
        }
        return eventType;
    }

    private UUID toUuid(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            log.warn("Giá trị UUID không hợp lệ: {}", raw);
            return null;
        }
    }

}

