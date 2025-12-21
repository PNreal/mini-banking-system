package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.ApiResponse;
import com.minibank.transactionservice.dto.AssignCounterAdminRequest;
import com.minibank.transactionservice.dto.CounterCreationResponse;
import com.minibank.transactionservice.dto.CounterRequest;
import com.minibank.transactionservice.dto.CounterResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.entity.CounterStaff;
import com.minibank.transactionservice.exception.ForbiddenException;
import com.minibank.transactionservice.service.CounterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/counters")
@RequiredArgsConstructor
@Slf4j
public class CounterController {

    private final CounterService counterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CounterResponse>>> getAllCounters(
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        List<Counter> counters;
        // Nếu là ADMIN, trả về tất cả (bao gồm inactive)
        if ("ADMIN".equalsIgnoreCase(role)) {
            counters = counterService.getAllCounters();
        } else {
            // Người dùng thường chỉ thấy active counters
            counters = counterService.getAllActiveCounters();
        }
        
        List<CounterResponse> responses = counters.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{counterId}")
    public ResponseEntity<ApiResponse<CounterResponse>> getCounter(@PathVariable UUID counterId) {
        Counter counter = counterService.getCounterById(counterId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(counter)));
    }

    @GetMapping("/{counterId}/staff")
    public ResponseEntity<ApiResponse<List<UUID>>> getCounterStaff(@PathVariable UUID counterId) {
        List<CounterStaff> staff = counterService.getCounterStaff(counterId);
        List<UUID> staffIds = staff.stream()
                .map(CounterStaff::getUserId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(staffIds));
    }

    /**
     * POST /counters - Tạo quầy giao dịch mới (chỉ ADMIN)
     * Tự động tạo tài khoản admin quầy nếu có thông tin adminEmail
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CounterCreationResponse>> createCounter(
            @Valid @RequestBody CounterRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền tạo quầy giao dịch.");
        }

        CounterCreationResponse response = counterService.createCounterWithAdmin(
                request.getCounterCode(),
                request.getName(),
                request.getAddress(),
                request.getMaxStaff(),
                request.getAdminUserId(),
                request.getAdminEmail(),
                request.getAdminFullName(),
                request.getAdminPhoneNumber()
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * PUT /counters/{counterId} - Cập nhật quầy giao dịch (chỉ ADMIN)
     */
    @PutMapping("/{counterId}")
    public ResponseEntity<ApiResponse<CounterResponse>> updateCounter(
            @PathVariable UUID counterId,
            @Valid @RequestBody CounterRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền cập nhật quầy giao dịch.");
        }

        Counter counter = counterService.updateCounter(
                counterId,
                request.getCounterCode(),
                request.getName(),
                request.getAddress(),
                request.getMaxStaff()
        );

        return ResponseEntity.ok(ApiResponse.success(toResponse(counter)));
    }

    /**
     * DELETE /counters/{counterId} - Xóa quầy giao dịch (chỉ ADMIN)
     */
    @DeleteMapping("/{counterId}")
    public ResponseEntity<ApiResponse<Void>> deleteCounter(
            @PathVariable UUID counterId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền xóa quầy giao dịch.");
        }

        counterService.deleteCounter(counterId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * PUT /counters/{counterId}/reactivate - Kích hoạt lại quầy giao dịch (chỉ ADMIN)
     */
    @PutMapping("/{counterId}/reactivate")
    public ResponseEntity<ApiResponse<CounterResponse>> reactivateCounter(
            @PathVariable UUID counterId,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền kích hoạt lại quầy giao dịch.");
        }

        Counter counter = counterService.reactivateCounter(counterId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(counter)));
    }

    /**
     * Admin tổng: chỉ định admin quầy cho counter.
     * PATCH /counters/{counterId}/admin-user
     */
    @PatchMapping("/{counterId}/admin-user")
    public ResponseEntity<ApiResponse<CounterResponse>> assignAdminUser(
            @PathVariable UUID counterId,
            @RequestBody(required = false) AssignCounterAdminRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            throw new ForbiddenException("Chỉ ADMIN mới có quyền chỉ định admin quầy.");
        }
        if (request == null) {
            return ResponseEntity.ok(ApiResponse.success(toResponse(counterService.clearCounterAdmin(counterId))));
        }
        UUID adminUserId = request.getAdminUserId();
        if (adminUserId == null && request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            adminUserId = counterService.resolveUserIdByEmail(request.getEmail());
        }
        if (adminUserId == null) {
            // Cho phép clear
            return ResponseEntity.ok(ApiResponse.success(toResponse(counterService.clearCounterAdmin(counterId))));
        }
        Counter saved = counterService.assignCounterAdmin(counterId, adminUserId);
        return ResponseEntity.ok(ApiResponse.success(toResponse(saved)));
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

