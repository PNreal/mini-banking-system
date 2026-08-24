package com.minibank.corebanking.dto;

import com.minibank.corebanking.entity.AccountStatus;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AccountStatusResponse {
    AccountStatus status;
}


