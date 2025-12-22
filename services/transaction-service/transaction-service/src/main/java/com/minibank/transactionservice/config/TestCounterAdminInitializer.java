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

        // Tạo Quầy 3: Quầy Bình Thạnh (inactive)
        createCounterIfNotExists("Q003", "Quầy Bình Thạnh", "789 Điện Biên Phủ, Q. Bình Thạnh", 
                                 6, null, false);

        // Tạo Quầy 4: Quầy Quận 7 - thêm staff
        Counter counter4 = createCounterIfNotExists("Q004", "Quầy Quận 7", "321 Nguyễn Lương Bằng, Q.7", 
                                 12, null, true);
        if (counter4 != null && staff != null) {
            addStaffToCounter(counter4.getId(), staff.getUserId());
        }

        // Tạo Quầy 5: Quầy Gò Vấp - thêm staff
        Counter counter5 = createCounterIfNotExists("Q005", "Quầy Gò Vấp", "234 Quang Trung, Q. Gò Vấp, TP.HCM", 
                                 8, null, true);
        if (counter5 != null && counterAdmin != null) {
            addStaffToCounter(counter5.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 6: Quầy Tân Bình - thêm staff
        Counter counter6 = createCounterIfNotExists("Q006", "Quầy Tân Bình", "567 Cộng Hòa, Q. Tân Bình, TP.HCM", 
                                 10, null, true);
        if (counter6 != null && staff != null) {
            addStaffToCounter(counter6.getId(), staff.getUserId());
        }

        // Tạo Quầy 7: Quầy Phú Nhuận - thêm staff
        Counter counter7 = createCounterIfNotExists("Q007", "Quầy Phú Nhuận", "890 Phan Xích Long, Q. Phú Nhuận, TP.HCM", 
                                 6, null, true);
        if (counter7 != null && counterAdmin != null) {
            addStaffToCounter(counter7.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 8: Quầy Quận 3 - thêm staff
        Counter counter8 = createCounterIfNotExists("Q008", "Quầy Quận 3", "111 Võ Văn Tần, Q.3, TP.HCM", 
                                 7, null, true);
        if (counter8 != null && staff != null) {
            addStaffToCounter(counter8.getId(), staff.getUserId());
        }

        // Tạo Quầy 9: Quầy Quận 10 - thêm staff
        Counter counter9 = createCounterIfNotExists("Q009", "Quầy Quận 10", "222 Ba Tháng Hai, Q.10, TP.HCM", 
                                 9, null, true);
        if (counter9 != null && counterAdmin != null) {
            addStaffToCounter(counter9.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 10: Quầy Bình Tân - thêm staff
        Counter counter10 = createCounterIfNotExists("Q010", "Quầy Bình Tân", "333 Lê Trọng Tấn, Q. Bình Tân, TP.HCM", 
                                 8, null, true);
        if (counter10 != null && staff != null) {
            addStaffToCounter(counter10.getId(), staff.getUserId());
        }

        // Tạo Quầy 11: Quầy Tân Phú - thêm staff
        Counter counter11 = createCounterIfNotExists("Q011", "Quầy Tân Phú", "444 Lũy Bán Bích, Q. Tân Phú, TP.HCM", 
                                 7, null, true);
        if (counter11 != null && counterAdmin != null) {
            addStaffToCounter(counter11.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 12: Quầy Quận 5 - thêm staff
        Counter counter12 = createCounterIfNotExists("Q012", "Quầy Quận 5", "555 Trần Hưng Đạo, Q.5, TP.HCM", 
                                 10, null, true);
        if (counter12 != null && staff != null) {
            addStaffToCounter(counter12.getId(), staff.getUserId());
        }

        // Tạo Quầy 13: Quầy Quận 6 (inactive)
        createCounterIfNotExists("Q013", "Quầy Quận 6", "666 Hậu Giang, Q.6, TP.HCM", 
                                 6, null, false);

        // Tạo Quầy 14: Quầy Quận 8 - thêm staff
        Counter counter14 = createCounterIfNotExists("Q014", "Quầy Quận 8", "777 Phạm Thế Hiển, Q.8, TP.HCM", 
                                 8, null, true);
        if (counter14 != null && counterAdmin != null) {
            addStaffToCounter(counter14.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 15: Quầy Quận 11 - thêm staff
        Counter counter15 = createCounterIfNotExists("Q015", "Quầy Quận 11", "888 Lạc Long Quân, Q.11, TP.HCM", 
                                 7, null, true);
        if (counter15 != null && staff != null) {
            addStaffToCounter(counter15.getId(), staff.getUserId());
        }

        // Tạo Quầy 16: Quầy Quận 12 - thêm staff
        Counter counter16 = createCounterIfNotExists("Q016", "Quầy Quận 12", "999 Tô Ký, Q.12, TP.HCM", 
                                 9, null, true);
        if (counter16 != null && counterAdmin != null) {
            addStaffToCounter(counter16.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 17: Quầy Hóc Môn - thêm staff
        Counter counter17 = createCounterIfNotExists("Q017", "Quầy Hóc Môn", "101 Quốc lộ 22, H. Hóc Môn, TP.HCM", 
                                 6, null, true);
        if (counter17 != null && staff != null) {
            addStaffToCounter(counter17.getId(), staff.getUserId());
        }

        // Tạo Quầy 18: Quầy Củ Chi - thêm staff
        Counter counter18 = createCounterIfNotExists("Q018", "Quầy Củ Chi", "202 Tỉnh lộ 8, H. Củ Chi, TP.HCM", 
                                 5, null, true);
        if (counter18 != null && counterAdmin != null) {
            addStaffToCounter(counter18.getId(), counterAdmin.getUserId());
        }

        // Tạo Quầy 19: Quầy Nhà Bè - thêm staff
        Counter counter19 = createCounterIfNotExists("Q019", "Quầy Nhà Bè", "303 Huỳnh Tấn Phát, H. Nhà Bè, TP.HCM", 
                                 6, null, true);
        if (counter19 != null && staff != null) {
            addStaffToCounter(counter19.getId(), staff.getUserId());
        }

        // Tạo Quầy 20: Quầy Cần Giờ (inactive)
        createCounterIfNotExists("Q020", "Quầy Cần Giờ", "404 Duyên Hải, H. Cần Giờ, TP.HCM", 
                                 4, null, false);

        log.info("Sample counters seeded successfully - Total: 20 counters");
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


