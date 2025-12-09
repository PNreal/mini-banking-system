package com.minibank.transactionservice.service;

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

    @Value("${kafka.topics.transaction-completed}")
    private String transactionCompletedTopic;

    public void sendTransactionCompletedEvent(UUID transactionId, UUID fromAccount, UUID toAccount,
                                               String type, java.math.BigDecimal amount, String status) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("transactionId", transactionId.toString());
            event.put("fromAccount", fromAccount != null ? fromAccount.toString() : null);
            event.put("toAccount", toAccount != null ? toAccount.toString() : null);
            event.put("type", type);
            event.put("amount", amount.toString());
            event.put("status", status);
            event.put("timestamp", LocalDateTime.now().toString());

            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(transactionCompletedTopic, payload);
            log.info("Sent TRANSACTION_COMPLETED event: transactionId={}, type={}, status={}", 
                    transactionId, type, status);
        } catch (JsonProcessingException e) {
            log.error("Error serializing transaction completed event: {}", e.getMessage(), e);
        }
    }
}

