package com.minibank.transactionservice.dto;

import com.minibank.transactionservice.entity.Counter;
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
