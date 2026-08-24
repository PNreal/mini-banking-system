package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {
    private String email;
    private String fullName;
    private String phoneNumber;
    private String role; // COUNTER_ADMIN, COUNTER_STAFF
    private String employeeCode; // Optional
    private String password; // Optional
}
