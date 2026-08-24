package com.minibank.transactionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentCustomerResponse {
    private String id;
    private String name;
    private String accountNumber;
    private String product;
    private String lastAction;
    private OffsetDateTime lastActionAt;
}


