package com.minibank.transactionservice.service;

import com.minibank.transactionservice.client.AccountServiceClient;
import com.minibank.transactionservice.client.UserServiceClient;
import com.minibank.transactionservice.service.CounterService;
import com.minibank.transactionservice.dto.AccountResponse;
import com.minibank.transactionservice.dto.AccountTransferRequest;
import com.minibank.transactionservice.dto.PagedResponse;
import com.minibank.transactionservice.dto.RecentCustomerResponse;
import com.minibank.transactionservice.dto.StaffDashboardResponse;
import com.minibank.transactionservice.dto.StaffPendingTransactionResponse;
import com.minibank.transactionservice.dto.StaffStatsResponse;
import com.minibank.transactionservice.dto.TransactionResponse;
import com.minibank.transactionservice.dto.UpdateBalanceRequest;
import com.minibank.transactionservice.dto.UserResponse;
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

import java.math.BigInteger;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final AccountServiceClient accountServiceClient;
    private final UserServiceClient userServiceClient;
    private final CounterService counterService;
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
    public TransactionResponse depositAtCounter(BigDecimal amount, UUID userId, UUID counterId) {
        validateAmount(amount);
        UUID accountId = resolveAccountId(userId);

        // Lấy thông tin user để lấy CCCD
        UserResponse user = userServiceClient.getUser(userId);
        if (user == null) {
            throw new BadRequestException("User not found");
        }

        // Tự động phân bổ nhân viên từ quầy
        UUID staffId = counterService.assignStaffFromCounter(counterId);
        
        // Lấy employeeCode của nhân viên được phân bổ
        String employeeCode = counterService.getEmployeeCodeFromUserId(staffId);

        // Tạo mã giao dịch: mã nhân viên + 4 số cuối CCCD + ngày/tháng/năm
        String transactionCode = generateTransactionCode(employeeCode, user.getCitizenId());

        // Tạo transaction với status PENDING (chờ nhân viên xác nhận)
        Transaction tx = buildTransaction(null, accountId, amount, TransactionType.COUNTER_DEPOSIT, TransactionStatus.PENDING);
        tx.setTransactionCode(transactionCode);
        tx.setCounterId(counterId);
        tx.setStaffId(staffId);
        Transaction saved = transactionRepository.save(tx);

        // Gửi thông báo đến nhân viên dựa vào mã giao dịch
        publishCounterDepositNotification(saved, userId, employeeCode, transactionCode);

        return TransactionResponse.from(saved);
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

    @Transactional(readOnly = true)
    public List<RecentCustomerResponse> getRecentCustomersForStaff(UUID staffId, int limit) {
        if (staffId == null) {
            throw new BadRequestException("X-User-Id header is required");
        }
        int safeLimit = Math.max(1, Math.min(limit, 20));

        List<Transaction> recent = transactionRepository.findRecentCounterDepositsByStaffId(
                staffId,
                PageRequest.of(0, safeLimit)
        );

        // Deduplicate by account (customer) but keep order by timestamp desc
        Set<UUID> seenAccountIds = new HashSet<>();
        List<RecentCustomerResponse> result = new ArrayList<>();

        for (Transaction tx : recent) {
            UUID accountId = tx.getToAccountId();
            if (accountId == null || !seenAccountIds.add(accountId)) {
                continue;
            }

            AccountResponse account = null;
            UserResponse user = null;
            try {
                account = accountServiceClient.getAccount(accountId);
                if (account != null && account.getUserId() != null) {
                    user = userServiceClient.getUser(account.getUserId());
                }
            } catch (Exception ex) {
                // If downstream internal calls fail for one record, skip it to avoid breaking dashboard UX
                log.warn("Failed to resolve recent customer info for account {}: {}", accountId, ex.getMessage());
                continue;
            }

            String customerName = (user != null && user.getFullName() != null && !user.getFullName().isBlank())
                    ? user.getFullName()
                    : "Khách hàng";

            result.add(RecentCustomerResponse.builder()
                    .id(tx.getId() != null ? tx.getId().toString() : accountId.toString())
                    .name(customerName)
                    .accountNumber(formatPseudoAccountNumber(accountId))
                    .product("Tài khoản thanh toán")
                    .lastAction(buildLastActionLabel(tx))
                    .lastActionAt(tx.getTimestamp())
                    .build());

            if (result.size() >= safeLimit) {
                break;
            }
        }

        return result;
    }

    @Transactional(readOnly = true)
    public StaffDashboardResponse getStaffDashboard(UUID staffId, int pendingLimit, int recentCustomersLimit) {
        if (staffId == null) {
            throw new BadRequestException("X-User-Id header is required");
        }

        int safePendingLimit = Math.max(1, Math.min(pendingLimit, 50));
        int safeRecentLimit = Math.max(1, Math.min(recentCustomersLimit, 20));

        OffsetDateTime from = LocalDate.now(ZoneOffset.UTC).atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime to = from.plusDays(1);

        long todayTransactions = transactionRepository.countSuccessfulCounterDepositsByStaffIdBetween(staffId, from, to);
        BigDecimal todayAmount = transactionRepository.sumSuccessfulCounterDepositsAmountByStaffIdBetween(staffId, from, to);
        long pendingApprovalsCount = transactionRepository.countPendingCounterDepositsByStaffId(staffId);
        long customersServed = transactionRepository.countDistinctCustomersServedByStaffIdBetween(staffId, from, to);

        StaffStatsResponse stats = StaffStatsResponse.builder()
                .todayTransactions(todayTransactions)
                .todayAmount(todayAmount != null ? todayAmount : BigDecimal.ZERO)
                .pendingApprovals(pendingApprovalsCount)
                .customersServed(customersServed)
                .build();

        List<Transaction> pending = transactionRepository.findPendingCounterDepositsByStaffId(
                staffId,
                PageRequest.of(0, safePendingLimit)
        );

        List<StaffPendingTransactionResponse> pendingResponses = new ArrayList<>();
        for (Transaction tx : pending) {
            UUID accountId = tx.getToAccountId();
            AccountResponse account = null;
            UserResponse user = null;
            try {
                if (accountId != null) {
                    account = accountServiceClient.getAccount(accountId);
                    if (account != null && account.getUserId() != null) {
                        user = userServiceClient.getUser(account.getUserId());
                    }
                }
            } catch (Exception ex) {
                log.warn("Failed to resolve pending customer info for account {}: {}", accountId, ex.getMessage());
            }

            String customerName = (user != null && user.getFullName() != null && !user.getFullName().isBlank())
                    ? user.getFullName()
                    : "Khách hàng";

            String accountNumber = (account != null && account.getAccountNumber() != null && !account.getAccountNumber().isBlank())
                    ? account.getAccountNumber()
                    : formatPseudoAccountNumber(accountId);

            pendingResponses.add(StaffPendingTransactionResponse.builder()
                    .transactionId(tx.getId())
                    .type(tx.getType() != null ? tx.getType().name() : null)
                    .status(tx.getStatus() != null ? tx.getStatus().name() : null)
                    .customerName(customerName)
                    .accountNumber(accountNumber)
                    .amount(tx.getAmount())
                    .createdAt(tx.getTimestamp())
                    .transactionCode(tx.getTransactionCode())
                    .build());
        }

        List<RecentCustomerResponse> recentCustomers = getRecentCustomersForStaff(staffId, safeRecentLimit);

        return StaffDashboardResponse.builder()
                .stats(stats)
                .pendingApprovals(pendingResponses)
                .kycRequestsCount(0)
                .recentCustomers(recentCustomers)
                .build();
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

    /**
     * Hệ thống hiện chưa có trường "accountNumber" riêng trong DB.
     * Tạo "STK" dạng số (12 chữ số) ổn định theo UUID accountId để UI hiển thị.
     */
    private String formatPseudoAccountNumber(UUID accountId) {
        if (accountId == null) {
            return "N/A";
        }
        BigInteger bi = BigInteger.valueOf(accountId.getMostSignificantBits())
                .shiftLeft(64)
                .add(BigInteger.valueOf(accountId.getLeastSignificantBits()))
                .abs();
        BigInteger mod = bi.mod(BigInteger.TEN.pow(12));
        String raw = mod.toString();
        return "0".repeat(Math.max(0, 12 - raw.length())) + raw;
    }

    private String buildLastActionLabel(Transaction tx) {
        if (tx == null) return "-";
        BigDecimal amount = tx.getAmount() != null ? tx.getAmount() : BigDecimal.ZERO;
        String amountStr = amount.toBigInteger().toString();
        return switch (tx.getType()) {
            case COUNTER_DEPOSIT -> "Nạp tiền " + amountStr + "đ";
            case DEPOSIT -> "Nạp tiền " + amountStr + "đ";
            case WITHDRAW -> "Rút tiền " + amountStr + "đ";
            case TRANSFER -> "Chuyển khoản " + amountStr + "đ";
        };
    }

    private String generateTransactionCode(String employeeCode, String citizenId) {
        // Lấy 4 số cuối CCCD
        String lastFourDigits = "";
        if (citizenId != null && citizenId.length() >= 4) {
            lastFourDigits = citizenId.substring(citizenId.length() - 4);
        } else {
            lastFourDigits = "0000"; // Default nếu không có CCCD
        }

        // Lấy ngày/tháng/năm hiện tại (format: DDMMYY)
        LocalDate now = LocalDate.now();
        String dateStr = now.format(DateTimeFormatter.ofPattern("ddMMyy"));

        // Mã giao dịch = mã nhân viên + 4 số cuối CCCD + ngày/tháng/năm
        return (employeeCode != null ? employeeCode : "EMP") + lastFourDigits + dateStr;
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

    /**
     * Nhân viên xác nhận đã nhận tiền ở quầy
     */
    @Transactional
    public TransactionResponse confirmCounterDeposit(UUID transactionId, UUID staffId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (tx.getType() != TransactionType.COUNTER_DEPOSIT) {
            throw new BadRequestException("Transaction is not a counter deposit");
        }

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new BadRequestException("Transaction is not pending");
        }

        if (!tx.getStaffId().equals(staffId)) {
            throw new BadRequestException("Staff ID does not match");
        }

        // Cập nhật số dư tài khoản
        AccountResponse account = accountServiceClient.updateBalance(
                tx.getToAccountId(),
                new UpdateBalanceRequest(UpdateBalanceRequest.Operation.DEPOSIT, tx.getAmount())
        );

        // Cập nhật status thành SUCCESS
        tx.setStatus(TransactionStatus.SUCCESS);
        Transaction saved = transactionRepository.save(tx);

        // Ghi log cho admin
        publishCounterDepositConfirmed(saved, staffId);

        // Gửi thông báo hoàn tất
        publishCompletedEvent(saved, null);

        BigDecimal newBalance = account != null ? account.getBalance() : null;
        return TransactionResponse.from(saved).withBalance(newBalance);
    }

    /**
     * User hủy giao dịch nạp tiền ở quầy (chỉ khi chưa được nhân viên xác nhận)
     */
    @Transactional
    public TransactionResponse cancelCounterDeposit(UUID transactionId, UUID userId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new NotFoundException("Transaction not found"));

        if (tx.getType() != TransactionType.COUNTER_DEPOSIT) {
            throw new BadRequestException("Transaction is not a counter deposit");
        }

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new BadRequestException("Only pending transactions can be cancelled");
        }

        // Kiểm tra user có quyền hủy giao dịch này không (phải là chủ tài khoản nhận tiền)
        UUID accountId = resolveAccountId(userId);
        if (!accountId.equals(tx.getToAccountId())) {
            throw new BadRequestException("You can only cancel your own transactions");
        }

        // Cập nhật status thành CANCELLED
        tx.setStatus(TransactionStatus.CANCELLED);
        Transaction saved = transactionRepository.save(tx);

        // Gửi thông báo đến nhân viên về việc hủy giao dịch
        publishCounterDepositCancelled(saved, userId);

        return TransactionResponse.from(saved);
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
                        "userId", userId != null ? String.valueOf(userId) : null,
                        "transactionCode", tx.getTransactionCode() != null ? tx.getTransactionCode() : ""
                );
                kafkaTemplate.send(completedTopic, tx.getId().toString(), payload);
            }
        } catch (Exception ex) {
            log.warn("Failed to publish transaction completed event for {}", tx.getId(), ex);
        }
    }

    private void publishCounterDepositNotification(Transaction tx, UUID userId, String employeeCode, String transactionCode) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("transactionId", String.valueOf(tx.getId()));
                payload.put("transactionCode", transactionCode);
                payload.put("amount", tx.getAmount());
                payload.put("type", "COUNTER_DEPOSIT");
                payload.put("status", "PENDING");
                payload.put("timestamp", tx.getTimestamp().toString());
                payload.put("userId", userId != null ? String.valueOf(userId) : null);
                payload.put("staffId", tx.getStaffId() != null ? String.valueOf(tx.getStaffId()) : null);
                payload.put("counterId", tx.getCounterId() != null ? String.valueOf(tx.getCounterId()) : null);
                payload.put("employeeCode", employeeCode != null ? employeeCode : "");
                payload.put("notificationType", "COUNTER_DEPOSIT_REQUEST");
                payload.put("message", String.format("Yêu cầu nạp tiền ở quầy với mã giao dịch: %s, số tiền: %s", transactionCode, tx.getAmount()));
                // Gửi đến topic riêng cho thông báo nhân viên
                kafkaTemplate.send("COUNTER_DEPOSIT_NOTIFICATION", transactionCode, payload);
                log.info("Published counter deposit notification for transaction code: {}", transactionCode);
            }
        } catch (Exception ex) {
            log.warn("Failed to publish counter deposit notification for {}", transactionCode, ex);
        }
    }

    private void publishCounterDepositConfirmed(Transaction tx, UUID staffId) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("transactionId", String.valueOf(tx.getId()));
                payload.put("transactionCode", tx.getTransactionCode() != null ? tx.getTransactionCode() : "");
                payload.put("amount", tx.getAmount());
                payload.put("type", "COUNTER_DEPOSIT_CONFIRMED");
                payload.put("status", "SUCCESS");
                payload.put("timestamp", tx.getTimestamp().toString());
                payload.put("staffId", staffId != null ? String.valueOf(staffId) : null);
                payload.put("counterId", tx.getCounterId() != null ? String.valueOf(tx.getCounterId()) : null);
                payload.put("logType", "ADMIN_LOG");
                payload.put("message", String.format("Nhân viên %s đã xác nhận nạp tiền ở quầy với mã giao dịch: %s, số tiền: %s", 
                        staffId, tx.getTransactionCode(), tx.getAmount()));
                // Gửi log đến admin
                kafkaTemplate.send("ADMIN_ACTION", tx.getId().toString(), payload);
                log.info("Published counter deposit confirmed log for transaction: {}", tx.getId());
            }
        } catch (Exception ex) {
            log.warn("Failed to publish counter deposit confirmed log for {}", tx.getId(), ex);
        }
    }

    private void publishCounterDepositCancelled(Transaction tx, UUID userId) {
        try {
            if (kafkaTemplate != null) {
                Map<String, Object> payload = new java.util.HashMap<>();
                payload.put("transactionId", String.valueOf(tx.getId()));
                payload.put("transactionCode", tx.getTransactionCode() != null ? tx.getTransactionCode() : "");
                payload.put("amount", tx.getAmount());
                payload.put("type", "COUNTER_DEPOSIT_CANCELLED");
                payload.put("status", "CANCELLED");
                payload.put("timestamp", tx.getTimestamp().toString());
                payload.put("userId", userId != null ? String.valueOf(userId) : null);
                payload.put("staffId", tx.getStaffId() != null ? String.valueOf(tx.getStaffId()) : null);
                payload.put("counterId", tx.getCounterId() != null ? String.valueOf(tx.getCounterId()) : null);
                payload.put("notificationType", "COUNTER_DEPOSIT_CANCELLED");
                payload.put("message", String.format("User đã hủy yêu cầu nạp tiền ở quầy với mã giao dịch: %s, số tiền: %s", 
                        tx.getTransactionCode(), tx.getAmount()));
                // Gửi thông báo đến nhân viên
                kafkaTemplate.send("COUNTER_DEPOSIT_NOTIFICATION", tx.getTransactionCode(), payload);
                log.info("Published counter deposit cancelled notification for transaction: {}", tx.getId());
            }
        } catch (Exception ex) {
            log.warn("Failed to publish counter deposit cancelled notification for {}", tx.getId(), ex);
        }
    }
}


