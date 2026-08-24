package com.minibank.accountservice.config;

import com.minibank.accountservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountNumberBackfillRunner implements ApplicationRunner {

    private final AccountService accountService;

    @Override
    public void run(ApplicationArguments args) {
        try {
            int updated = accountService.backfillMissingAccountNumbers();
            if (updated > 0) {
                log.info("Backfilled accountNumber for {} accounts", updated);
            }
        } catch (Exception e) {
            // Don't fail service startup if backfill fails; logs are enough
            log.warn("Failed to backfill accountNumber: {}", e.getMessage());
        }
    }
}


