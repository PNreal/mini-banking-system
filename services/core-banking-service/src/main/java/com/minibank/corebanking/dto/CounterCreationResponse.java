package com.minibank.corebanking.dto;

import com.minibank.corebanking.entity.Counter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CounterCreationResponse {
    private Counter counter;
    private CreateEmployeeResponse adminAccount; // Thông tin tài khoản admin vừa tạo (nếu có)
}
