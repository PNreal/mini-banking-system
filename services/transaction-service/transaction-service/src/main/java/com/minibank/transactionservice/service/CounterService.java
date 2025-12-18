package com.minibank.transactionservice.service;

import com.minibank.transactionservice.client.UserServiceClient;
import com.minibank.transactionservice.dto.UserResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.entity.CounterStaff;
import com.minibank.transactionservice.entity.TransactionStatus;
import com.minibank.transactionservice.entity.TransactionType;
import com.minibank.transactionservice.exception.BadRequestException;
import com.minibank.transactionservice.exception.NotFoundException;
import com.minibank.transactionservice.repository.CounterRepository;
import com.minibank.transactionservice.repository.CounterStaffRepository;
import com.minibank.transactionservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CounterService {

    private final CounterRepository counterRepository;
    private final CounterStaffRepository counterStaffRepository;
    private final TransactionRepository transactionRepository;
    private final UserServiceClient userServiceClient;

    public List<Counter> getAllActiveCounters() {
        return counterRepository.findByIsActiveTrue();
    }

    public Counter getCounterById(UUID counterId) {
        Counter counter = counterRepository.findByIdAndIsActiveTrue(counterId);
        if (counter == null) {
            throw new NotFoundException("Counter not found or inactive");
        }
        return counter;
    }

    /**
     * Phân bổ nhân viên từ quầy dựa trên số lượng đơn PENDING ít nhất
     * Nếu bằng nhau thì random chọn
     */
    @Transactional
    public UUID assignStaffFromCounter(UUID counterId) {
        getCounterById(counterId); // Validate counter exists
        
        // Lấy danh sách nhân viên trong quầy
        List<CounterStaff> staffList = counterStaffRepository.findByCounterIdAndIsActiveTrue(counterId);
        if (staffList.isEmpty()) {
            throw new BadRequestException("Counter has no active staff");
        }

        // Đếm số transaction PENDING của mỗi nhân viên
        Map<UUID, Long> staffPendingCounts = new HashMap<>();
        for (CounterStaff staff : staffList) {
            // Đếm số transaction COUNTER_DEPOSIT PENDING của nhân viên này
            long pendingCount = transactionRepository.findAll().stream()
                    .filter(tx -> tx.getType() == TransactionType.COUNTER_DEPOSIT 
                            && tx.getStatus() == TransactionStatus.PENDING
                            && staff.getUserId().equals(tx.getStaffId()))
                    .count();
            staffPendingCounts.put(staff.getUserId(), pendingCount);
        }

        // Tìm nhân viên có số đơn PENDING ít nhất
        Long minPendingCount = staffPendingCounts.values().stream()
                .min(Long::compareTo)
                .orElse(0L);

        // Lọc các nhân viên có số đơn PENDING = minPendingCount
        List<UUID> availableStaff = staffPendingCounts.entrySet().stream()
                .filter(entry -> entry.getValue().equals(minPendingCount))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        // Nếu có nhiều nhân viên có cùng số đơn PENDING, random chọn
        if (availableStaff.size() > 1) {
            Collections.shuffle(availableStaff);
        }

        UUID selectedStaffId = availableStaff.get(0);
        log.info("Assigned staff {} from counter {} (pending count: {})", 
                selectedStaffId, counterId, minPendingCount);
        
        return selectedStaffId;
    }

    /**
     * Lấy employeeCode từ userId
     */
    public String getEmployeeCodeFromUserId(UUID userId) {
        try {
            UserResponse user = userServiceClient.getUser(userId);
            return user != null && user.getEmployeeCode() != null ? user.getEmployeeCode() : userId.toString().substring(0, 8).toUpperCase();
        } catch (Exception e) {
            log.warn("Failed to get employee code for user {}, using default", userId, e);
            return userId.toString().substring(0, 8).toUpperCase();
        }
    }

    public List<CounterStaff> getCounterStaff(UUID counterId) {
        return counterStaffRepository.findByCounterIdAndIsActiveTrue(counterId);
    }

    /**
     * Kiểm tra xem user có phải là admin quầy không
     */
    public boolean isCounterAdmin(UUID userId) {
        return counterRepository.existsByAdminUserIdAndIsActiveTrue(userId);
    }

    /**
     * Lấy thông tin quầy mà user là admin
     */
    public Counter getCounterByAdminUserId(UUID adminUserId) {
        Counter counter = counterRepository.findByAdminUserIdAndIsActiveTrue(adminUserId);
        if (counter == null) {
            throw new NotFoundException("Counter not found for admin user: " + adminUserId);
        }
        return counter;
    }
}

