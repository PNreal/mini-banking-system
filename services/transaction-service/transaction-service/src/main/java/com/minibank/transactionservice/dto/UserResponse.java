package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private String citizenId;
    private String employeeCode;
    private String kycStatus; // PENDING, APPROVED, REJECTED, or null if no KYC
}

