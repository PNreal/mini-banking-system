package com.minibank.transactionservice.service;

import com.minibank.transactionservice.dto.*;
import com.minibank.transactionservice.entity.Transaction;
import com.minibank.transactionservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountServiceClient accountServiceClient;
    private final KafkaProducerService kafkaProducerService;

    @Transactional
    public TransactionResponse deposit(UUID userId, DepositRequest request) {
        log.info("Processing deposit for user: {}, amount: {}", userId, request.getAmount());

        AccountResponse account = accountServiceClient.getAccountByUserId(userId);
        if (account == null) {
            throw new RuntimeException("Account not found for user: " + userId);
        }

        if (!"ACTIVE".equals(account.getStatus())) {
            throw new RuntimeException("Account is not active. Current status: " + account.getStatus());
        }

        AccountResponse updatedAccount = accountServiceClient.updateBalance(account.getAccountId(), request.getAmount());

        Transaction transaction = Transaction.builder()
                .fromAcc(null)
                .toAcc(account.getAccountId())
                .amount(request.getAmount())
                .type("DEPOSIT")
                .timestamp(LocalDateTime.now())
                .status("SUCCESS")
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        kafkaProducerService.sendTransactionCompletedEvent(
                savedTransaction.getTransId(),
                null,
                account.getAccountId(),
                "DEPOSIT",
                request.getAmount(),
                "SUCCESS"
        );

        return TransactionResponse.builder()
                .transactionId(savedTransaction.getTransId())
                .type("DEPOSIT")
                .amount(request.getAmount())
                .toAccountId(account.getAccountId())
                .status("SUCCESS")
                .timestamp(savedTransaction.getTimestamp())
                .newBalance(updatedAccount.getBalance())
                .build();
    }

    @Transactional
    public TransactionResponse withdraw(UUID userId, WithdrawRequest request) {
        log.info("Processing withdraw for user: {}, amount: {}", userId, request.getAmount());

        AccountResponse account = accountServiceClient.getAccountByUserId(userId);
        if (account == null) {
            throw new RuntimeException("Account not found for user: " + userId);
        }

        if (!"ACTIVE".equals(account.getStatus())) {
            throw new RuntimeException("Account is not active. Current status: " + account.getStatus());
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        AccountResponse updatedAccount = accountServiceClient.updateBalance(
                account.getAccountId(), request.getAmount().negate());

        Transaction transaction = Transaction.builder()
                .fromAcc(account.getAccountId())
                .toAcc(null)
                .amount(request.getAmount())
                .type("WITHDRAW")
                .timestamp(LocalDateTime.now())
                .status("SUCCESS")
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        kafkaProducerService.sendTransactionCompletedEvent(
                savedTransaction.getTransId(),
                account.getAccountId(),
                null,
                "WITHDRAW",
                request.getAmount(),
                "SUCCESS"
        );

        return TransactionResponse.builder()
                .transactionId(savedTransaction.getTransId())
                .type("WITHDRAW")
                .amount(request.getAmount())
                .fromAccountId(account.getAccountId())
                .status("SUCCESS")
                .timestamp(savedTransaction.getTimestamp())
                .newBalance(updatedAccount.getBalance())
                .build();
    }

    @Transactional
    public TransactionResponse transfer(UUID userId, TransferRequest request) {
        log.info("Processing transfer from user: {} to account: {}, amount: {}", 
                userId, request.getToAccountId(), request.getAmount());

        AccountResponse fromAccount = accountServiceClient.getAccountByUserId(userId);
        if (fromAccount == null) {
            throw new RuntimeException("Sender account not found for user: " + userId);
        }

        if (!"ACTIVE".equals(fromAccount.getStatus())) {
            throw new RuntimeException("Sender account is not active. Current status: " + fromAccount.getStatus());
        }

        AccountResponse toAccount = accountServiceClient.getAccount(request.getToAccountId());
        if (toAccount == null) {
            throw new RuntimeException("Receiver account not found: " + request.getToAccountId());
        }

        if (!"ACTIVE".equals(toAccount.getStatus()) && !"FROZEN".equals(toAccount.getStatus())) {
            throw new RuntimeException("Receiver account status is invalid: " + toAccount.getStatus());
        }

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        AccountResponse updatedFromAccount = accountServiceClient.transfer(
                fromAccount.getAccountId(),
                request.getToAccountId(),
                request.getAmount()
        );

        Transaction transaction = Transaction.builder()
                .fromAcc(fromAccount.getAccountId())
                .toAcc(request.getToAccountId())
                .amount(request.getAmount())
                .type("TRANSFER")
                .timestamp(LocalDateTime.now())
                .status("SUCCESS")
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        kafkaProducerService.sendTransactionCompletedEvent(
                savedTransaction.getTransId(),
                fromAccount.getAccountId(),
                request.getToAccountId(),
                "TRANSFER",
                request.getAmount(),
                "SUCCESS"
        );

        return TransactionResponse.builder()
                .transactionId(savedTransaction.getTransId())
                .type("TRANSFER")
                .amount(request.getAmount())
                .fromAccountId(fromAccount.getAccountId())
                .toAccountId(request.getToAccountId())
                .status("SUCCESS")
                .timestamp(savedTransaction.getTimestamp())
                .newBalance(updatedFromAccount.getBalance())
                .build();
    }

    public Page<TransactionResponse> getTransactionHistory(UUID userId, String type, 
                                                           LocalDateTime from, LocalDateTime to, 
                                                           Pageable pageable) {
        log.info("Fetching transaction history for user: {}, type: {}, from: {}, to: {}", 
                userId, type, from, to);

        AccountResponse account = accountServiceClient.getAccountByUserId(userId);
        if (account == null) {
            throw new RuntimeException("Account not found for user: " + userId);
        }

        UUID accountId = account.getAccountId();
        Page<Transaction> transactions;

        if (type != null && from != null && to != null) {
            transactions = transactionRepository.findByAccountIdAndTypeAndTimestampBetween(
                    accountId, type, from, to, pageable);
        } else if (type != null) {
            transactions = transactionRepository.findByAccountIdAndTypeOrderByTimestampDesc(
                    accountId, type, pageable);
        } else if (from != null && to != null) {
            transactions = transactionRepository.findByAccountIdAndTimestampBetween(
                    accountId, from, to, pageable);
        } else {
            transactions = transactionRepository.findByAccountIdOrderByTimestampDesc(accountId, pageable);
        }

        return transactions.map(this::mapToResponse);
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .transactionId(transaction.getTransId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .fromAccountId(transaction.getFromAcc())
                .toAccountId(transaction.getToAcc())
                .status(transaction.getStatus())
                .timestamp(transaction.getTimestamp())
                .build();
    }
}

