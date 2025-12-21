package com.minibank.transactionservice.service;

import com.minibank.transactionservice.client.UserServiceClient;
import com.minibank.transactionservice.dto.CounterAdminStaffResponse;
import com.minibank.transactionservice.dto.CounterAdminStaffUpdateRequest;
import com.minibank.transactionservice.dto.CounterCreationResponse;
import com.minibank.transactionservice.dto.CreateEmployeeRequest;
import com.minibank.transactionservice.dto.CreateEmployeeResponse;
import com.minibank.transactionservice.dto.UserResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.entity.CounterStaff;
import com.minibank.transactionservice.entity.TransactionStatus;
import com.minibank.transactionservice.entity.TransactionType;
import com.minibank.transactionservice.exception.BadRequestException;
import com.minibank.transactionservice.exception.ForbiddenException;
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
     * Yêu cầu user hiện tại phải là admin của chính quầy này.
     */
    public Counter requireCounterAdmin(UUID counterId, UUID adminUserId) {
        Counter counter = getCounterById(counterId);
        if (counter.getAdminUserId() == null || !counter.getAdminUserId().equals(adminUserId)) {
            throw new ForbiddenException("Bạn không có quyền quản lý nhân viên của quầy này.");
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
     * Danh sách nhân viên trong quầy (bao gồm active/inactive) dành cho admin quầy.
     */
    public List<CounterAdminStaffResponse> getCounterStaffForAdmin(UUID counterId, UUID adminUserId) {
        requireCounterAdmin(counterId, adminUserId);

        List<CounterStaff> staffRows = counterStaffRepository.findByCounterId(counterId);
        return staffRows.stream().map(cs -> {
            UserResponse u = null;
            try {
                u = userServiceClient.getUser(cs.getUserId());
            } catch (Exception ignored) {
                // Nếu user-service lỗi/không tìm thấy, vẫn trả tối thiểu userId + trạng thái mapping
            }
            return CounterAdminStaffResponse.builder()
                    .userId(cs.getUserId())
                    .email(u != null ? u.getEmail() : null)
                    .fullName(u != null ? u.getFullName() : null)
                    .employeeCode(u != null ? u.getEmployeeCode() : null)
                    .isActive(Boolean.TRUE.equals(cs.getIsActive()))
                    .build();
        }).toList();
    }

    /**
     * Thêm nhân viên vào quầy (hoặc kích hoạt lại nếu đã tồn tại nhưng bị inactive).
     */
    @Transactional
    public CounterAdminStaffResponse addOrReactivateStaff(UUID counterId, UUID adminUserId, UUID staffUserId) {
        Counter counter = requireCounterAdmin(counterId, adminUserId);

        // Validate user tồn tại
        UserResponse user = userServiceClient.getUser(staffUserId);

        long activeCount = counterStaffRepository.findByCounterIdAndIsActiveTrue(counterId).size();
        if (activeCount >= counter.getMaxStaff()) {
            throw new BadRequestException("Quầy đã đạt số nhân viên tối đa: " + counter.getMaxStaff());
        }

        CounterStaff existing = counterStaffRepository.findByCounterIdAndUserId(counterId, staffUserId);
        if (existing != null) {
            existing.setIsActive(true);
            CounterStaff saved = counterStaffRepository.save(existing);
            return CounterAdminStaffResponse.builder()
                    .userId(saved.getUserId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .employeeCode(user.getEmployeeCode())
                    .isActive(true)
                    .build();
        }

        CounterStaff cs = new CounterStaff();
        cs.setCounterId(counterId);
        cs.setUserId(staffUserId);
        cs.setIsActive(true);
        CounterStaff saved = counterStaffRepository.save(cs);

        return CounterAdminStaffResponse.builder()
                .userId(saved.getUserId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .employeeCode(user.getEmployeeCode())
                .isActive(true)
                .build();
    }

    /**
     * Resolve userId từ email (dùng internal endpoint user-service).
     */
    public UUID resolveUserIdByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email không hợp lệ.");
        }
        UserResponse user = userServiceClient.getUserByEmail(email.trim().toLowerCase());
        if (user == null || user.getUserId() == null) {
            throw new NotFoundException("User not found with email: " + email);
        }
        return user.getUserId();
    }

    /**
     * Cập nhật trạng thái active của nhân viên trong quầy.
     */
    @Transactional
    public CounterAdminStaffResponse updateStaffInCounter(UUID counterId, UUID adminUserId, UUID staffUserId, CounterAdminStaffUpdateRequest request) {
        requireCounterAdmin(counterId, adminUserId);

        CounterStaff cs = counterStaffRepository.findByCounterIdAndUserId(counterId, staffUserId);
        if (cs == null) {
            throw new NotFoundException("Nhân viên không thuộc quầy này.");
        }

        if (request != null && request.getIsActive() != null) {
            cs.setIsActive(request.getIsActive());
        }

        CounterStaff saved = counterStaffRepository.save(cs);
        UserResponse user = null;
        try {
            user = userServiceClient.getUser(staffUserId);
        } catch (Exception ignored) {}

        return CounterAdminStaffResponse.builder()
                .userId(saved.getUserId())
                .email(user != null ? user.getEmail() : null)
                .fullName(user != null ? user.getFullName() : null)
                .employeeCode(user != null ? user.getEmployeeCode() : null)
                .isActive(Boolean.TRUE.equals(saved.getIsActive()))
                .build();
    }

    /**
     * Gỡ nhân viên khỏi quầy (soft delete bằng isActive=false).
     */
    @Transactional
    public void removeStaffFromCounter(UUID counterId, UUID adminUserId, UUID staffUserId) {
        requireCounterAdmin(counterId, adminUserId);
        CounterStaff cs = counterStaffRepository.findByCounterIdAndUserId(counterId, staffUserId);
        if (cs == null) {
            throw new NotFoundException("Nhân viên không thuộc quầy này.");
        }
        cs.setIsActive(false);
        counterStaffRepository.save(cs);
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

    /**
     * Admin tổng: chỉ định adminUserId cho quầy.
     * - Validate user tồn tại (qua user-service)
     * - (Tuỳ tiện demo) đảm bảo user đó cũng có trong counter_staff để quản lý quầy thuận tiện.
     */
    @Transactional
    public Counter assignCounterAdmin(UUID counterId, UUID adminUserIdToAssign) {
        Counter counter = getCounterById(counterId);

        // Validate user tồn tại
        userServiceClient.getUser(adminUserIdToAssign);

        // Ensure the assigned admin is also a staff member of this counter (active)
        CounterStaff existing = counterStaffRepository.findByCounterIdAndUserId(counterId, adminUserIdToAssign);
        if (existing == null) {
            long activeCount = counterStaffRepository.findByCounterIdAndIsActiveTrue(counterId).size();
            if (activeCount >= counter.getMaxStaff()) {
                throw new BadRequestException("Không thể gán admin quầy vì quầy đã đạt số nhân viên tối đa: " + counter.getMaxStaff());
            }
            CounterStaff cs = new CounterStaff();
            cs.setCounterId(counterId);
            cs.setUserId(adminUserIdToAssign);
            cs.setIsActive(true);
            counterStaffRepository.save(cs);
        } else if (!Boolean.TRUE.equals(existing.getIsActive())) {
            existing.setIsActive(true);
            counterStaffRepository.save(existing);
        }

        counter.setAdminUserId(adminUserIdToAssign);
        return counterRepository.save(counter);
    }

    @Transactional
    public Counter clearCounterAdmin(UUID counterId) {
        Counter counter = getCounterById(counterId);
        counter.setAdminUserId(null);
        return counterRepository.save(counter);
    }

    /**
     * Tạo quầy giao dịch mới (chỉ ADMIN)
     * Nếu có thông tin adminEmail, sẽ tự động tạo tài khoản COUNTER_ADMIN
     */
    @Transactional
    public CounterCreationResponse createCounterWithAdmin(String counterCode, String name, String address, Integer maxStaff, 
                                                          UUID adminUserId, String adminEmail, String adminFullName, String adminPhoneNumber) {
        // Validate counter code unique
        if (counterRepository.existsByCounterCode(counterCode)) {
            throw new BadRequestException("Counter code already exists: " + counterCode);
        }

        CreateEmployeeResponse adminAccount = null;
        UUID finalAdminUserId = adminUserId;

        // Nếu có thông tin email admin, tạo tài khoản mới
        if (adminEmail != null && !adminEmail.trim().isEmpty()) {
            if (adminFullName == null || adminFullName.trim().isEmpty()) {
                throw new BadRequestException("Admin full name is required when creating admin account");
            }
            if (adminPhoneNumber == null || adminPhoneNumber.trim().isEmpty()) {
                throw new BadRequestException("Admin phone number is required when creating admin account");
            }

            CreateEmployeeRequest employeeRequest = CreateEmployeeRequest.builder()
                    .email(adminEmail.trim())
                    .fullName(adminFullName.trim())
                    .phoneNumber(adminPhoneNumber.trim())
                    .role("COUNTER_ADMIN")
                    .build();

            adminAccount = userServiceClient.createEmployee(employeeRequest);
            finalAdminUserId = adminAccount.getUserId();
            
            log.info("Created admin account for counter {}: userId={}, email={}, employeeCode={}", 
                    counterCode, adminAccount.getUserId(), adminAccount.getEmail(), adminAccount.getEmployeeCode());
        } else if (finalAdminUserId != null) {
            // Validate admin user exists
            userServiceClient.getUser(finalAdminUserId);
        }

        Counter counter = new Counter();
        counter.setCounterCode(counterCode);
        counter.setName(name);
        counter.setAddress(address);
        counter.setMaxStaff(maxStaff);
        counter.setAdminUserId(finalAdminUserId);
        counter.setIsActive(true);

        Counter saved = counterRepository.save(counter);

        // Nếu có adminUserId, thêm vào counter_staff
        if (finalAdminUserId != null) {
            CounterStaff cs = new CounterStaff();
            cs.setCounterId(saved.getId());
            cs.setUserId(finalAdminUserId);
            cs.setIsActive(true);
            counterStaffRepository.save(cs);
        }

        return CounterCreationResponse.builder()
                .counter(saved)
                .adminAccount(adminAccount)
                .build();
    }

    /**
     * Tạo quầy giao dịch mới (chỉ ADMIN) - backward compatibility
     */
    @Transactional
    public Counter createCounter(String counterCode, String name, String address, Integer maxStaff, UUID adminUserId) {
        CounterCreationResponse response = createCounterWithAdmin(counterCode, name, address, maxStaff, adminUserId, null, null, null);
        return response.getCounter();
    }

    /**
     * Cập nhật thông tin quầy giao dịch (chỉ ADMIN)
     */
    @Transactional
    public Counter updateCounter(UUID counterId, String counterCode, String name, String address, Integer maxStaff) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new NotFoundException("Counter not found"));

        // Validate counter code unique (nếu thay đổi)
        if (counterCode != null && !counterCode.equals(counter.getCounterCode())) {
            if (counterRepository.existsByCounterCode(counterCode)) {
                throw new BadRequestException("Counter code already exists: " + counterCode);
            }
            counter.setCounterCode(counterCode);
        }

        if (name != null) {
            counter.setName(name);
        }
        if (address != null) {
            counter.setAddress(address);
        }
        if (maxStaff != null) {
            counter.setMaxStaff(maxStaff);
        }

        return counterRepository.save(counter);
    }

    /**
     * Xóa quầy giao dịch (soft delete - set isActive = false) (chỉ ADMIN)
     */
    @Transactional
    public void deleteCounter(UUID counterId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new NotFoundException("Counter not found"));
        
        counter.setIsActive(false);
        counterRepository.save(counter);
    }

    /**
     * Kích hoạt lại quầy giao dịch (set isActive = true) (chỉ ADMIN)
     */
    @Transactional
    public Counter reactivateCounter(UUID counterId) {
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new NotFoundException("Counter not found"));
        
        counter.setIsActive(true);
        return counterRepository.save(counter);
    }

    /**
     * Lấy tất cả counters (bao gồm cả inactive) - dành cho ADMIN
     */
    public List<Counter> getAllCounters() {
        return counterRepository.findAll();
    }
}

