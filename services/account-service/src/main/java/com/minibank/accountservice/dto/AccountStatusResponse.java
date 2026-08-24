package com.minibank.accountservice.dto;

import com.minibank.accountservice.entity.AccountStatus;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AccountStatusResponse {
    AccountStatus status;
}


