package com.minibank.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemReportResponse {
    private Long totalUsers;
    private Long totalTransactionsToday;
    private Double totalAmount;
    private Long failedTransactions;
    private Map<String, Long> transactionCountsByType;
    private Map<String, Long> userStatusCounts;
}

