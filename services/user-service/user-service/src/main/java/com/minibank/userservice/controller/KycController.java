package com.minibank.userservice.controller;

import com.minibank.userservice.dto.ApiResponse;
import com.minibank.userservice.dto.KycRequestDto;
import com.minibank.userservice.dto.KycResponse;
import com.minibank.userservice.dto.KycReviewRequest;
import com.minibank.userservice.dto.UserResponse;
import com.minibank.userservice.model.KycStatus;
import com.minibank.userservice.service.JwtService;
import com.minibank.userservice.service.KycService;
import com.minibank.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;
    private final JwtService jwtService;
    private final UserService userService;

    /**
     * User gửi yêu cầu KYC
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<KycResponse>> submitKyc(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody KycRequestDto request) {
        try {
            UUID userId = extractUserId(authHeader);
            KycResponse response = kycService.submitKycRequest(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("KYC request submitted successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * User xem trạng thái KYC của mình
     */
    @GetMapping("/my-status")
    public ResponseEntity<ApiResponse<KycResponse>> getMyKycStatus(
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = extractUserId(authHeader);
            KycResponse response = kycService.getMyKycStatus(userId);
            return ResponseEntity.ok(new ApiResponse<>("KYC status retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * User xem lịch sử KYC
     */
    @GetMapping("/my-history")
    public ResponseEntity<ApiResponse<List<KycResponse>>> getMyKycHistory(
            @RequestHeader("Authorization") String authHeader) {
        try {
            UUID userId = extractUserId(authHeader);
            List<KycResponse> history = kycService.getMyKycHistory(userId);
            return ResponseEntity.ok(new ApiResponse<>("KYC history retrieved", history));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff lấy tất cả KYC requests (alias cho /admin/all)
     */
    @GetMapping("/admin/requests")
    public ResponseEntity<ApiResponse<Page<KycResponse>>> getKycRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) KycStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            verifyAdminOrStaff(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            Page<KycResponse> requests = kycService.getAllKycRequests(status, pageable);
            return ResponseEntity.ok(new ApiResponse<>("KYC requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff xem chi tiết KYC request (alias)
     */
    @GetMapping("/admin/requests/{kycId}")
    public ResponseEntity<ApiResponse<KycResponse>> getKycRequestDetail(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID kycId) {
        try {
            verifyAdminOrStaff(authHeader);
            KycResponse response = kycService.getKycRequest(kycId);
            return ResponseEntity.ok(new ApiResponse<>("KYC request retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff review KYC (alias)
     */
    @PutMapping("/admin/requests/{kycId}/review")
    public ResponseEntity<ApiResponse<KycResponse>> reviewKycRequestAlias(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID kycId,
            @Valid @RequestBody KycReviewRequest reviewRequest) {
        try {
            UUID staffId = extractUserId(authHeader);
            verifyAdminOrStaff(authHeader);
            KycResponse response = kycService.reviewKycRequest(kycId, staffId, reviewRequest);
            return ResponseEntity.ok(new ApiResponse<>("KYC request reviewed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff lấy danh sách KYC pending
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<ApiResponse<Page<KycResponse>>> getPendingKycRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            verifyAdminOrStaff(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            Page<KycResponse> requests = kycService.getPendingKycRequests(pageable);
            return ResponseEntity.ok(new ApiResponse<>("Pending KYC requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff lấy tất cả KYC requests
     */
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<Page<KycResponse>>> getAllKycRequests(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) KycStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            verifyAdminOrStaff(authHeader);
            Pageable pageable = PageRequest.of(page, size);
            Page<KycResponse> requests = kycService.getAllKycRequests(status, pageable);
            return ResponseEntity.ok(new ApiResponse<>("KYC requests retrieved", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff xem chi tiết KYC request
     */
    @GetMapping("/admin/{kycId}")
    public ResponseEntity<ApiResponse<KycResponse>> getKycRequest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID kycId) {
        try {
            verifyAdminOrStaff(authHeader);
            KycResponse response = kycService.getKycRequest(kycId);
            return ResponseEntity.ok(new ApiResponse<>("KYC request retrieved", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Admin/Staff review KYC (approve/reject)
     */
    @PostMapping("/admin/{kycId}/review")
    public ResponseEntity<ApiResponse<KycResponse>> reviewKycRequest(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID kycId,
            @Valid @RequestBody KycReviewRequest reviewRequest) {
        try {
            UUID staffId = extractUserId(authHeader);
            verifyAdminOrStaff(authHeader);
            KycResponse response = kycService.reviewKycRequest(kycId, staffId, reviewRequest);
            return ResponseEntity.ok(new ApiResponse<>("KYC request reviewed successfully", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Đếm số KYC pending
     */
    @GetMapping("/admin/count-pending")
    public ResponseEntity<ApiResponse<Long>> countPendingKyc(
            @RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminOrStaff(authHeader);
            long count = kycService.countPendingKyc();
            return ResponseEntity.ok(new ApiResponse<>("Pending KYC count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(e.getMessage(), null));
        }
    }

    /**
     * Đếm số KYC pending (alias)
     */
    @GetMapping("/admin/pending-count")
    public ResponseEntity<Long> countPendingKycSimple(
            @RequestHeader("Authorization") String authHeader) {
        try {
            verifyAdminOrStaff(authHeader);
            long count = kycService.countPendingKyc();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(0L);
        }
    }

    private UUID extractUserId(String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        String email = jwtService.extractEmail(token);
        UserResponse user = userService.getUserByEmail(email);
        return user.getUserId();
    }

    private void verifyAdminOrStaff(String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        String email = jwtService.extractEmail(token);
        UserResponse user = userService.getUserByEmail(email);
        String role = user.getRole();
        if (!"ADMIN".equals(role)) {
            throw new SecurityException("Access denied. Admin role required.");
        }
    }
}
