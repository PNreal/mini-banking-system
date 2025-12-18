package com.minibank.transactionservice.repository;

import com.minibank.transactionservice.entity.Counter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CounterRepository extends JpaRepository<Counter, UUID> {
    List<Counter> findByIsActiveTrue();
    Counter findByIdAndIsActiveTrue(UUID id);
    Counter findByAdminUserIdAndIsActiveTrue(UUID adminUserId);
    boolean existsByAdminUserIdAndIsActiveTrue(UUID adminUserId);
}

