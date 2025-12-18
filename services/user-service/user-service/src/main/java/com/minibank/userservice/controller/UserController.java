package com.minibank.userservice.controller;

import com.minibank.userservice.dto.AuthResponse;
import com.minibank.userservice.dto.PasswordResetConfirmRequest;
import com.minibank.userservice.dto.PasswordResetRequest;
import com.minibank.userservice.dto.TokenRefreshRequest;
import com.minibank.userservice.dto.UserLoginRequest;
import com.minibank.userservice.dto.UserRegistrationRequest;
import com.minibank.userservice.service.UserService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // --- FR-01: Đăng ký người dùng ---
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        userService.registerUser(request);
        return new ResponseEntity<>("User registered successfully.", HttpStatus.CREATED);
    }

    // --- FR-02: Đăng nhập người dùng ---
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody UserLoginRequest request) {
        AuthResponse response = userService.loginUser(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- Đăng nhập Admin ---
    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> loginAdmin(@Valid @RequestBody UserLoginRequest request) {
        AuthResponse response = userService.loginAdmin(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- Đăng nhập Staff ---
    @PostMapping("/staff/login")
    public ResponseEntity<AuthResponse> loginStaff(@Valid @RequestBody UserLoginRequest request) {
        AuthResponse response = userService.loginStaff(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- FR-02: Đăng xuất người dùng ---
    @PostMapping("/logout")
    public ResponseEntity<Void> logoutUser(@RequestHeader("Authorization") String token) {
        userService.logout(token);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // --- FR-03: Khởi tạo đặt lại mật khẩu (Gửi email/OTP) ---
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> initiatePasswordReset(@Valid @RequestBody PasswordResetRequest request) {
        userService.initiatePasswordReset(request);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // --- FR-03: Xác nhận đặt lại mật khẩu ---
    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        userService.resetPassword(request);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // --- JWT: Cấp lại Access Token ---
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        AuthResponse response = userService.refreshToken(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // --- FR-09: Tự khóa tài khoản ---
    @PutMapping("/self-freeze")
    public ResponseEntity<Void> selfFreezeAccount(@RequestHeader("Authorization") String token) {
        userService.freezeCurrentUser(token);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}