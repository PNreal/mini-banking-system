package com.minibank.notificationservice.controller;

import com.minibank.notificationservice.dto.WebSocketMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;

@Controller
@Slf4j
public class WebSocketController {

    @MessageMapping("/ping")
    @SendToUser("/topic/pong")
    public WebSocketMessage handlePing() {
        log.debug("Received ping message");
        return WebSocketMessage.builder()
                .event("PONG")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @MessageMapping("/request-update")
    public void handleRequestUpdate(WebSocketMessage request) {
        log.debug("Received update request: {}", request.getType());
        // Handle update request if needed
    }
}

