package com.minibank.transactionservice.repository;

import com.minibank.transactionservice.entity.Transaction;
import com.minibank.transactionservice.entity.TransactionStatus;
import com.minibank.transactionservice.entity.TransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
            select t from Transaction t
            where (t.fromAccountId = :accountId or t.toAccountId = :accountId)
              and (:#{#type == null} = true or t.type = :type)
              and (:#{#fromTime == null} = true or t.timestamp >= :fromTime)
              and (:#{#toTime == null} = true or t.timestamp <= :toTime)
            order by t.timestamp desc
            """)
    Page<Transaction> searchByAccount(
            @Param("accountId") UUID accountId,
            @Param("type") TransactionType type,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            Pageable pageable);

    @Query("""
            select t from Transaction t
            where t.staffId = :staffId
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT, 
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
            order by t.timestamp desc
            """)
    List<Transaction> findRecentCounterDepositsByStaffId(
            @Param("staffId") UUID staffId,
            Pageable pageable);

    @Query("""
            select t from Transaction t
            where t.staffId = :staffId
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT,
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.PENDING
            order by t.timestamp desc
            """)
    List<Transaction> findPendingCounterDepositsByStaffId(
            @Param("staffId") UUID staffId,
            Pageable pageable);

    @Query("""
            select count(t) from Transaction t
            where t.staffId = :staffId
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT,
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.PENDING
            """)
    long countPendingCounterDepositsByStaffId(@Param("staffId") UUID staffId);

    /**
     * Đếm số transaction PENDING của một nhân viên trong quầy (dùng cho phân bổ nhân viên)
     */
    @Query("""
            select count(t) from Transaction t
            where t.staffId = :staffId
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.PENDING
            """)
    long countPendingByStaffId(@Param("staffId") UUID staffId);

    /**
     * Lấy danh sách giao dịch tại quầy đang chờ xử lý của user (theo accountId)
     */
    @Query("""
            select t from Transaction t
            where (t.toAccountId = :accountId or t.fromAccountId = :accountId)
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT,
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.PENDING
            order by t.timestamp desc
            """)
    List<Transaction> findPendingCounterTransactionsByAccountId(@Param("accountId") UUID accountId);

    @Query("""
            select count(t) from Transaction t
            where t.staffId = :staffId
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT,
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.SUCCESS
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    long countSuccessfulCounterDepositsByStaffIdBetween(
            @Param("staffId") UUID staffId,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.staffId = :staffId
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT,
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.SUCCESS
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    BigDecimal sumSuccessfulCounterDepositsAmountByStaffIdBetween(
            @Param("staffId") UUID staffId,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    @Query("""
            select count(distinct coalesce(t.toAccountId, t.fromAccountId)) from Transaction t
            where t.staffId = :staffId
              and t.type in (com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT,
                            com.minibank.transactionservice.entity.TransactionType.COUNTER_WITHDRAW)
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.SUCCESS
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    long countDistinctCustomersServedByStaffIdBetween(
            @Param("staffId") UUID staffId,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    /**
     * Admin: Lấy tất cả giao dịch với filter
     */
    @Query("""
            select t from Transaction t
            where (:#{#type == null} = true or t.type = :type)
              and (:#{#status == null} = true or CAST(t.status AS string) = :status)
              and (:#{#fromTime == null} = true or t.timestamp >= :fromTime)
              and (:#{#toTime == null} = true or t.timestamp <= :toTime)
            order by t.timestamp desc
            """)
    Page<Transaction> searchAllTransactions(
            @Param("type") TransactionType type,
            @Param("status") String status,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime,
            Pageable pageable);

    // ============ ADMIN STATISTICS METHODS ============

    /**
     * Count transactions by type within time range
     */
    @Query("""
            select count(t) from Transaction t
            where t.type = :type
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    long countByTypeAndTimestampBetween(
            @Param("type") TransactionType type,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    /**
     * Count transactions by status within time range
     */
    @Query("""
            select count(t) from Transaction t
            where t.status = :status
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    long countByStatusAndTimestampBetween(
            @Param("status") TransactionStatus status,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    /**
     * Sum amount by type and status within time range
     */
    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.type = :type
              and t.status = :status
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    BigDecimal sumAmountByTypeAndStatusBetween(
            @Param("type") TransactionType type,
            @Param("status") TransactionStatus status,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    /**
     * Count all transactions within time range
     */
    @Query("""
            select count(t) from Transaction t
            where t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    long countByTimestampBetween(
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    /**
     * Sum all successful transaction amounts within time range
     */
    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.status = com.minibank.transactionservice.entity.TransactionStatus.SUCCESS
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    BigDecimal sumSuccessfulAmountBetween(
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    /**
     * Get recent transactions for admin dashboard
     */
    @Query("""
            select t from Transaction t
            order by t.timestamp desc
            """)
    List<Transaction> findRecentTransactions(Pageable pageable);

    /**
     * Get daily transaction stats for chart (last N days)
     */
    @Query(value = """
            SELECT 
                DATE(timestamp) as date,
                type,
                COUNT(*) as count,
                COALESCE(SUM(amount), 0) as total_amount
            FROM transactions
            WHERE timestamp >= :fromTime AND timestamp < :toTime
              AND status = 'SUCCESS'
            GROUP BY DATE(timestamp), type
            ORDER BY date DESC
            """, nativeQuery = true)
    List<Object[]> getDailyTransactionStats(
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);
}


