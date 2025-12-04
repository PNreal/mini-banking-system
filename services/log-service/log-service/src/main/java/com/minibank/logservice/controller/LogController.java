package com.minibank.logservice.controller;

import com.minibank.logservice.dto.ApiResponse;
import com.minibank.logservice.dto.LogFilterRequest;
import com.minibank.logservice.dto.LogResponse;
import com.minibank.logservice.service.LogService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
@Validated
public class LogController {

    private final LogService logService;

    /**
     * GET /admin/logs - Get all logs (Admin only)
     * Note: Authentication/Authorization should be handled by API Gateway
     */
    @GetMapping("/admin/logs")
    public ResponseEntity<ApiResponse<Page<LogResponse>>> getAllLogs(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "time") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        log.info("GET /admin/logs - page={}, size={}, sortBy={}, sortDir={}", page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<LogResponse> logs = logService.getAllLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * GET /logs/me - Get current user's logs
     * Note: User ID should be extracted from JWT token by API Gateway
     */
    @GetMapping("/logs/me")
    public ResponseEntity<ApiResponse<Page<LogResponse>>> getMyLogs(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "time") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        // TODO: Extract userId from JWT token when authentication is implemented
        // For now, using header as temporary solution
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            log.warn("X-User-Id header not found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("UNAUTHORIZED", "User ID is required", "/api/v1/logs/me"));
        }

        UUID userId;
        try {
            userId = UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format in X-User-Id header: {}", userIdHeader);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("INVALID_USER_ID", "Invalid user ID format", "/api/v1/logs/me"));
        }

        log.info("GET /logs/me - userId={}, page={}, size={}", userId, page, size);

        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<LogResponse> logs = logService.getUserLogs(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * GET /admin/logs/search - Search logs with filters (Admin only)
     */
    @GetMapping("/admin/logs/search")
    public ResponseEntity<ApiResponse<Page<LogResponse>>> searchLogs(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(defaultValue = "time") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir
    ) {
        log.info("GET /admin/logs/search - userId={}, action={}, startTime={}, endTime={}, page={}, size={}", 
                userId, action, startTime, endTime, page, size);

        UUID userIdUuid = null;
        if (userId != null && !userId.trim().isEmpty()) {
            try {
                userIdUuid = UUID.fromString(userId.trim());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("INVALID_USER_ID", "Invalid user ID format", "/api/v1/admin/logs/search"));
            }
        }

        LogFilterRequest filter = LogFilterRequest.builder()
                .userId(userIdUuid)
                .action(action)
                .startTime(startTime)
                .endTime(endTime)
                .build();

        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<LogResponse> logs = logService.searchLogs(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    /**
     * GET /admin/logs/statistics - Get log statistics (Admin only)
     */
    @GetMapping("/admin/logs/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime
    ) {
        log.info("GET /admin/logs/statistics - userId={}, startTime={}, endTime={}", userId, startTime, endTime);

        UUID userIdUuid = null;
        if (userId != null && !userId.trim().isEmpty()) {
            try {
                userIdUuid = UUID.fromString(userId.trim());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("INVALID_USER_ID", "Invalid user ID format", "/api/v1/admin/logs/statistics"));
            }
        }

        Map<String, Object> statistics = logService.getStatistics(userIdUuid, startTime, endTime);
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }
}
