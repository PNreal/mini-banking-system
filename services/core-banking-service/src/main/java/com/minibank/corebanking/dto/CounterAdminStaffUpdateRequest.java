package com.minibank.corebanking.dto;

import lombok.Data;

@Data
public class CounterAdminStaffUpdateRequest {
    // Nếu null thì giữ nguyên
    private Boolean isActive;
}


