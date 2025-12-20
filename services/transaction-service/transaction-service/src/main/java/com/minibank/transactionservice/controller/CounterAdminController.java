package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.ApiResponse;
import com.minibank.transactionservice.dto.CounterAdminStaffResponse;
import com.minibank.transactionservice.dto.CounterAdminStaffUpdateRequest;
import com.minibank.transactionservice.dto.CounterAdminStaffUpsertRequest;
import com.minibank.transactionservice.dto.CounterResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.exception.BadRequestException;
import com.minibank.transactionservice.exception.UnauthorizedException;
import com.minibank.transactionservice.service.CounterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    /**
     * GET /counter/admin/{counterId}/staff
     * Admin quầy: xem danh sách nhân viên trong quầy (active/inactive)
     */
    @GetMapping("/{counterId}/staff")
    public ResponseEntity<ApiResponse<List<CounterAdminStaffResponse>>> getCounterStaff(
            @PathVariable UUID counterId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID adminUserId = parseUserIdOrUnauthorized(userIdHeader, "/api/v1/counter/admin/" + counterId + "/staff");
        List<CounterAdminStaffResponse> staff = counterService.getCounterStaffForAdmin(counterId, adminUserId);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    /**
     * POST /counter/admin/{counterId}/staff
     * Admin quầy: thêm nhân viên vào quầy (hoặc kích hoạt lại).
     * Cho phép truyền userId hoặc email.
     */
    @PostMapping("/{counterId}/staff")
    public ResponseEntity<ApiResponse<CounterAdminStaffResponse>> addStaff(
            @PathVariable UUID counterId,
            @RequestBody CounterAdminStaffUpsertRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID adminUserId = parseUserIdOrUnauthorized(userIdHeader, "/api/v1/counter/admin/" + counterId + "/staff");

        UUID staffUserId = null;
        if (request != null) {
            staffUserId = request.getUserId();
        }
        if (staffUserId == null && request != null && request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            staffUserId = counterService.resolveUserIdByEmail(request.getEmail());
        }

        if (staffUserId == null) {
            throw new BadRequestException("Cần truyền userId hoặc email của nhân viên.");
        }

        CounterAdminStaffResponse saved = counterService.addOrReactivateStaff(counterId, adminUserId, staffUserId);
        return ResponseEntity.ok(ApiResponse.success(saved));
    }

    /**
     * PUT /counter/admin/{counterId}/staff/{staffUserId}
     * Admin quầy: cập nhật trạng thái nhân viên trong quầy (kích hoạt/vô hiệu hóa).
     */
    @PutMapping("/{counterId}/staff/{staffUserId}")
    public ResponseEntity<ApiResponse<CounterAdminStaffResponse>> updateStaff(
            @PathVariable UUID counterId,
            @PathVariable UUID staffUserId,
            @RequestBody(required = false) CounterAdminStaffUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID adminUserId = parseUserIdOrUnauthorized(userIdHeader, "/api/v1/counter/admin/" + counterId + "/staff/" + staffUserId);
        CounterAdminStaffResponse updated = counterService.updateStaffInCounter(counterId, adminUserId, staffUserId, request);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    /**
     * DELETE /counter/admin/{counterId}/staff/{staffUserId}
     * Admin quầy: gỡ nhân viên khỏi quầy (soft delete).
     */
    @DeleteMapping("/{counterId}/staff/{staffUserId}")
    public ResponseEntity<ApiResponse<Void>> removeStaff(
            @PathVariable UUID counterId,
            @PathVariable UUID staffUserId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        UUID adminUserId = parseUserIdOrUnauthorized(userIdHeader, "/api/v1/counter/admin/" + counterId + "/staff/" + staffUserId);
        counterService.removeStaffFromCounter(counterId, adminUserId, staffUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    private UUID parseUserIdOrUnauthorized(String userIdHeader, String pathForError) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            throw new UnauthorizedException("User ID required for " + pathForError);
        }
        try {
            return UUID.fromString(userIdHeader.trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("INVALID_USER_ID: Invalid user ID format");
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

