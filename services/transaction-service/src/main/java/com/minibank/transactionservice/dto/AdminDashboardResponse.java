package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalTransactionsToday;
    private BigDecimal totalAmountToday;
    private long failedTransactionsToday;
    private long pendingTransactionsToday;
    private Map<String, Long> transactionCountsByType;
    private Map<String, BigDecimal> transactionAmountsByType;
    private List<DailyTransactionStat> dailyStats;
    private List<TransactionResponse> recentTransactions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyTransactionStat {
        private String date;
        private long depositCount;
        private long withdrawCount;
        private long transferCount;
        private long counterDepositCount;
        private BigDecimal depositAmount;
        private BigDecimal withdrawAmount;
        private BigDecimal transferAmount;
        private BigDecimal counterDepositAmount;
    }
}
