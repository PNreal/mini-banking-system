package com.minibank.userservice.dto;

import com.minibank.userservice.model.User;
import com.minibank.userservice.model.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private UserStatus status;
    private String role;
    private String citizenId;
    private String employeeCode;
    private String phoneNumber;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private String kycStatus; // PENDING, APPROVED, REJECTED, or null

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .role(user.getRole())
                .citizenId(user.getCitizenId())
                .employeeCode(user.getEmployeeCode())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(toLocalDateTime(user.getCreatedAt()))
                .kycStatus(null) // Will be set by service
                .build();
    }

    public static UserResponse from(User user, String kycStatus) {
        return UserResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .status(user.getStatus())
                .role(user.getRole())
                .citizenId(user.getCitizenId())
                .employeeCode(user.getEmployeeCode())
                .phoneNumber(user.getPhoneNumber())
                .avatarUrl(user.getAvatarUrl())
                .createdAt(toLocalDateTime(user.getCreatedAt()))
                .kycStatus(kycStatus)
                .build();
    }

    private static LocalDateTime toLocalDateTime(Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneOffset.UTC);
    }
}

