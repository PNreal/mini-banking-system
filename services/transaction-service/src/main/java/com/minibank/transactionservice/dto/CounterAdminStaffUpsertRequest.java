package com.minibank.transactionservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class CounterAdminStaffUpsertRequest {
    // Cho phép truyền 1 trong 2: userId hoặc email
    private UUID userId;
    private String email;
}


