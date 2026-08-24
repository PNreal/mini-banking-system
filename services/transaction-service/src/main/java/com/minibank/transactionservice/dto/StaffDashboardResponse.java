package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDashboardResponse {
    private StaffStatsResponse stats;
    private List<StaffPendingTransactionResponse> pendingApprovals;
    private long kycRequestsCount;
    private List<RecentCustomerResponse> recentCustomers;
}


