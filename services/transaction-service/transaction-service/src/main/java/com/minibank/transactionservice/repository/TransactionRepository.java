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
              and (:type is null or t.type = :type)
              and (:fromTime is null or t.timestamp >= :fromTime)
              and (:toTime is null or t.timestamp <= :toTime)
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
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
            order by t.timestamp desc
            """)
    List<Transaction> findRecentCounterDepositsByStaffId(
            @Param("staffId") UUID staffId,
            Pageable pageable);

    @Query("""
            select t from Transaction t
            where t.staffId = :staffId
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.PENDING
            order by t.timestamp desc
            """)
    List<Transaction> findPendingCounterDepositsByStaffId(
            @Param("staffId") UUID staffId,
            Pageable pageable);

    @Query("""
            select count(t) from Transaction t
            where t.staffId = :staffId
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.PENDING
            """)
    long countPendingCounterDepositsByStaffId(@Param("staffId") UUID staffId);

    @Query("""
            select count(t) from Transaction t
            where t.staffId = :staffId
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
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
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.SUCCESS
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    BigDecimal sumSuccessfulCounterDepositsAmountByStaffIdBetween(
            @Param("staffId") UUID staffId,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);

    @Query("""
            select count(distinct t.toAccountId) from Transaction t
            where t.staffId = :staffId
              and t.type = com.minibank.transactionservice.entity.TransactionType.COUNTER_DEPOSIT
              and t.status = com.minibank.transactionservice.entity.TransactionStatus.SUCCESS
              and t.timestamp >= :fromTime and t.timestamp < :toTime
            """)
    long countDistinctCustomersServedByStaffIdBetween(
            @Param("staffId") UUID staffId,
            @Param("fromTime") OffsetDateTime fromTime,
            @Param("toTime") OffsetDateTime toTime);
}


