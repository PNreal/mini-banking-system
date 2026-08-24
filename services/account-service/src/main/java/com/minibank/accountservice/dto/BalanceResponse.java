package com.minibank.accountservice.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.util.UUID;

@Value
@Builder
public class BalanceResponse {
    UUID accountId;
    BigDecimal balance;
}

