package com.minibank.transactionservice.repository;

import com.minibank.transactionservice.entity.Transaction;
import com.minibank.transactionservice.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
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
}


