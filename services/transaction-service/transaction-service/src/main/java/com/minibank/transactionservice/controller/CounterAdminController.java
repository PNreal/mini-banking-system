package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.ApiResponse;
import com.minibank.transactionservice.dto.CounterResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.service.CounterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/counter/admin")
@RequiredArgsConstructor
@Slf4j
public class CounterAdminController {

    private final CounterService counterService;

    /**
     * GET /counter/admin/check
     * Kiểm tra xem user hiện tại có phải là admin quầy không
     */
    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkIsCounterAdmin(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        log.info("GET /counter/admin/check");
        
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("isCounterAdmin", false)));
        }

        try {
            UUID userId = UUID.fromString(userIdHeader.trim());
            boolean isCounterAdmin = counterService.isCounterAdmin(userId);
            log.info("User {} is counter admin: {}", userId, isCounterAdmin);
            return ResponseEntity.ok(ApiResponse.success(Map.of("isCounterAdmin", isCounterAdmin)));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid user ID format: {}", userIdHeader);
            return ResponseEntity.ok(ApiResponse.success(Map.of("isCounterAdmin", false)));
        } catch (Exception e) {
            log.error("Error checking counter admin status: {}", e.getMessage(), e);
            return ResponseEntity.ok(ApiResponse.success(Map.of("isCounterAdmin", false)));
        }
    }

    /**
     * GET /counter/admin/my-counter
     * Lấy thông tin quầy mà user hiện tại là admin
     */
    @GetMapping("/my-counter")
    public ResponseEntity<ApiResponse<CounterResponse>> getMyCounter(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        log.info("GET /counter/admin/my-counter");
        
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "User ID required", "/api/v1/counter/admin/my-counter"));
        }

        try {
            UUID userId = UUID.fromString(userIdHeader.trim());
            Counter counter = counterService.getCounterByAdminUserId(userId);
            CounterResponse response = toResponse(counter);
            log.info("Found counter {} for admin user {}", counter.getId(), userId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("INVALID_USER_ID", "Invalid user ID format", "/api/v1/counter/admin/my-counter"));
        } catch (com.minibank.transactionservice.exception.NotFoundException e) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("COUNTER_NOT_FOUND", e.getMessage(), "/api/v1/counter/admin/my-counter"));
        } catch (Exception e) {
            log.error("Error getting counter for admin user {}: {}", userIdHeader, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("INTERNAL_ERROR", "Failed to get counter: " + e.getMessage(), "/api/v1/counter/admin/my-counter"));
        }
    }

    private CounterResponse toResponse(Counter counter) {
        return CounterResponse.builder()
                .counterId(counter.getId())
                .counterCode(counter.getCounterCode())
                .name(counter.getName())
                .address(counter.getAddress())
                .maxStaff(counter.getMaxStaff())
                .adminUserId(counter.getAdminUserId())
                .isActive(counter.getIsActive())
                .createdAt(counter.getCreatedAt())
                .updatedAt(counter.getUpdatedAt())
                .build();
    }
}

