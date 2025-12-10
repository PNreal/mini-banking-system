package com.minibank.userservice.repository;

import com.minibank.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // FR-02: Đăng nhập & Validate email
    Optional<User> findByEmail(String email);

    // FR-03: Quên mật khẩu
    Optional<User> findByResetToken(String resetToken);

    // JWT Authentication: Tìm người dùng qua Refresh Token
    Optional<User> findByRefreshToken(String refreshToken);
}