package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounterResponse {
    private UUID counterId;
    private String counterCode; // Mã quầy
    private String name;
    private String address;
    private Integer maxStaff;
    private UUID adminUserId; // ID của admin quầy
    private Boolean isActive;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}

