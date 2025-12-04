package com.minibank.logservice.repository;

import com.minibank.logservice.entity.Log;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class LogRepositoryTest {

    @Autowired
    private LogRepository logRepository;

    @Test
    void testSaveLog() {
        // Given
        UUID userId = UUID.randomUUID();
        Log log = Log.builder()
                .userId(userId)
                .action("LOGIN")
                .detail("Test login")
                .time(LocalDateTime.now())
                .build();

        // When
        Log saved = logRepository.save(log);

        // Then
        assertNotNull(saved.getLogId());
        assertEquals(userId, saved.getUserId());
        assertEquals("LOGIN", saved.getAction());
    }

    @Test
    void testFindByUserId() {
        // Given
        UUID userId = UUID.randomUUID();
        Log log1 = Log.builder()
                .userId(userId)
                .action("LOGIN")
                .detail("Login 1")
                .time(LocalDateTime.now())
                .build();
        Log log2 = Log.builder()
                .userId(userId)
                .action("LOGOUT")
                .detail("Logout")
                .time(LocalDateTime.now().minusHours(1))
                .build();
        logRepository.save(log1);
        logRepository.save(log2);

        // When
        Page<Log> result = logRepository.findByUserIdOrderByTimeDesc(userId, PageRequest.of(0, 10));

        // Then
        assertEquals(2, result.getTotalElements());
        assertEquals("LOGIN", result.getContent().get(0).getAction()); // Most recent first
    }
}

