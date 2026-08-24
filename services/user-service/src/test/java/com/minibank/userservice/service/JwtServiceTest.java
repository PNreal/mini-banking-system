package com.minibank.userservice.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }

    @Test
    void testGenerateAndExtractToken() {
        String email = "customer@minibank.com";
        String role = "CUSTOMER";
        UUID userId = UUID.randomUUID();

        String token = jwtService.generateAccessToken(email, userId, role);
        assertNotNull(token);

        // Test trích xuất thông tin
        String extractedEmail = jwtService.extractEmail(token);
        assertEquals(email, extractedEmail);

        String extractedRole = jwtService.extractRole(token);
        assertEquals(role, extractedRole);

        UUID extractedUserId = jwtService.extractUserId(token);
        assertEquals(userId, extractedUserId);

        // Test validate token
        assertTrue(jwtService.validateToken(token));
    }

    @Test
    void testCleanToken() {
        String tokenWithBearer = "Bearer eyJhbGciOiJIUzI1NiJ9.test";
        String cleaned = jwtService.cleanToken(tokenWithBearer);
        assertEquals("eyJhbGciOiJIUzI1NiJ9.test", cleaned);
    }
}
