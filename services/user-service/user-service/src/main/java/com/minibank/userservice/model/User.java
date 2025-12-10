package com.minibank.userservice.model;

import java.time.Instant;
import java.time.LocalDateTime; // Có thể xóa nếu service chuyển sang dùng Instant
import java.time.ZoneId;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String passwordHash;
    private boolean isFrozen = false;

    private String resetToken;
    private Instant resetTokenExpiry;

    private String refreshToken;
    private Instant refreshTokenExpiry;

    public User() {}

    public User(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
    }

    // --- Getters & Setters ---
    public Long getId() {
        return id;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getPasswordHash() {
        return passwordHash;
    }
    public String getPassword() {
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    public boolean isAccountFrozen() {
        return isFrozen;
    }
    public void setIsFrozen(Boolean frozen) {
        this.isFrozen = frozen;
    }
    public String getResetToken() {
        return resetToken;
    }
    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }
    public Instant getResetTokenExpiry() {
        return resetTokenExpiry;
    }
    public void setResetTokenExpiry(Instant resetTokenExpiry) {
        this.resetTokenExpiry = resetTokenExpiry;
    }
    public String getRefreshToken() {
        return refreshToken;
    }
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public Instant getRefreshTokenExpiry() {
        return refreshTokenExpiry;
    }
    public void setRefreshTokenExpiry(Instant expireTime) {
        this.refreshTokenExpiry = expireTime;
    }
    public void setRefreshTokenExpire(LocalDateTime localDateTime) {
        if (localDateTime != null) {
            this.refreshTokenExpiry = localDateTime.atZone(ZoneId.systemDefault()).toInstant();
        } else {
            this.refreshTokenExpiry = null;
        }
    }
        public Boolean getIsFrozen() {
        return this.isFrozen;
    }
}