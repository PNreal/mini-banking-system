package com.minibank.transactionservice.dto;

import lombok.Data;

@Data
public class CounterAdminStaffUpdateRequest {
    // Nếu null thì giữ nguyên
    private Boolean isActive;
}


