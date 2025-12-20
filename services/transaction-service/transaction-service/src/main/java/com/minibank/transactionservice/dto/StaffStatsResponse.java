package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffStatsResponse {
    private long todayTransactions;
    private BigDecimal todayAmount;
    private long pendingApprovals;
    private long customersServed;
}
