package com.minibank.userservice.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String role;
    private String citizenId;
    private String employeeCode;
}
