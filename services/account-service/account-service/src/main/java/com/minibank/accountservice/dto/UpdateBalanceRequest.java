package com.minibank.accountservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
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

