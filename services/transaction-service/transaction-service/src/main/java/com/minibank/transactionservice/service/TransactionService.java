package com.minibank.transactionservice.service;

import com.minibank.transactionservice.client.AccountServiceClient;
import com.minibank.transactionservice.dto.AccountResponse;
import com.minibank.transactionservice.dto.AccountTransferRequest;
import com.minibank.transactionservice.dto.PagedResponse;
import com.minibank.transactionservice.dto.TransactionResponse;
import com.minibank.transactionservice.dto.UpdateBalanceRequest;
import com.minibank.transactionservice.entity.Transaction;
import com.minibank.transactionservice.entity.TransactionStatus;
import com.minibank.transactionservice.entity.TransactionType;
import com.minibank.transactionservice.exception.BadRequestException;
import com.minibank.transactionservice.exception.NotFoundException;
import com.minibank.transactionservice.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final AccountServiceClient accountServiceClient;
    private final TransactionRepository transactionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${transaction.kafka.completed-topic:TRANSACTION_COMPLETED}")
    private String completedTopic;

    @Transactional
    public TransactionResponse deposit(BigDecimal amount, UUID userId) {
        validateAmount(amount);
        UUID accountId = resolveAccountId(userId);

        AccountResponse account = accountServiceClient.updateBalance(
                accountId,
                new UpdateBalanceRequest(UpdateBalanceRequest.Operation.DEPOSIT, amount)
        );

        Transaction tx = buildTransaction(null, accountId, amount, TransactionType.DEPOSIT, TransactionStatus.SUCCESS);
        Transaction saved = transactionRepository.save(tx);
        publishCompletedEvent(saved, userId);

        BigDecimal newBalance = account != null ? account.getBalance() : null;
        return TransactionResponse.from(saved).withBalance(newBalance);
    }

    @Transactional
    public TransactionResponse withdraw(BigDecimal amount, UUID userId) {
        validateAmount(amount);
        UUID accountId = resolveAccountId(userId);

        AccountResponse account = accountServiceClient.updateBalance(
                accountId,
                new UpdateBalanceRequest(UpdateBalanceRequest.Operation.WITHDRAW, amount)
        );

        Transaction tx = buildTransaction(accountId, null, amount, TransactionType.WITHDRAW, TransactionStatus.SUCCESS);
        Transaction saved = transactionRepository.save(tx);
        publishCompletedEvent(saved, userId);

        BigDecimal newBalance = account != null ? account.getBalance() : null;
        return TransactionResponse.from(saved).withBalance(newBalance);
    }

    @Transactional
    public TransactionResponse transfer(BigDecimal amount, UUID userId, UUID toAccountId) {
        validateAmount(amount);
        UUID fromAccountId = resolveAccountId(userId);

        if (fromAccountId.equals(toAccountId)) {
            throw new BadRequestException("Cannot transfer to the same account");
        }

        accountServiceClient.transfer(new AccountTransferRequest(fromAccountId, toAccountId, amount));

        Transaction tx = buildTransaction(fromAccountId, toAccountId, amount, TransactionType.TRANSFER, TransactionStatus.SUCCESS);
        Transaction saved = transactionRepository.save(tx);
        publishCompletedEvent(saved, userId);

        AccountResponse account = accountServiceClient.getAccount(fromAccountId);
        BigDecimal newBalance = account != null ? account.getBalance() : null;
        return TransactionResponse.from(saved).withBalance(newBalance);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> history(UUID userId,
                                                      TransactionType type,
                                                      OffsetDateTime from,
                                                      OffsetDateTime to,
                                                      int page,
                                                      int size) {
        UUID accountId = resolveAccountId(userId);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
        Page<Transaction> txPage = transactionRepository.searchByAccount(accountId, type, from, to, pageable);

        return PagedResponse.<TransactionResponse>builder()
                .page(txPage.getNumber())
                .size(txPage.getSize())
                .total(txPage.getTotalElements())
                .items(txPage.map(TransactionResponse::from).getContent())
                .build();
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID userId, UUID transactionId) {
        UUID accountId = resolveAccountId(userId);

        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (!accountId.equals(tx.getFromAccountId()) && !accountId.equals(tx.getToAccountId())) {
            throw new NotFoundException("Transaction not found for this user");
        }

        return TransactionResponse.from(tx);
    }

    private UUID resolveAccountId(UUID userId) {
        if (userId == null) {
            throw new BadRequestException("X-User-Id header is required");
        }
        AccountResponse account = accountServiceClient.getAccountByUser(userId);
        if (account == null || account.getAccountId() == null) {
            throw new BadRequestException("Account not found for user");
        }
        return account.getAccountId();
    }

    private void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than 0");
        }
    }

    private Transaction buildTransaction(UUID from, UUID to, BigDecimal amount, TransactionType type, TransactionStatus status) {
        Transaction tx = new Transaction();
        tx.setFromAccountId(from);
        tx.setToAccountId(to);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setStatus(status);
        tx.setTimestamp(OffsetDateTime.now());
        return tx;
    }

    private void publishCompletedEvent(Transaction tx, UUID userId) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = Map.of(
                        "transactionId", String.valueOf(tx.getId()),
                        "fromAccount", tx.getFromAccountId() != null ? String.valueOf(tx.getFromAccountId()) : null,
                        "toAccount", tx.getToAccountId() != null ? String.valueOf(tx.getToAccountId()) : null,
                        "amount", tx.getAmount(),
                        "type", tx.getType().name(),
                        "timestamp", tx.getTimestamp().toString(),
                        "status", tx.getStatus().name(),
                        "userId", userId != null ? String.valueOf(userId) : null
                );
                kafkaTemplate.send(completedTopic, tx.getId().toString(), payload);
            }
        } catch (Exception ex) {
            log.warn("Failed to publish transaction completed event for {}", tx.getId(), ex);
        }
    }
}


