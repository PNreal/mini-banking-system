package com.minibank.userservice.controller;

import com.minibank.userservice.dto.ApiResponse;
import com.minibank.userservice.dto.AuthResponse;
import com.minibank.userservice.dto.ChangePasswordRequest;
import com.minibank.userservice.dto.CreateEmployeeRequest;
import com.minibank.userservice.dto.CreateEmployeeResponse;
import com.minibank.userservice.dto.PasswordResetConfirmRequest;
import com.minibank.userservice.dto.PasswordResetRequest;
import com.minibank.userservice.dto.TokenRefreshRequest;
import com.minibank.userservice.dto.UserLoginRequest;
import com.minibank.userservice.dto.UserRegistrationRequest;
import com.minibank.userservice.dto.UserResponse;
import com.minibank.userservice.service.JwtService;
import com.minibank.userservice.service.UserService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
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

    // --- Đổi mật khẩu (yêu cầu đăng nhập) ---
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(token, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(new ApiResponse<>("Password changed successfully", null));
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

    // --- Lấy thông tin user hiện tại ---
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract email từ JWT token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            
            // Tìm user bằng email
            UserResponse userResponse = userService.getUserByEmail(email);
            return ResponseEntity.ok(new ApiResponse<>("User info retrieved successfully", userResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>("User not found: " + e.getMessage(), null));
        }
    }

    // --- Upload avatar cho user hiện tại (tạm thời trả về URL mặc định) ---
    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadAvatar(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        try {
            // Extract email từ JWT token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            
            // Tạm thời: dùng URL mặc định, bỏ qua file upload
            String defaultAvatarUrl = "/assets/default.jpg";
            
            // Cập nhật avatar URL trong database
            userService.updateAvatar(email, defaultAvatarUrl);
            
            java.util.Map<String, String> responseData = new java.util.HashMap<>();
            responseData.put("avatarUrl", defaultAvatarUrl);
            responseData.put("imageUrl", defaultAvatarUrl);
            
            return ResponseEntity.ok(new ApiResponse<>("Avatar uploaded successfully", responseData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to upload avatar: " + e.getMessage(), null));
        }
    }

    // --- Upload avatar (endpoint thay thế) ---
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> uploadAvatarAlt(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return uploadAvatar(authHeader, file, image);
    }

    // --- Admin: Tạo user mới ---
    @PostMapping("/admin/users")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody com.minibank.userservice.dto.CreateUserRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin role from token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            UserResponse createdUser = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("User created successfully", createdUser));
        } catch (com.minibank.userservice.exception.BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to create user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Lấy danh sách tất cả users ---
    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getAllUsers(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin role from token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            java.util.List<UserResponse> users = userService.getAllUsers();
            return ResponseEntity.ok(new ApiResponse<>("Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve users: " + e.getMessage(), null));
        }
    }

    // --- Admin: Cập nhật thông tin user ---
    @PutMapping("/admin/users/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable("userId") java.util.UUID userId,
            @RequestBody com.minibank.userservice.dto.UpdateUserRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin role from token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            UserResponse updatedUser = userService.updateUser(userId, request);
            return ResponseEntity.ok(new ApiResponse<>("User updated successfully", updatedUser));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to update user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Khóa tài khoản user ---
    @PutMapping("/admin/users/{userId}/lock")
    public ResponseEntity<ApiResponse<Void>> lockUser(
            @PathVariable("userId") java.util.UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            userService.lockUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("User locked successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to lock user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Mở khóa tài khoản user ---
    @PutMapping("/admin/users/{userId}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockUser(
            @PathVariable("userId") java.util.UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            userService.unlockUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("User unlocked successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to unlock user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Đặt lại mật khẩu cho user ---
    @PutMapping("/admin/users/{userId}/reset-password")
    public ResponseEntity<ApiResponse<Void>> adminResetPassword(
            @PathVariable("userId") java.util.UUID userId,
            @Valid @RequestBody com.minibank.userservice.dto.AdminResetPasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            userService.adminResetPassword(userId, request.getNewPassword());
            return ResponseEntity.ok(new ApiResponse<>("Password reset successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to reset password: " + e.getMessage(), null));
        }
    }

    // --- Admin: Đóng băng tài khoản user ---
    @PutMapping("/admin/users/{userId}/freeze")
    public ResponseEntity<ApiResponse<Void>> freezeUser(
            @PathVariable("userId") java.util.UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            userService.freezeUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("User frozen successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to freeze user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Mở đóng băng tài khoản user ---
    @PutMapping("/admin/users/{userId}/unfreeze")
    public ResponseEntity<ApiResponse<Void>> unfreezeUser(
            @PathVariable("userId") java.util.UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            userService.unfreezeUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("User unfrozen successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to unfreeze user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Xóa tài khoản user ---
    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable("userId") java.util.UUID userId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            userService.deleteUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("User deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to delete user: " + e.getMessage(), null));
        }
    }

    // --- Admin: Tạo nhân viên (Staff/Counter Staff/Counter Admin) ---
    @PostMapping("/admin/employees")
    public ResponseEntity<ApiResponse<CreateEmployeeResponse>> createEmployee(
            @Valid @RequestBody CreateEmployeeRequest request,
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin role from token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            CreateEmployeeResponse response = userService.createEmployee(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>("Employee created successfully", response));
        } catch (com.minibank.userservice.exception.BadRequestException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(e.getMessage(), null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to create employee: " + e.getMessage(), null));
        }
    }

    // --- Admin: Lấy danh sách nhân viên ---
    @GetMapping("/admin/employees")
    public ResponseEntity<ApiResponse<java.util.List<UserResponse>>> getAllEmployees(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Verify admin role from token
            String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
            String email = jwtService.extractEmail(token);
            UserResponse currentUser = userService.getUserByEmail(email);
            
            if (!"ADMIN".equals(currentUser.getRole())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>("Access denied. Admin role required.", null));
            }
            
            java.util.List<UserResponse> employees = userService.getAllEmployees();
            return ResponseEntity.ok(new ApiResponse<>("Employees retrieved successfully", employees));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Failed to retrieve employees: " + e.getMessage(), null));
        }
    }
}