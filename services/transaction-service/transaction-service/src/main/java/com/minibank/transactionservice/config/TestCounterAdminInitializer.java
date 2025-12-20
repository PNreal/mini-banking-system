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

/**
 * Dev/demo seed: ensures there's a "counter admin" user for easy testing.
 *
 * Counter-admin detection in this system is based on Counter.adminUserId.
 * This initializer assigns the seeded staff user (staff@minibank.com) as admin of a test counter.
 *
 * NOT recommended for production usage.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TestCounterAdminInitializer implements CommandLineRunner {

    private static final String SEEDED_COUNTER_ADMIN_EMAIL = "counter.admin@minibank.com";

    private final UserServiceClient userServiceClient;
    private final CounterRepository counterRepository;
    private final CounterStaffRepository counterStaffRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            UserResponse user = userServiceClient.getUserByEmail(SEEDED_COUNTER_ADMIN_EMAIL);
            if (user == null || user.getUserId() == null) {
                log.warn("Counter-admin seed skipped: user '{}' not found", SEEDED_COUNTER_ADMIN_EMAIL);
                return;
            }

            if (counterRepository.existsByAdminUserIdAndIsActiveTrue(user.getUserId())) {
                log.info("Counter-admin seed: user '{}' already assigned as counter admin", SEEDED_COUNTER_ADMIN_EMAIL);
                return;
            }

            String counterCode = pickUniqueCounterCode();
            Counter counter = new Counter();
            counter.setCounterCode(counterCode);
            counter.setName("Quầy test (Counter Admin)");
            counter.setAddress("Demo address");
            counter.setMaxStaff(10);
            counter.setAdminUserId(user.getUserId());
            counter.setIsActive(true);

            Counter saved = counterRepository.save(counter);

            // Also ensure the admin user is an active staff member of that counter (so assignment logic works in demos)
            CounterStaff existingStaff = counterStaffRepository.findByCounterIdAndUserIdAndIsActiveTrue(saved.getId(), user.getUserId());
            if (existingStaff == null) {
                CounterStaff cs = new CounterStaff();
                cs.setCounterId(saved.getId());
                cs.setUserId(user.getUserId());
                cs.setIsActive(true);
                counterStaffRepository.save(cs);
            }

            log.info("Seeded counter admin: email='{}' -> counterCode='{}', counterId={}",
                    SEEDED_COUNTER_ADMIN_EMAIL, counterCode, saved.getId());
        } catch (Exception e) {
            // Don't fail startup for dev seed
            log.warn("Failed to seed counter admin '{}': {}", SEEDED_COUNTER_ADMIN_EMAIL, e.getMessage());
        }
    }

    private String pickUniqueCounterCode() {
        for (int i = 1; i <= 99; i++) {
            String code = "QTEST" + String.format("%02d", i);
            if (!counterRepository.existsByCounterCode(code)) {
                return code;
            }
        }
        return "QTEST" + System.currentTimeMillis();
    }
}


