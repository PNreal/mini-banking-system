package com.minibank.transactionservice.service;

import com.minibank.transactionservice.dto.AccountResponse;
import com.minibank.transactionservice.dto.DepositRequest;
import com.minibank.transactionservice.dto.TransactionResponse;
import com.minibank.transactionservice.entity.Transaction;
import com.minibank.transactionservice.exception.TransactionException;
import com.minibank.transactionservice.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountServiceClient accountServiceClient;

    @Mock
    private KafkaProducerService kafkaProducerService;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void deposit_whenAccountActive_shouldCreateTransactionAndPublishEvent() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.valueOf(100_000);

        DepositRequest request = new DepositRequest(amount);
        AccountResponse account = new AccountResponse(accountId, userId, BigDecimal.valueOf(500_000), "ACTIVE");
        AccountResponse updatedAccount = new AccountResponse(accountId, userId, BigDecimal.valueOf(600_000), "ACTIVE");

        when(accountServiceClient.getAccountByUserId(userId)).thenReturn(account);
        when(accountServiceClient.updateBalance(accountId, amount)).thenReturn(updatedAccount);

        ArgumentCaptor<Transaction> transactionCaptor = ArgumentCaptor.forClass(Transaction.class);
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setTransId(UUID.randomUUID());
            if (t.getTimestamp() == null) {
                t.setTimestamp(LocalDateTime.now());
            }
            return t;
        });

        TransactionResponse response = transactionService.deposit(userId, request);

        verify(transactionRepository).save(transactionCaptor.capture());
        Transaction saved = transactionCaptor.getValue();

        assertThat(saved.getType()).isEqualTo("DEPOSIT");
        assertThat(saved.getAmount()).isEqualByComparingTo(amount);
        assertThat(saved.getToAcc()).isEqualTo(accountId);

        assertThat(response.getTransactionId()).isNotNull();
        assertThat(response.getType()).isEqualTo("DEPOSIT");
        assertThat(response.getAmount()).isEqualByComparingTo(amount);
        assertThat(response.getToAccountId()).isEqualTo(accountId);
        assertThat(response.getNewBalance()).isEqualByComparingTo(BigDecimal.valueOf(600_000));

        verify(kafkaProducerService).sendTransactionCompletedEvent(
                response.getTransactionId(),
                null,
                accountId,
                "DEPOSIT",
                amount,
                "SUCCESS"
        );
    }

    @Test
    void deposit_whenAccountNotFound_shouldThrowTransactionException() {
        UUID userId = UUID.randomUUID();
        DepositRequest request = new DepositRequest(BigDecimal.valueOf(100_000));

        when(accountServiceClient.getAccountByUserId(userId)).thenReturn(null);

        assertThatThrownBy(() -> transactionService.deposit(userId, request))
                .isInstanceOf(TransactionException.class)
                .hasMessageContaining("Account does not exist")
                .extracting("errorCode")
                .isEqualTo("ACCOUNT_NOT_FOUND");
    }
}


