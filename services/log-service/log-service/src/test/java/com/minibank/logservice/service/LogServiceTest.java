package com.minibank.logservice.service;

import com.minibank.logservice.dto.LogRequest;
import com.minibank.logservice.dto.LogResponse;
import com.minibank.logservice.entity.Log;
import com.minibank.logservice.repository.LogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LogServiceTest {

    @Mock
    private LogRepository logRepository;

    @InjectMocks
    private LogService logService;

    private UUID testUserId;
    private Log testLog;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testLog = Log.builder()
                .logId(UUID.randomUUID())
                .userId(testUserId)
                .action("LOGIN")
                .detail("User logged in")
                .time(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateLog_Success() {
        // Given
        LogRequest request = LogRequest.builder()
                .userId(testUserId)
                .action("LOGIN")
                .detail("User logged in")
                .build();

        when(logRepository.save(any(Log.class))).thenReturn(testLog);

        // When
        LogResponse response = logService.createLog(request);

        // Then
        assertNotNull(response);
        assertEquals(testLog.getLogId(), response.getLogId());
        assertEquals(testLog.getUserId(), response.getUserId());
        assertEquals(testLog.getAction(), response.getAction());
        verify(logRepository, times(1)).save(any(Log.class));
    }

    @Test
    void testGetAllLogs_Success() {
        // Given
        List<Log> logs = new ArrayList<>();
        logs.add(testLog);
        Page<Log> page = new PageImpl<>(logs, PageRequest.of(0, 20), 1);
        when(logRepository.findAll(any(Pageable.class))).thenReturn(page);

        // When
        Page<LogResponse> result = logService.getAllLogs(PageRequest.of(0, 20));

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(logRepository, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void testGetUserLogs_Success() {
        // Given
        List<Log> logs = new ArrayList<>();
        logs.add(testLog);
        Page<Log> page = new PageImpl<>(logs, PageRequest.of(0, 20), 1);
        when(logRepository.findByUserIdOrderByTimeDesc(eq(testUserId), any(Pageable.class))).thenReturn(page);

        // When
        Page<LogResponse> result = logService.getUserLogs(testUserId, PageRequest.of(0, 20));

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(logRepository, times(1)).findByUserIdOrderByTimeDesc(eq(testUserId), any(Pageable.class));
    }
}

