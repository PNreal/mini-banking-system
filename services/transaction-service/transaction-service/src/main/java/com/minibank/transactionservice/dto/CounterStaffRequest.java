package com.minibank.transactionservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CounterStaffRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;
}

