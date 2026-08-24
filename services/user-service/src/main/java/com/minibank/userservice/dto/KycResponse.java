package com.minibank.userservice.dto;

import com.minibank.userservice.model.KycRequest;
import com.minibank.userservice.model.KycStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycResponse {

    private UUID kycId;
    private UUID userId;
    private String citizenId;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String placeOfIssue;
    private LocalDate dateOfIssue;
    private LocalDate expiryDate;
    private String permanentAddress;
    private String currentAddress;
    private String phoneNumber;
    private String email;
    private String frontIdImageUrl;
    private String backIdImageUrl;
    private String selfieImageUrl;
    private KycStatus status;
    private UUID verifiedBy;
    private LocalDateTime verifiedAt;
    private String rejectionReason;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static KycResponse from(KycRequest kyc) {
        if (kyc == null) {
            return null;
        }
        return KycResponse.builder()
                .kycId(kyc.getId())
                .userId(kyc.getUserId())
                .citizenId(kyc.getCitizenId())
                .fullName(kyc.getFullName())
                .dateOfBirth(kyc.getDateOfBirth())
                .gender(kyc.getGender())
                .placeOfIssue(kyc.getPlaceOfIssue())
                .dateOfIssue(kyc.getDateOfIssue())
                .expiryDate(kyc.getExpiryDate())
                .permanentAddress(kyc.getPermanentAddress())
                .currentAddress(kyc.getCurrentAddress())
                .phoneNumber(kyc.getPhoneNumber())
                .email(kyc.getEmail())
                .frontIdImageUrl(kyc.getFrontIdImageUrl())
                .backIdImageUrl(kyc.getBackIdImageUrl())
                .selfieImageUrl(kyc.getSelfieImageUrl())
                .status(kyc.getStatus())
                .verifiedBy(kyc.getVerifiedBy())
                .verifiedAt(toLocalDateTime(kyc.getVerifiedAt()))
                .rejectionReason(kyc.getRejectionReason())
                .notes(kyc.getNotes())
                .createdAt(toLocalDateTime(kyc.getCreatedAt()))
                .updatedAt(toLocalDateTime(kyc.getUpdatedAt()))
                .build();
    }

    private static LocalDateTime toLocalDateTime(java.time.Instant instant) {
        return instant != null ? LocalDateTime.ofInstant(instant, ZoneId.systemDefault()) : null;
    }
}
