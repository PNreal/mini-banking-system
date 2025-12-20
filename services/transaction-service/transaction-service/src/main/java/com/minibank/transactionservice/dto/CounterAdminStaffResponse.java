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
public class CounterAdminStaffResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private String employeeCode;
    private Boolean isActive;
}


