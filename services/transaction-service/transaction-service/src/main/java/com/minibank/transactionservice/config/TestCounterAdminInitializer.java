package com.minibank.transactionservice.config;

import com.minibank.transactionservice.client.UserServiceClient;
import com.minibank.transactionservice.dto.UserResponse;
import com.minibank.transactionservice.entity.Counter;
import com.minibank.transactionservice.entity.CounterStaff;
import com.minibank.transactionservice.repository.CounterRepository;
import com.minibank.transactionservice.repository.CounterStaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Dev/demo seed: tạo dữ liệu mẫu cho counters và counter staff.
 *
 * Counter-admin detection in this system is based on Counter.adminUserId.
 * This initializer assigns the seeded staff user (counter.admin@minibank.com) as admin of a test counter.
 *
 * NOT recommended for production usage.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TestCounterAdminInitializer implements CommandLineRunner {

    private static final String SEEDED_COUNTER_ADMIN_EMAIL = "counter.admin@minibank.com";
    private static final String SEEDED_STAFF_EMAIL = "staff@minibank.com";

    private final UserServiceClient userServiceClient;
    private final CounterRepository counterRepository;
    private final CounterStaffRepository counterStaffRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Tạo các quầy giao dịch mẫu
            createSampleCounters();
        } catch (Exception e) {
            // Don't fail startup for dev seed
            log.warn("Failed to seed counter data: {}", e.getMessage());
        }
    }

    private void createSampleCounters() {
        // Lấy thông tin users
        UserResponse counterAdmin = getUserByEmail(SEEDED_COUNTER_ADMIN_EMAIL);
        UserResponse staff = getUserByEmail(SEEDED_STAFF_EMAIL);

        // Tạo Quầy 1: Quầy Trung tâm (có counter admin)
        Counter counter1 = createCounterIfNotExists("Q001", "Quầy Trung tâm", "123 Nguyễn Huệ, Q.1, TP.HCM", 
                                 10, counterAdmin != null ? counterAdmin.getUserId() : null, true);
        // Thêm staff vào quầy 1 để có nhân viên xử lý giao dịch
        if (counter1 != null && staff != null) {
            addStaffToCounter(counter1.getId(), staff.getUserId());
        }

        // Tạo Quầy 2: Quầy Thủ Đức (có staff)
        Counter counter2 = createCounterIfNotExists("Q002", "Quầy Thủ Đức", "456 Võ Văn Ngân, TP. Thủ Đức", 
                                                     8, staff != null ? staff.getUserId() : null, true);
        if (counter2 != null && staff != null) {
            addStaffToCounter(counter2.getId(), staff.getUserId());
        }
        if (counter2 != null && counterAdmin != null) {
            addStaffToCounter(counter2.getId(), counterAdmin.getUserId());
        }

        log.info("Sample counters seeded successfully - Total: 2 counters");
    }

    private Counter createCounterIfNotExists(String counterCode, String name, String address, 
                                            int maxStaff, UUID adminUserId, boolean isActive) {
        if (counterRepository.existsByCounterCode(counterCode)) {
            log.info("Counter '{}' already exists, skipping", counterCode);
            return counterRepository.findAll().stream()
                    .filter(c -> counterCode.equals(c.getCounterCode()))
                    .findFirst()
                    .orElse(null);
        }

        Counter counter = new Counter();
        counter.setCounterCode(counterCode);
        counter.setName(name);
        counter.setAddress(address);
        counter.setMaxStaff(maxStaff);
        counter.setAdminUserId(adminUserId);
        counter.setIsActive(isActive);

        Counter saved = counterRepository.save(counter);
        log.info("Created counter: code='{}', name='{}', active={}", counterCode, name, isActive);

        // Nếu có adminUserId, thêm admin vào counter_staff
        if (adminUserId != null) {
            addStaffToCounter(saved.getId(), adminUserId);
        }

        return saved;
    }

    private void addStaffToCounter(UUID counterId, UUID userId) {
        CounterStaff existingStaff = counterStaffRepository.findByCounterIdAndUserId(counterId, userId);
        if (existingStaff == null) {
            CounterStaff cs = new CounterStaff();
            cs.setCounterId(counterId);
            cs.setUserId(userId);
            cs.setIsActive(true);
            counterStaffRepository.save(cs);
            log.info("Added staff userId={} to counterId={}", userId, counterId);
        }
    }

    private UserResponse getUserByEmail(String email) {
        try {
            UserResponse user = userServiceClient.getUserByEmail(email);
            if (user == null || user.getUserId() == null) {
                log.warn("User '{}' not found", email);
                return null;
            }
            return user;
        } catch (Exception e) {
            log.warn("Failed to get user '{}': {}", email, e.getMessage());
            return null;
        }
    }
}


