package com.minibank.corebanking.dto;

import com.minibank.corebanking.entity.Account;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class AccountResponse {
    private UUID accountId;
    private String accountNumber;
    private UUID userId;
    private BigDecimal balance;
    private String status;

    public static AccountResponse from(Account account) {
        if (account == null) return null;
        AccountResponse resp = new AccountResponse();
        resp.setAccountId(account.getId());
        resp.setAccountNumber(account.getAccountNumber());
        resp.setUserId(account.getUserId());
        resp.setBalance(account.getBalance());
        resp.setStatus(account.getStatus() != null ? account.getStatus().name() : "ACTIVE");
        return resp;
    }
}



