package com.minibank.notificationservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Value("${jwt.secret:your-secret-key-change-in-production-min-256-bits}")
    private String jwtSecret;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Extract token from query parameter or header
            String token = extractToken(accessor);
            
            if (token == null || token.isEmpty()) {
                log.warn("WebSocket connection rejected: No token provided");
                throw new SecurityException("Authentication required");
            }

            try {
                // Validate and parse JWT token
                Claims claims = Jwts.parser()
                        .verifyWith(secretKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                // Extract userId from token
                String userIdStr = claims.getSubject();
                if (userIdStr == null) {
                    userIdStr = claims.get("userId", String.class);
                }
                
                if (userIdStr == null) {
                    throw new SecurityException("Invalid token: userId not found");
                }

                UUID userId = UUID.fromString(userIdStr);
                
                // Set user information in session
                accessor.setUser(new StompPrincipal(userId.toString()));
                
                log.info("WebSocket connection authenticated for user: {}", userId);
                
            } catch (Exception e) {
                log.error("WebSocket authentication failed: {}", e.getMessage());
                throw new SecurityException("Invalid token: " + e.getMessage());
            }
        }
        
        return message;
    }

    private String extractToken(StompHeaderAccessor accessor) {
        // Try to get token from query parameter (SockJS)
        String nativeHeader = accessor.getFirstNativeHeader("token");
        if (StringUtils.hasText(nativeHeader)) {
            return nativeHeader;
        }

        // Try to get from Authorization header
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String authHeader = authHeaders.get(0);
            if (authHeader.startsWith("Bearer ")) {
                return authHeader.substring(7);
            }
        }

        // Try to get from query parameter in the URL
        String query = accessor.getFirstNativeHeader("query");
        if (query != null && query.contains("token=")) {
            int tokenIndex = query.indexOf("token=");
            int endIndex = query.indexOf("&", tokenIndex);
            if (endIndex == -1) {
                endIndex = query.length();
            }
            return query.substring(tokenIndex + 6, endIndex);
        }

        return null;
    }

    public static class StompPrincipal implements Principal {
        private final String name;

        public StompPrincipal(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }
    }
}

