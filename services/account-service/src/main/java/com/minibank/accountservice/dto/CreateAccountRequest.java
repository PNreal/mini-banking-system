package com.minibank.accountservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateAccountRequest {
    @NotNull
    private UUID userId;

    @PositiveOrZero
    private BigDecimal initialBalance = BigDecimal.ZERO;
}

