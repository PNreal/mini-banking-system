package com.minibank.userservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.minibank.userservice.dto.AuthResponse;
import com.minibank.userservice.dto.CreateAccountRequest;
import com.minibank.userservice.dto.CreateEmployeeRequest;
import com.minibank.userservice.dto.CreateEmployeeResponse;
import com.minibank.userservice.dto.PasswordResetConfirmRequest;
import com.minibank.userservice.dto.PasswordResetRequest;
import com.minibank.userservice.dto.TokenRefreshRequest;
import com.minibank.userservice.dto.UserLoginRequest;
import com.minibank.userservice.dto.UserRegistrationRequest;
import com.minibank.userservice.dto.UserResponse;
import com.minibank.userservice.exception.BadRequestException;
import com.minibank.userservice.exception.NotFoundException;
import com.minibank.userservice.model.User;
import com.minibank.userservice.model.UserStatus;
import com.minibank.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AccountServiceClient accountServiceClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${user.kafka.user-event-topic:USER_EVENT}")
    private String userEventTopic;

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedFullName = request.getFullName().trim();

        userRepository.findByEmail(normalizedEmail)
                .ifPresent(u -> { throw new BadRequestException("Email already in use"); });

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(normalizedEmail, hashedPassword, normalizedFullName);
        User saved = userRepository.save(newUser);

        publishEvent("USER_REGISTERED", saved.getId());

        // Tạo tài khoản ngân hàng mặc định
        CreateAccountRequest accountRequest = new CreateAccountRequest();
        accountRequest.setUserId(saved.getId());
        accountServiceClient.createAccount(accountRequest);

        return saved;
    }

    public AuthResponse loginUser(UserLoginRequest request) {
        return loginWithRole(request, "CUSTOMER");
    }

    public AuthResponse loginAdmin(UserLoginRequest request) {
        return loginWithRole(request, "ADMIN");
    }

    public AuthResponse loginStaff(UserLoginRequest request) {
        return loginWithRole(request, "STAFF");
    }

    private AuthResponse loginWithRole(UserLoginRequest request, String requiredRole) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Kiểm tra tài khoản có đang bị khóa tạm thời do nhập sai nhiều lần không
        if (user.getLoginLockedUntil() != null && user.getLoginLockedUntil().isAfter(Instant.now())) {
            throw new BadRequestException("Tài khoản đã bị tạm khóa 10 phút do nhập sai mật khẩu quá nhiều lần.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            // Xử lý tăng số lần đăng nhập sai
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            // Nếu sai từ 5 lần trở lên -> khóa 10 phút
            if (attempts >= 5) {
                user.setLoginLockedUntil(Instant.now().plus(10, ChronoUnit.MINUTES));
                user.setFailedLoginAttempts(0); // reset lại bộ đếm sau khi khóa
            }

            userRepository.save(user);
            throw new BadRequestException("Invalid email or password");
        }
        if (user.getStatus() == UserStatus.FROZEN) {
            throw new IllegalStateException("Account is frozen");
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            throw new IllegalStateException("Account is locked");
        }

        // Kiểm tra role nếu yêu cầu
        if (requiredRole != null && !requiredRole.equals(user.getRole())) {
            throw new BadRequestException("Access denied. Required role: " + requiredRole);
        }

        String accessToken = jwtService.generateAccessToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(Instant.now().plus(7, ChronoUnit.DAYS));
        userRepository.save(user);

        publishEvent("USER_LOGIN", user.getId());

        // Đăng nhập thành công: reset lại bộ đếm và trạng thái khóa tạm thời
        user.setFailedLoginAttempts(0);
        user.setLoginLockedUntil(null);
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setRole(user.getRole());
        return response;
    }

    @Transactional
    public void initiatePasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        String resetToken = jwtService.generateResetToken(user.getEmail());
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(Instant.now().plus(10, ChronoUnit.MINUTES));
        userRepository.save(user);

        String resetLink = "http://localhost:8081/reset-password?token=" + resetToken;
        String subject = "Đặt lại mật khẩu MiniBank";
        String body = "Chào bạn,\n\n"
                + "Bạn vừa yêu cầu đặt lại mật khẩu. Link đặt lại mật khẩu:\n"
                + resetLink + "\n\n"
                + "Link này sẽ hết hạn sau 10 phút.";
        emailService.sendSimpleEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(PasswordResetConfirmRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("Reset token has expired");
        }

        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashedPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void freezeCurrentUser(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));
        if (user.getStatus() != UserStatus.FROZEN) {
            user.setStatus(UserStatus.FROZEN);
            userRepository.save(user);
        }
    }

    @Transactional
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Vô hiệu hóa refresh token hiện tại để ngăn cấp lại access token sau khi logout
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        userRepository.save(user);

        publishEvent("USER_LOGOUT", user.getId());
    }

    public AuthResponse refreshToken(TokenRefreshRequest request) {
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (user.getRefreshTokenExpiry() == null || user.getRefreshTokenExpiry().isBefore(Instant.now())) {
            throw new BadRequestException("Refresh token has expired. Please login again.");
        }

        String newAccessToken = jwtService.generateAccessToken(user.getEmail());
        AuthResponse response = new AuthResponse();
        response.setAccessToken(newAccessToken);
        response.setRefreshToken(request.getRefreshToken());
        return response;
    }

    // --- Internal Admin APIs ---
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return UserResponse.from(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
        return UserResponse.from(user);
    }

    @Transactional
    public void lockUser(UUID userId) {
        updateStatus(userId, UserStatus.LOCKED);
    }

    @Transactional
    public void unlockUser(UUID userId) {
        updateStatus(userId, UserStatus.ACTIVE);
    }

    @Transactional
    public void freezeUser(UUID userId) {
        updateStatus(userId, UserStatus.FROZEN);
    }

    @Transactional
    public void unfreezeUser(UUID userId) {
        updateStatus(userId, UserStatus.ACTIVE);
    }

    private void updateStatus(UUID userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse createUser(com.minibank.userservice.dto.CreateUserRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        
        userRepository.findByEmail(normalizedEmail)
                .ifPresent(u -> { throw new BadRequestException("Email already in use"); });

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(normalizedEmail, hashedPassword, request.getFullName());
        newUser.setRole(request.getRole());
        newUser.setCitizenId(request.getCitizenId());
        newUser.setEmployeeCode(request.getEmployeeCode());
        
        User saved = userRepository.save(newUser);
        publishEvent("USER_CREATED", saved.getId());
        
        return UserResponse.from(saved);
    }

    @Transactional
    public UserResponse updateUser(UUID userId, com.minibank.userservice.dto.UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getCitizenId() != null) {
            user.setCitizenId(request.getCitizenId());
        }
        if (request.getEmployeeCode() != null) {
            user.setEmployeeCode(request.getEmployeeCode());
        }
        if (request.getEmail() != null) {
            // Check if email already exists for another user
            userRepository.findByEmail(request.getEmail()).ifPresent(existingUser -> {
                if (!existingUser.getId().equals(userId)) {
                    throw new IllegalArgumentException("Email already exists");
                }
            });
            user.setEmail(request.getEmail());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        
        User updated = userRepository.save(user);
        publishEvent("USER_UPDATED", updated.getId());
        
        return UserResponse.from(updated);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        
        userRepository.delete(user);
        publishEvent("USER_DELETED", userId);
    }

    /**
     * Tạo tài khoản employee (COUNTER_ADMIN, COUNTER_STAFF, KYC_STAFF)
     * Được gọi từ các service khác qua internal endpoint
     */
    @Transactional
    public CreateEmployeeResponse createEmployee(CreateEmployeeRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        
        // Kiểm tra email đã tồn tại chưa
        userRepository.findByEmail(normalizedEmail)
                .ifPresent(u -> { throw new BadRequestException("Email already in use"); });

        // Validate role
        String role = request.getRole().toUpperCase();
        if (!List.of("COUNTER_ADMIN", "COUNTER_STAFF", "KYC_STAFF", "ADMIN").contains(role)) {
            throw new BadRequestException("Invalid role: " + role);
        }

        // Tạo employee code nếu chưa có
        String employeeCode = request.getEmployeeCode();
        if (employeeCode == null || employeeCode.trim().isEmpty()) {
            employeeCode = generateEmployeeCode(role);
        }

        // Tạo password nếu chưa có
        String password = request.getPassword();
        String generatedPassword = null;
        if (password == null || password.trim().isEmpty()) {
            generatedPassword = generateRandomPassword();
            password = generatedPassword;
        }

        // Tạo user
        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(request.getFullName().trim());
        user.setPhoneNumber(request.getPhoneNumber().trim());
        user.setRole(role);
        user.setEmployeeCode(employeeCode);
        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true); // Employee được tạo sẵn nên đã verified

        User saved = userRepository.save(user);
        publishEvent("EMPLOYEE_CREATED", saved.getId());

        return CreateEmployeeResponse.builder()
                .userId(saved.getId())
                .email(saved.getEmail())
                .fullName(saved.getFullName())
                .phoneNumber(saved.getPhoneNumber())
                .role(saved.getRole())
                .employeeCode(saved.getEmployeeCode())
                .generatedPassword(generatedPassword)
                .build();
    }

    /**
     * Tạo employee code tự động
     */
    private String generateEmployeeCode(String role) {
        String prefix;
        switch (role) {
            case "COUNTER_ADMIN":
                prefix = "CA";
                break;
            case "COUNTER_STAFF":
                prefix = "CS";
                break;
            case "KYC_STAFF":
                prefix = "KS";
                break;
            case "ADMIN":
                prefix = "AD";
                break;
            default:
                prefix = "EM";
        }
        
        // Tạo mã 6 số ngẫu nhiên
        SecureRandom random = new SecureRandom();
        int number = random.nextInt(999999);
        return String.format("%s%06d", prefix, number);
    }

    /**
     * Tạo password ngẫu nhiên 12 ký tự
     */
    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }

    private void publishEvent(String action, UUID userId) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = Map.of(
                        "action", action,
                        "userId", String.valueOf(userId),
                        "timestamp", Instant.now().toString()
                );
                String jsonPayload = objectMapper.writeValueAsString(payload);
                kafkaTemplate.send(userEventTopic, userId.toString(), jsonPayload);
            }
        } catch (JsonProcessingException ex) {
            log.warn("Failed to serialize user event {} for {}", action, userId, ex);
        } catch (Exception ex) {
            log.warn("Failed to publish user event {} for {}", action, userId, ex);
        }
    }
}
