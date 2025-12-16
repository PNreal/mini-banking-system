package com.minibank.accountservice.service;

import com.minibank.accountservice.dto.CreateAccountRequest;
import com.minibank.accountservice.dto.TransferRequest;
import com.minibank.accountservice.dto.UpdateBalanceRequest;
import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.entity.AccountStatus;
import com.minibank.accountservice.exception.BadRequestException;
import com.minibank.accountservice.exception.NotFoundException;
import com.minibank.accountservice.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${account.kafka.account-event-topic:ACCOUNT_EVENT}")
    private String accountEventTopic;

    @Transactional
    public Account createAccount(CreateAccountRequest request) {
        Optional<Account> existing = accountRepository.findByUserId(request.getUserId());
        if (existing.isPresent()) {
            throw new BadRequestException("Account for user already exists");
        }
        Account account = new Account();
        account.setUserId(request.getUserId());
        account.setBalance(defaultIfNull(request.getInitialBalance()));
        account.setStatus(AccountStatus.ACTIVE);
        Account saved = accountRepository.save(account);
        publishEvent("ACCOUNT_CREATED", saved.getId(), saved.getUserId());
        return saved;
    }

    @Transactional(readOnly = true)
    public Account getByUserId(UUID userId) {
        return accountRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Account not found for user"));
    }

    @Transactional(readOnly = true)
    public Account getById(UUID accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
    }

    @Transactional
    public Account updateBalance(UUID accountId, UpdateBalanceRequest request) {
        Account account = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        ensureActive(account);
        BigDecimal amount = request.getAmount();
        if (request.getOperation() == UpdateBalanceRequest.Operation.DEPOSIT) {
            account.setBalance(account.getBalance().add(amount));
        } else {
            if (account.getBalance().compareTo(amount) < 0) {
                throw new BadRequestException("Insufficient balance");
            }
            account.setBalance(account.getBalance().subtract(amount));
        }
        return accountRepository.save(account);
    }

    @Transactional
    public void transfer(TransferRequest request) {
        if (request.getFromAccountId().equals(request.getToAccountId())) {
            throw new BadRequestException("Cannot transfer to the same account");
        }
        UUID first = request.getFromAccountId();
        UUID second = request.getToAccountId();
        // lock in deterministic order to avoid deadlock
        boolean swap = first.compareTo(second) > 0;
        UUID firstLock = swap ? second : first;
        UUID secondLock = swap ? first : second;

        Account firstAccount = accountRepository.findWithLockingById(firstLock)
                .orElseThrow(() -> new NotFoundException("Account not found: " + firstLock));
        Account secondAccount = accountRepository.findWithLockingById(secondLock)
                .orElseThrow(() -> new NotFoundException("Account not found: " + secondLock));

        Account from = swap ? secondAccount : firstAccount;
        Account to = swap ? firstAccount : secondAccount;

        ensureActive(from);
        ensureActive(to);

        BigDecimal amount = request.getAmount();
        if (from.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient balance");
        }

        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));

        accountRepository.save(from);
        accountRepository.save(to);
    }

    @Transactional
    public void freeze(UUID accountId) {
        Account account = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        if (account.getStatus() == AccountStatus.LOCKED) {
            throw new BadRequestException("Account is locked");
        }
        if (account.getStatus() == AccountStatus.FROZEN) {
            return;
        }
        account.setStatus(AccountStatus.FROZEN);
        accountRepository.save(account);
        publishEvent("ACCOUNT_FROZEN", account.getId(), account.getUserId());
    }

    @Transactional
    public void unfreeze(UUID accountId) {
        Account account = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        if (account.getStatus() == AccountStatus.LOCKED) {
            throw new BadRequestException("Account is locked");
        }
        if (account.getStatus() == AccountStatus.FROZEN) {
            account.setStatus(AccountStatus.ACTIVE);
            accountRepository.save(account);
            publishEvent("ACCOUNT_UNFROZEN", account.getId(), account.getUserId());
        }
    }

    @Transactional
    public void lock(UUID accountId) {
        Account account = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        if (account.getStatus() == AccountStatus.LOCKED) {
            return;
        }
        account.setStatus(AccountStatus.LOCKED);
        accountRepository.save(account);
        publishEvent("ACCOUNT_LOCKED", account.getId(), account.getUserId());
    }

    @Transactional
    public void unlock(UUID accountId) {
        Account account = accountRepository.findWithLockingById(accountId)
                .orElseThrow(() -> new NotFoundException("Account not found"));
        if (account.getStatus() == AccountStatus.LOCKED) {
            account.setStatus(AccountStatus.ACTIVE);
            accountRepository.save(account);
            publishEvent("ACCOUNT_UNLOCKED", account.getId(), account.getUserId());
        }
    }

    private void ensureActive(Account account) {
        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private void publishEvent(String action, UUID accountId, UUID userId) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = Map.of(
                        "action", action,
                        "accountId", String.valueOf(accountId),
                        "userId", String.valueOf(userId),
                        "timestamp", OffsetDateTime.now().toString()
                );
                kafkaTemplate.send(accountEventTopic, accountId.toString(), payload);
            }
        } catch (Exception e) {
            log.warn("Failed to publish kafka event {} for account {}", action, accountId, e);
        }
    }
}

