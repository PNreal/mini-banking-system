package com.minibank.adminservice.controller;

import com.minibank.adminservice.dto.ApiResponse;
import com.minibank.adminservice.dto.SystemReportResponse;
import com.minibank.adminservice.dto.UserResponse;
import com.minibank.adminservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /admin/users - Get all users (Admin only)
     * Note: Authentication/Authorization should be handled by API Gateway
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers(
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("GET /admin/users");
        
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Authorization token required", "/api/v1/admin/users"));
        }

        List<UserResponse> users = adminService.getAllUsers(authToken);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * PATCH /admin/lock/{userId} - Lock user account (Admin only)
     */
    @PatchMapping("/lock/{userId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> lockUser(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) String adminIdHeader,
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("PATCH /admin/lock/{} by admin {}", userId, adminIdHeader);
        
        if (adminIdHeader == null || adminIdHeader.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Admin ID required", "/api/v1/admin/lock/" + userId));
        }
        
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Authorization token required", "/api/v1/admin/lock/" + userId));
        }

        try {
            UUID adminId = UUID.fromString(adminIdHeader.trim());
            adminService.lockUser(adminId, userId, authToken);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "User locked")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("INVALID_ADMIN_ID", "Invalid admin ID format", "/api/v1/admin/lock/" + userId));
        } catch (Exception e) {
            log.error("Error locking user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("LOCK_FAILED", "Failed to lock user: " + e.getMessage(), "/api/v1/admin/lock/" + userId));
        }
    }

    /**
     * PATCH /admin/unlock/{userId} - Unlock user account (Admin only)
     */
    @PatchMapping("/unlock/{userId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> unlockUser(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) String adminIdHeader,
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("PATCH /admin/unlock/{} by admin {}", userId, adminIdHeader);
        
        if (adminIdHeader == null || adminIdHeader.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Admin ID required", "/api/v1/admin/unlock/" + userId));
        }
        
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Authorization token required", "/api/v1/admin/unlock/" + userId));
        }

        try {
            UUID adminId = UUID.fromString(adminIdHeader.trim());
            adminService.unlockUser(adminId, userId, authToken);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "User unlocked")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("INVALID_ADMIN_ID", "Invalid admin ID format", "/api/v1/admin/unlock/" + userId));
        } catch (Exception e) {
            log.error("Error unlocking user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("UNLOCK_FAILED", "Failed to unlock user: " + e.getMessage(), "/api/v1/admin/unlock/" + userId));
        }
    }

    /**
     * PATCH /admin/freeze/{userId} - Freeze user account (Admin only)
     */
    @PatchMapping("/freeze/{userId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> freezeUser(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) String adminIdHeader,
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("PATCH /admin/freeze/{} by admin {}", userId, adminIdHeader);
        
        if (adminIdHeader == null || adminIdHeader.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Admin ID required", "/api/v1/admin/freeze/" + userId));
        }
        
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Authorization token required", "/api/v1/admin/freeze/" + userId));
        }

        try {
            UUID adminId = UUID.fromString(adminIdHeader.trim());
            adminService.freezeUser(adminId, userId, authToken);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "User account frozen")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("INVALID_ADMIN_ID", "Invalid admin ID format", "/api/v1/admin/freeze/" + userId));
        } catch (Exception e) {
            log.error("Error freezing user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("FREEZE_FAILED", "Failed to freeze user: " + e.getMessage(), "/api/v1/admin/freeze/" + userId));
        }
    }

    /**
     * PATCH /admin/unfreeze/{userId} - Unfreeze user account (Admin only)
     */
    @PatchMapping("/unfreeze/{userId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> unfreezeUser(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-User-Id", required = false) String adminIdHeader,
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("PATCH /admin/unfreeze/{} by admin {}", userId, adminIdHeader);
        
        if (adminIdHeader == null || adminIdHeader.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Admin ID required", "/api/v1/admin/unfreeze/" + userId));
        }
        
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Authorization token required", "/api/v1/admin/unfreeze/" + userId));
        }

        try {
            UUID adminId = UUID.fromString(adminIdHeader.trim());
            adminService.unfreezeUser(adminId, userId, authToken);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "User account unfrozen")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("INVALID_ADMIN_ID", "Invalid admin ID format", "/api/v1/admin/unfreeze/" + userId));
        } catch (Exception e) {
            log.error("Error unfreezing user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("UNFREEZE_FAILED", "Failed to unfreeze user: " + e.getMessage(), "/api/v1/admin/unfreeze/" + userId));
        }
    }

    /**
     * GET /admin/report - Get system report (Admin only)
     */
    @GetMapping("/report")
    public ResponseEntity<ApiResponse<SystemReportResponse>> getSystemReport(
            @RequestHeader(value = "Authorization", required = false) String authToken) {
        log.info("GET /admin/report");
        
        if (authToken == null || authToken.trim().isEmpty()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("UNAUTHORIZED", "Authorization token required", "/api/v1/admin/report"));
        }

        SystemReportResponse report = adminService.getSystemReport(authToken);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}

