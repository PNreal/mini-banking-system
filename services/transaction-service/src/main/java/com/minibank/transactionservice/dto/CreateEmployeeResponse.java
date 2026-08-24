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
public class CreateEmployeeResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role;
    private String employeeCode;
    private String generatedPassword; // Mật khẩu tạm thời nếu được tự động sinh
}
