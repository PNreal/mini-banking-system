package com.minibank.userservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycRequestDto {

    @NotBlank(message = "Citizen ID is required")
    private String citizenId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private String gender; // MALE, FEMALE, OTHER

    private String placeOfIssue;

    private LocalDate dateOfIssue;

    private LocalDate expiryDate;

    @NotBlank(message = "Permanent address is required")
    private String permanentAddress;

    private String currentAddress;

    @NotBlank(message = "Phone number is required")
    private String phoneNumber;

    @Email(message = "Invalid email format")
    private String email;

    // Image URLs will be set after file upload
    private String frontIdImageUrl;
    private String backIdImageUrl;
    private String selfieImageUrl;
}
