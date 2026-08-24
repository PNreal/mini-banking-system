package com.minibank.transactionservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransferRequest {
    @NotBlank(message = "Số tài khoản người nhận không được để trống")
    @Pattern(regexp = "^[0-9]{12}$", message = "Số tài khoản phải có đúng 12 chữ số")
    private String toAccountNumber;

    @NotNull
    @Positive
    private BigDecimal amount;
}


