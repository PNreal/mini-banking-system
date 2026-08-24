package com.minibank.transactionservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBalanceRequest {

    public enum Operation {
        DEPOSIT,
        WITHDRAW
    }

    @NotNull
    private Operation operation;

    @NotNull
    @Positive
    private BigDecimal amount;
}


