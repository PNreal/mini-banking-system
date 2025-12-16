package com.minibank.adminservice.service;

import com.minibank.adminservice.dto.SystemReportResponse;
import com.minibank.adminservice.dto.UserResponse;
import com.minibank.adminservice.entity.AdminLog;
import com.minibank.adminservice.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserServiceClient userServiceClient;
    private final AccountServiceClient accountServiceClient;
    private final KafkaProducerService kafkaProducerService;
    private final AdminLogRepository adminLogRepository;

    public List<UserResponse> getAllUsers(String authToken) {
        log.debug("Fetching all users");
        return userServiceClient.getAllUsers(authToken);
    }

    @Transactional
    public void lockUser(UUID adminId, UUID userId, String authToken) {
        log.info("Admin {} locking user {}", adminId, userId);
        
        // Khóa user trên user-service (theo SIS 3.4)
        userServiceClient.lockUser(userId, authToken);

        // Lấy accountId đúng từ account-service rồi khóa account (theo SIS 3.3)
        UUID accountId = accountServiceClient.getAccountIdByUser(userId, authToken);
        accountServiceClient.lockAccount(accountId, authToken);
        
        // Save admin log
        AdminLog adminLog = AdminLog.builder()
                .adminId(adminId)
                .action("LOCK")
                .targetUser(userId)
                .time(LocalDateTime.now())
                .build();
        adminLogRepository.save(adminLog);
        
        // Send Kafka event
        kafkaProducerService.sendAdminActionEvent(adminId, userId, "LOCK");
        
        log.info("User {} locked successfully by admin {}", userId, adminId);
    }

    @Transactional
    public void unlockUser(UUID adminId, UUID userId, String authToken) {
        log.info("Admin {} unlocking user {}", adminId, userId);
        
        userServiceClient.unlockUser(userId, authToken);

        UUID accountId = accountServiceClient.getAccountIdByUser(userId, authToken);
        accountServiceClient.unlockAccount(accountId, authToken);
        
        AdminLog adminLog = AdminLog.builder()
                .adminId(adminId)
                .action("UNLOCK")
                .targetUser(userId)
                .time(LocalDateTime.now())
                .build();
        adminLogRepository.save(adminLog);
        
        kafkaProducerService.sendAdminActionEvent(adminId, userId, "UNLOCK");
        
        log.info("User {} unlocked successfully by admin {}", userId, adminId);
    }

    @Transactional
    public void freezeUser(UUID adminId, UUID userId, String authToken) {
        log.info("Admin {} freezing user {}", adminId, userId);
        
        UUID accountId = accountServiceClient.getAccountIdByUser(userId, authToken);
        accountServiceClient.freezeAccount(accountId, authToken);
        
        AdminLog adminLog = AdminLog.builder()
                .adminId(adminId)
                .action("FREEZE")
                .targetUser(userId)
                .time(LocalDateTime.now())
                .build();
        adminLogRepository.save(adminLog);
        
        kafkaProducerService.sendAdminActionEvent(adminId, userId, "FREEZE");
        
        log.info("User {} frozen successfully by admin {}", userId, adminId);
    }

    @Transactional
    public void unfreezeUser(UUID adminId, UUID userId, String authToken) {
        log.info("Admin {} unfreezing user {}", adminId, userId);
        
        UUID accountId = accountServiceClient.getAccountIdByUser(userId, authToken);
        accountServiceClient.unfreezeAccount(accountId, authToken);
        
        AdminLog adminLog = AdminLog.builder()
                .adminId(adminId)
                .action("UNFREEZE")
                .targetUser(userId)
                .time(LocalDateTime.now())
                .build();
        adminLogRepository.save(adminLog);
        
        kafkaProducerService.sendAdminActionEvent(adminId, userId, "UNFREEZE");
        
        log.info("User {} unfrozen successfully by admin {}", userId, adminId);
    }

    public SystemReportResponse getSystemReport(String authToken) {
        log.debug("Generating system report");
        
        List<UserResponse> users = userServiceClient.getAllUsers(authToken);
        
        // Calculate statistics
        long totalUsers = users.size();
        long totalTransactionsToday = 0L; // Would need to call transaction service
        double totalAmount = 0.0; // Would need to call transaction service
        long failedTransactions = 0L; // Would need to call transaction service
        
        // Count by status
        Map<String, Long> userStatusCounts = new HashMap<>();
        users.forEach(user -> {
            String status = user.getStatus();
            userStatusCounts.put(status, userStatusCounts.getOrDefault(status, 0L) + 1);
        });
        
        // Transaction counts by type (placeholder - would need transaction service)
        Map<String, Long> transactionCountsByType = new HashMap<>();
        transactionCountsByType.put("DEPOSIT", 0L);
        transactionCountsByType.put("WITHDRAW", 0L);
        transactionCountsByType.put("TRANSFER", 0L);
        
        return SystemReportResponse.builder()
                .totalUsers(totalUsers)
                .totalTransactionsToday(totalTransactionsToday)
                .totalAmount(totalAmount)
                .failedTransactions(failedTransactions)
                .transactionCountsByType(transactionCountsByType)
                .userStatusCounts(userStatusCounts)
                .build();
    }
}

