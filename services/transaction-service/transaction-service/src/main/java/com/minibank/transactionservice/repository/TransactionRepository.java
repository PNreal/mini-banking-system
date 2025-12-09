package com.minibank.transactionservice.repository;

import com.minibank.transactionservice.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByFromAccOrderByTimestampDesc(UUID fromAcc, Pageable pageable);

    Page<Transaction> findByToAccOrderByTimestampDesc(UUID toAcc, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAcc = :accountId OR t.toAcc = :accountId) ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountIdOrderByTimestampDesc(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE (t.fromAcc = :accountId OR t.toAcc = :accountId) AND t.type = :type ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountIdAndTypeOrderByTimestampDesc(
            @Param("accountId") UUID accountId,
            @Param("type") String type,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE (t.fromAcc = :accountId OR t.toAcc = :accountId) AND t.timestamp BETWEEN :startTime AND :endTime ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountIdAndTimestampBetween(
            @Param("accountId") UUID accountId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    @Query("SELECT t FROM Transaction t WHERE (t.fromAcc = :accountId OR t.toAcc = :accountId) AND t.type = :type AND t.timestamp BETWEEN :startTime AND :endTime ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountIdAndTypeAndTimestampBetween(
            @Param("accountId") UUID accountId,
            @Param("type") String type,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );
}

