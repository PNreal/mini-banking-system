package com.minibank.accountservice.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${account.kafka.account-event-topic:ACCOUNT_EVENT}")
    private String accountEventTopic;

    private static final SecureRandom RNG = new SecureRandom();

    @Transactional
    public Account createAccount(CreateAccountRequest request) {
        Optional<Account> existing = accountRepository.findByUserId(request.getUserId());
        if (existing.isPresent()) {
            throw new BadRequestException("Account for user already exists");
        }
        Account account = new Account();
        account.setUserId(request.getUserId());
        account.setAccountNumber(generateUniqueAccountNumber());
        account.setBalance(defaultIfNull(request.getInitialBalance()));
        account.setStatus(AccountStatus.ACTIVE);
        Account saved = accountRepository.save(account);
        publishEvent("ACCOUNT_CREATED", saved.getId(), saved.getUserId());
        return saved;
    }

    /**
     * Backfill accountNumber for existing rows (when the column is newly added).
     * Safe to run on every startup; only updates rows where accountNumber is null/blank.
     */
    @Transactional
    public int backfillMissingAccountNumbers() {
        List<Account> all = accountRepository.findAll();
        int updated = 0;
        for (Account a : all) {
            if (a.getAccountNumber() == null || a.getAccountNumber().isBlank()) {
                a.setAccountNumber(generateUniqueAccountNumber());
                updated++;
            }
        }
        if (updated > 0) {
            accountRepository.saveAll(all);
        }
        return updated;
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

    @Transactional(readOnly = true)
    public Account getByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new NotFoundException("Account not found with account number: " + accountNumber));
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

    /**
     * Kích hoạt tài khoản sau khi KYC được approve
     * Nếu user chưa có account thì tạo mới, nếu có rồi thì đảm bảo status ACTIVE
     */
    @Transactional
    public Account activateAfterKyc(UUID userId) {
        Optional<Account> existing = accountRepository.findByUserId(userId);
        
        if (existing.isPresent()) {
            Account account = existing.get();
            // Nếu account đang PENDING hoặc FROZEN thì activate
            if (account.getStatus() != AccountStatus.ACTIVE) {
                account.setStatus(AccountStatus.ACTIVE);
                accountRepository.save(account);
                publishEvent("ACCOUNT_KYC_ACTIVATED", account.getId(), userId);
            }
            return account;
        } else {
            // Tạo account mới với status ACTIVE
            Account account = new Account();
            account.setUserId(userId);
            account.setAccountNumber(generateUniqueAccountNumber());
            account.setBalance(BigDecimal.ZERO);
            account.setStatus(AccountStatus.ACTIVE);
            Account saved = accountRepository.save(account);
            publishEvent("ACCOUNT_CREATED_KYC", saved.getId(), userId);
            log.info("Account created after KYC approval for user {}: {}", userId, saved.getAccountNumber());
            return saved;
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

    private String generateUniqueAccountNumber() {
        // 12-digit numeric string (like STK), retry on collision
        // Sử dụng synchronized để tránh race condition khi nhiều request đồng thời
        synchronized (this) {
            for (int i = 0; i < 100; i++) {
                long n = Math.abs(RNG.nextLong()) % 1_000_000_000_000L; // 0..999,999,999,999
                String candidate = String.format("%012d", n);
                if (!accountRepository.existsByAccountNumber(candidate)) {
                    log.debug("Generated unique account number: {} after {} attempts", candidate, i + 1);
                    return candidate;
                }
                log.debug("Account number {} already exists, retrying...", candidate);
            }
        }
        // Nếu sau 100 lần vẫn không tạo được, throw exception thay vì dùng UUID
        throw new RuntimeException("Unable to generate unique account number after 100 attempts");
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
                String jsonPayload = objectMapper.writeValueAsString(payload);
                kafkaTemplate.send(accountEventTopic, accountId.toString(), jsonPayload);
            }
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize kafka event {} for account {}", action, accountId, e);
        } catch (Exception e) {
            log.warn("Failed to publish kafka event {} for account {}", action, accountId, e);
        }
    }
}

