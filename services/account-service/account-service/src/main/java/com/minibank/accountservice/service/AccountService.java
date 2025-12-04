package com.minibank.accountservice.service;

import com.minibank.accountservice.dto.AccountRequest;
import com.minibank.accountservice.dto.AccountResponse;
import com.minibank.accountservice.dto.BalanceUpdateRequest;
import com.minibank.accountservice.entity.Account;
import com.minibank.accountservice.exception.AccountNotFoundException;
import com.minibank.accountservice.exception.AccountOperationException;
import com.minibank.accountservice.exception.InsufficientBalanceException;
import com.minibank.accountservice.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {
    
    private final AccountRepository accountRepository;
    private static final int MAX_ACCOUNTS_PER_USER = 10;
    
    @Transactional
    public AccountResponse createAccount(AccountRequest request) {
        log.info("Creating account for user: {}", request.getUserId());
        
        // Check account limit
        long accountCount = accountRepository.countByUserId(request.getUserId());
        if (accountCount >= MAX_ACCOUNTS_PER_USER) {
            throw new AccountOperationException(
                String.format("User has reached maximum account limit of %d", MAX_ACCOUNTS_PER_USER));
        }
        
        // Generate unique account number
        String accountNumber = generateAccountNumber();
        while (accountRepository.existsByAccountNumber(accountNumber)) {
            accountNumber = generateAccountNumber();
        }
        
        Account account = Account.builder()
                .userId(request.getUserId())
                .accountNumber(accountNumber)
                .accountType(request.getAccountType())
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .status(Account.AccountStatus.ACTIVE)
                .isLocked(false)
                .isFrozen(false)
                .build();
        
        Account savedAccount = accountRepository.save(account);
        log.info("Account created successfully: {}", savedAccount.getAccountId());
        
        return AccountResponse.fromEntity(savedAccount);
    }
    
    public AccountResponse getAccountById(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", accountId)));
        
        return AccountResponse.fromEntity(account);
    }
    
    public AccountResponse getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with number: %s", accountNumber)));
        
        return AccountResponse.fromEntity(account);
    }
    
    public List<AccountResponse> getAccountsByUserId(UUID userId) {
        List<Account> accounts = accountRepository.findByUserId(userId);
        return accounts.stream()
                .map(AccountResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    public List<AccountResponse> getActiveAccountsByUserId(UUID userId) {
        List<Account> accounts = accountRepository.findActiveAccountsByUserId(userId);
        return accounts.stream()
                .map(AccountResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AccountResponse updateBalance(BalanceUpdateRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", request.getAccountId())));
        
        validateAccountOperation(account);
        
        BigDecimal newBalance;
        switch (request.getTransactionType()) {
            case DEPOSIT:
                newBalance = account.getBalance().add(request.getAmount());
                break;
            case WITHDRAWAL:
            case TRANSFER:
                if (account.getBalance().compareTo(request.getAmount()) < 0) {
                    throw new InsufficientBalanceException(
                        String.format("Insufficient balance. Current: %s, Required: %s",
                            account.getBalance(), request.getAmount()));
                }
                newBalance = account.getBalance().subtract(request.getAmount());
                break;
            default:
                throw new AccountOperationException("Invalid transaction type");
        }
        
        account.setBalance(newBalance);
        Account updatedAccount = accountRepository.save(account);
        log.info("Balance updated for account {}: {}", account.getAccountId(), newBalance);
        
        return AccountResponse.fromEntity(updatedAccount);
    }
    
    @Transactional
    public AccountResponse lockAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", accountId)));
        
        account.setIsLocked(true);
        Account updatedAccount = accountRepository.save(account);
        log.info("Account locked: {}", accountId);
        
        return AccountResponse.fromEntity(updatedAccount);
    }
    
    @Transactional
    public AccountResponse unlockAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", accountId)));
        
        account.setIsLocked(false);
        Account updatedAccount = accountRepository.save(account);
        log.info("Account unlocked: {}", accountId);
        
        return AccountResponse.fromEntity(updatedAccount);
    }
    
    @Transactional
    public AccountResponse freezeAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", accountId)));
        
        account.setIsFrozen(true);
        Account updatedAccount = accountRepository.save(account);
        log.info("Account frozen: {}", accountId);
        
        return AccountResponse.fromEntity(updatedAccount);
    }
    
    @Transactional
    public AccountResponse unfreezeAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", accountId)));
        
        account.setIsFrozen(false);
        Account updatedAccount = accountRepository.save(account);
        log.info("Account unfrozen: {}", accountId);
        
        return AccountResponse.fromEntity(updatedAccount);
    }
    
    @Transactional
    public AccountResponse closeAccount(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(
                    String.format("Account not found with ID: %s", accountId)));
        
        if (account.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new AccountOperationException(
                "Cannot close account with non-zero balance. Current balance: " + account.getBalance());
        }
        
        account.setStatus(Account.AccountStatus.CLOSED);
        Account updatedAccount = accountRepository.save(account);
        log.info("Account closed: {}", accountId);
        
        return AccountResponse.fromEntity(updatedAccount);
    }
    
    private void validateAccountOperation(Account account) {
        if (account.getIsLocked()) {
            throw new AccountOperationException("Account is locked");
        }
        if (account.getIsFrozen()) {
            throw new AccountOperationException("Account is frozen");
        }
        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new AccountOperationException("Account is not active. Status: " + account.getStatus());
        }
    }
    
    private String generateAccountNumber() {
        // Generate 16-digit account number: YYYYMMDD + 8 random digits
        String prefix = String.valueOf(System.currentTimeMillis()).substring(0, 8);
        String suffix = String.valueOf((int)(Math.random() * 100000000));
        return prefix + String.format("%08d", Integer.parseInt(suffix));
    }
}

