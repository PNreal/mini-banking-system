package com.minibank.transactionservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class AssignCounterAdminRequest {
    // Cho phép truyền 1 trong 2: adminUserId hoặc email
    private UUID adminUserId;
    private String email;
}


