package com.minibank.userservice.service;

import com.minibank.userservice.dto.AuthResponse;
import com.minibank.userservice.dto.CreateAccountRequest;
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

    @Value("${user.kafka.user-event-topic:USER_EVENT}")
    private String userEventTopic;

    @Transactional
    public User registerUser(UserRegistrationRequest request) {
        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> { throw new BadRequestException("Email already in use"); });

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(request.getEmail(), hashedPassword, request.getFullName());
        User saved = userRepository.save(newUser);

        publishEvent("USER_REGISTERED", saved.getId());

        // Tạo tài khoản ngân hàng mặc định
        CreateAccountRequest accountRequest = new CreateAccountRequest();
        accountRequest.setUserId(saved.getId());
        accountServiceClient.createAccount(accountRequest);

        return saved;
    }

    public AuthResponse loginUser(UserLoginRequest request) {
        return loginWithRole(request, null);
    }

    public AuthResponse loginAdmin(UserLoginRequest request) {
        return loginWithRole(request, "ADMIN");
    }

    public AuthResponse loginStaff(UserLoginRequest request) {
        return loginWithRole(request, "STAFF");
    }

    private AuthResponse loginWithRole(UserLoginRequest request, String requiredRole) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
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

    private void publishEvent(String action, UUID userId) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = Map.of(
                        "action", action,
                        "userId", String.valueOf(userId),
                        "timestamp", Instant.now().toString()
                );
                kafkaTemplate.send(userEventTopic, userId.toString(), payload);
            }
        } catch (Exception ex) {
            log.warn("Failed to publish user event {} for {}", action, userId, ex);
        }
    }
}