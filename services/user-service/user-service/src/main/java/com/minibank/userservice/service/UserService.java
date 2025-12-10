package com.minibank.userservice.service;

import com.minibank.userservice.dto.AuthResponse;
import com.minibank.userservice.dto.TokenRefreshRequest;
import com.minibank.userservice.dto.UserRegistrationRequest;
import com.minibank.userservice.dto.PasswordResetRequest;
import com.minibank.userservice.dto.PasswordResetConfirmRequest;
import com.minibank.userservice.dto.UserLoginRequest;
import com.minibank.userservice.model.User;
import com.minibank.userservice.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant; 
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

            public UserService(UserRepository userRepository, 
                    PasswordEncoder passwordEncoder, 
                    JwtService jwtService, 
                    EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    // --- FR-01: Đăng ký ---
    public User registerUser(UserRegistrationRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User newUser = new User(request.getEmail(), hashedPassword); 
        return userRepository.save(newUser);
    }

    // --- FR-02: Đăng nhập (với JWT) ---
    public AuthResponse loginUser(UserLoginRequest request) { 
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
        // 1. Xác thực Mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) { 
            throw new IllegalArgumentException("Invalid password");
        }      
        // 2. Kiểm tra Trạng thái tài khoản (FR-09)
        if (user.getIsFrozen()) { 
            throw new IllegalStateException("Account is frozen and cannot log in.");
        }
            // 3. Tạo và Lưu JWT TOKENS
            String accessToken = jwtService.generateAccessToken(user.getEmail());
            String refreshToken = jwtService.generateRefreshToken(user.getEmail());

            user.setRefreshToken(refreshToken);

            user.setRefreshTokenExpiry(Instant.now().plusSeconds(604800)); 
            userRepository.save(user);

        // 4. Trả về Response DTO
        AuthResponse response = new AuthResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshToken);

        return response;
    }

    // --- FR-03: Khởi tạo đặt lại mật khẩu ---
            public void initiatePasswordReset(PasswordResetRequest request) {
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

            String resetToken = jwtService.generateResetToken(user.getEmail());
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(Instant.now().plusSeconds(600)); 
            userRepository.save(user);

            String resetLink = "http://localhost:8081/reset-password?token=" + resetToken;
            String subject = "Đặt lại mật khẩu MiniBank";
            String body = "Chào bạn,\n\n"
                    + "Bạn vừa yêu cầu đặt lại mật khẩu. Link đặt lại mật khẩu:\n"
                    + resetLink + "\n\n"
                    + "Link này sẽ hết hạn sau 10 phút.";
            emailService.sendSimpleEmail(user.getEmail(), subject, body);
        }

    // --- FR-03: Xác nhận đặt lại mật khẩu ---
    public void resetPassword(PasswordResetConfirmRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));
            
        if (user.getResetTokenExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }
        
        String hashedPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPasswordHash(hashedPassword);
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }
    
    // --- FR-09: Tự khóa tài khoản ---
    public void freezeUserAccount(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsFrozen(true); 
        userRepository.save(user);
    }

    // --- Các hàm hỗ trợ JWT ---
    public Optional<User> findByRefreshToken(String refreshToken) {
        return userRepository.findByRefreshToken(refreshToken);
    }
    public User saveUser(User user) {
        return userRepository.save(user);
    }
	public void freezeCurrentUser(String token) {
    if (token.startsWith("Bearer ")) {
        token = token.substring(7);
    }
    // Lấy email từ token (Giả định JwtService có hàm extractUsername)
    String email = jwtService.extractUsername(token); 
    // Tìm user và khóa lại
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
    user.setIsFrozen(true);
    userRepository.save(user);
    }

    public AuthResponse refreshToken(TokenRefreshRequest request) {
    // Tìm user bằng refresh token trong DB
    User user = userRepository.findByRefreshToken(request.getRefreshToken())
            .orElseThrow(() -> new IllegalArgumentException("Invalid Refresh Token"));

    // Kiểm tra hết hạn (So sánh Instant)
    if (user.getRefreshTokenExpiry().isBefore(Instant.now())) {
        throw new IllegalArgumentException("Refresh token has expired. Please login again.");
    }

    // Tạo Access Token mới
    String newAccessToken = jwtService.generateAccessToken(user.getEmail());

    AuthResponse response = new AuthResponse();
    response.setAccessToken(newAccessToken);
    response.setRefreshToken(request.getRefreshToken());
    return response;
    }
}