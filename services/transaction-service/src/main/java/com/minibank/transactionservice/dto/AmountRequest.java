package com.minibank.transactionservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AmountRequest {
    @NotNull
    @Positive
    private BigDecimal amount;
}


