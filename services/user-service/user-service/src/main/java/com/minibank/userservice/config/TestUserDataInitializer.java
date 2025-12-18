package com.minibank.userservice.config;

import com.minibank.userservice.model.User;
import com.minibank.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Khởi tạo sẵn một tài khoản test để dễ dàng đăng nhập từ frontend.
 *
 * Đây chỉ là tiện ích cho môi trường dev/demo, KHÔNG nên dùng cho production.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class TestUserDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Test user thường
        createUserIfNotExists("test.user@example.com", "Nguyen Van Test", "TestPassword#123", "CUSTOMER");
        
        // Admin account
        createUserIfNotExists("admin@minibank.com", "Admin User", "Admin@123", "ADMIN");
        
        // Staff account
        createUserIfNotExists("staff@minibank.com", "Staff User", "Staff@123", "STAFF");
    }
    
    private void createUserIfNotExists(String email, String fullName, String rawPassword, String role) {
        userRepository.findByEmail(email).ifPresentOrElse(
                existing -> log.info("User '{}' đã tồn tại, bỏ qua khởi tạo.", email),
                () -> {
                    User user = new User();
                    user.setEmail(email);
                    user.setFullName(fullName);
                    user.setPasswordHash(passwordEncoder.encode(rawPassword));
                    user.setRole(role);

                    userRepository.save(user);
                    log.info("Đã khởi tạo user: email='{}', password='{}', role='{}'", email, rawPassword, role);
                }
        );
    }
}


