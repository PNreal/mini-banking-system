package com.minibank.transactionservice.controller;

import com.minibank.transactionservice.dto.AdminDashboardResponse;
import com.minibank.transactionservice.dto.AmountRequest;
import com.minibank.transactionservice.dto.ApiResponse;
import com.minibank.transactionservice.dto.CounterDepositRequest;
import com.minibank.transactionservice.dto.CounterWithdrawRequest;
import com.minibank.transactionservice.dto.PagedResponse;
import com.minibank.transactionservice.dto.RecentCustomerResponse;
import com.minibank.transactionservice.dto.StaffDashboardResponse;
import com.minibank.transactionservice.dto.TransactionResponse;
import com.minibank.transactionservice.dto.TransferRequest;
import com.minibank.transactionservice.entity.TransactionType;
import com.minibank.transactionservice.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Slf4j
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(@Valid @RequestBody AmountRequest request,
                                                                    @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Deposit request for user {}", userId);
        TransactionResponse response = transactionService.deposit(request.getAmount(), userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit-counter")
    public ResponseEntity<ApiResponse<TransactionResponse>> depositAtCounter(@Valid @RequestBody CounterDepositRequest request,
                                                                             @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Counter deposit request for user {} at counter {}", userId, request.getCounterId());
        TransactionResponse response = transactionService.depositAtCounter(request.getAmount(), userId, request.getCounterId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit-counter/{transactionId}/confirm")
    public ResponseEntity<ApiResponse<TransactionResponse>> confirmCounterDeposit(
            @PathVariable UUID transactionId,
            @RequestHeader(value = "X-User-Id", required = false) UUID staffId) {
        log.info("Confirm counter deposit for transaction {} by staff {}", transactionId, staffId);
        TransactionResponse response = transactionService.confirmCounterDeposit(transactionId, staffId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit-counter/{transactionId}/cancel")
    public ResponseEntity<ApiResponse<TransactionResponse>> cancelCounterDeposit(
            @PathVariable UUID transactionId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Cancel counter deposit for transaction {} by user {}", transactionId, userId);
        TransactionResponse response = transactionService.cancelCounterDeposit(transactionId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============ COUNTER WITHDRAW ENDPOINTS ============

    @PostMapping("/withdraw-counter")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdrawAtCounter(@Valid @RequestBody CounterWithdrawRequest request,
                                                                              @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Counter withdraw request for user {} at counter {}", userId, request.getCounterId());
        TransactionResponse response = transactionService.withdrawAtCounter(request.getAmount(), userId, request.getCounterId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/withdraw-counter/{transactionId}/confirm")
    public ResponseEntity<ApiResponse<TransactionResponse>> confirmCounterWithdraw(
            @PathVariable UUID transactionId,
            @RequestHeader(value = "X-User-Id", required = false) UUID staffId) {
        log.info("Confirm counter withdraw for transaction {} by staff {}", transactionId, staffId);
        TransactionResponse response = transactionService.confirmCounterWithdraw(transactionId, staffId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/withdraw-counter/{transactionId}/cancel")
    public ResponseEntity<ApiResponse<TransactionResponse>> cancelCounterWithdraw(
            @PathVariable UUID transactionId,
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Cancel counter withdraw for transaction {} by user {}", transactionId, userId);
        TransactionResponse response = transactionService.cancelCounterWithdraw(transactionId, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(@Valid @RequestBody AmountRequest request,
                                                                     @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Withdraw request for user {}", userId);
        TransactionResponse response = transactionService.withdraw(request.getAmount(), userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(@Valid @RequestBody TransferRequest request,
                                                                     @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Transfer request from user {} to account number {}", userId, request.getToAccountNumber());
        TransactionResponse response = transactionService.transfer(request.getAmount(), userId, request.getToAccountNumber());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> history(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        PagedResponse<TransactionResponse> response = transactionService.history(userId, type, from, to, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{transactionId}")
    public ResponseEntity<ApiResponse<TransactionResponse>> getTransaction(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @PathVariable UUID transactionId) {
        log.info("Get transaction {} for user {}", transactionId, userId);
        TransactionResponse response = transactionService.getTransaction(userId, transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Lấy danh sách giao dịch tại quầy đang chờ xử lý của user
     */
    @GetMapping("/pending-counter")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getPendingCounterTransactions(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        log.info("Get pending counter transactions for user {}", userId);
        List<TransactionResponse> response = transactionService.getPendingCounterTransactions(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/staff/recent-customers")
    public ResponseEntity<ApiResponse<List<RecentCustomerResponse>>> getRecentCustomersForStaff(
            @RequestHeader(value = "X-User-Id", required = false) UUID staffId,
            @RequestParam(defaultValue = "5") int limit) {
        List<RecentCustomerResponse> response = transactionService.getRecentCustomersForStaff(staffId, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/staff/dashboard")
    public ResponseEntity<ApiResponse<StaffDashboardResponse>> getStaffDashboard(
            @RequestHeader(value = "X-User-Id", required = false) UUID staffId,
            @RequestParam(defaultValue = "10") int pendingLimit,
            @RequestParam(defaultValue = "5") int recentCustomersLimit) {
        StaffDashboardResponse response = transactionService.getStaffDashboard(staffId, pendingLimit, recentCustomersLimit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Admin endpoint: Lấy tất cả giao dịch trong hệ thống
     */
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<PagedResponse<TransactionResponse>>> getAllTransactions(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to) {
        
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            return ResponseEntity.status(403).body(ApiResponse.error("FORBIDDEN", "Access denied. Admin role required.", "/api/v1/transactions/admin/all"));
        }
        
        PagedResponse<TransactionResponse> response = transactionService.getAllTransactions(type, status, from, to, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Admin endpoint: Lấy thống kê dashboard cho admin
     */
    @GetMapping("/admin/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(defaultValue = "7") int days) {
        
        if (role == null || !"ADMIN".equalsIgnoreCase(role.trim())) {
            return ResponseEntity.status(403).body(ApiResponse.error("FORBIDDEN", "Access denied. Admin role required.", "/api/v1/transactions/admin/dashboard"));
        }
        
        // Limit days to reasonable range
        int safeDays = Math.max(1, Math.min(days, 30));
        AdminDashboardResponse response = transactionService.getAdminDashboard(safeDays);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}


