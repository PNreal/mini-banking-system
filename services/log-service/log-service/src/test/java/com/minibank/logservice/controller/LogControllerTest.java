package com.minibank.logservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minibank.logservice.config.AppConfig;
import com.minibank.logservice.dto.LogResponse;
import com.minibank.logservice.exception.GlobalExceptionHandler;
import com.minibank.logservice.service.LogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(LogController.class)
@Import({GlobalExceptionHandler.class, AppConfig.class})
class LogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LogService logService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllLogs_Success() throws Exception {
        // Given
        List<LogResponse> logs = new ArrayList<>();
        Page<LogResponse> page = new PageImpl<>(logs, PageRequest.of(0, 20), 0);
        when(logService.getAllLogs(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/admin/logs")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void testGetMyLogs_Success() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        List<LogResponse> logs = new ArrayList<>();
        Page<LogResponse> page = new PageImpl<>(logs, PageRequest.of(0, 20), 0);
        when(logService.getUserLogs(any(), any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/v1/logs/me")
                        .header("X-User-Id", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGetMyLogs_WithoutHeader_ReturnsUnauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/logs/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void testGetMyLogs_InvalidUUID_ReturnsBadRequest() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/v1/logs/me")
                        .header("X-User-Id", "invalid-uuid")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("INVALID_USER_ID"));
    }
}

