package com.minibank.userservice.dto;

import lombok.Data;

@Data
public class PasswordResetConfirmation {
    private boolean success;
    private String message;
}
