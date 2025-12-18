package com.minibank.transactionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.UUID;

@Data
public class CounterRequest {
    @NotBlank(message = "Counter code is required")
    private String counterCode; // Mã quầy (VD: Q001, Q002)

    @NotBlank(message = "Counter name is required")
    private String name;

    private String address;

    @NotNull(message = "Max staff is required")
    @Positive(message = "Max staff must be greater than 0")
    private Integer maxStaff;

    private UUID adminUserId; // ID của admin quầy (optional khi tạo)
}

