package com.minibank.accountservice.repository;

import com.minibank.accountservice.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {
    
    Optional<Account> findByAccountNumber(String accountNumber);
    
    List<Account> findByUserId(UUID userId);
    
    List<Account> findByUserIdAndStatus(UUID userId, Account.AccountStatus status);
    
    @Query("SELECT a FROM Account a WHERE a.userId = :userId AND a.isLocked = false AND a.isFrozen = false AND a.status = 'ACTIVE'")
    List<Account> findActiveAccountsByUserId(@Param("userId") UUID userId);
    
    boolean existsByAccountNumber(String accountNumber);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.userId = :userId")
    long countByUserId(@Param("userId") UUID userId);
}

