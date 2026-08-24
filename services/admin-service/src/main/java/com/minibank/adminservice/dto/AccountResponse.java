package com.minibank.adminservice.dto;

import lombok.Data;

import java.util.UUID;

/**
 * DTO tối thiểu để map response từ account-service /internal/accounts/by-user/{userId}.
 */
@Data
public class AccountResponse {
    private UUID accountId;
    private UUID userId;
}

