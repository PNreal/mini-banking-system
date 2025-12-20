package com.minibank.transactionservice.repository;

import com.minibank.transactionservice.entity.CounterStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CounterStaffRepository extends JpaRepository<CounterStaff, UUID> {
    List<CounterStaff> findByCounterIdAndIsActiveTrue(UUID counterId);
    CounterStaff findByCounterIdAndUserIdAndIsActiveTrue(UUID counterId, UUID userId);
    List<CounterStaff> findByCounterId(UUID counterId);
    CounterStaff findByCounterIdAndUserId(UUID counterId, UUID userId);
    
    @Query("SELECT cs.userId, COUNT(t.id) as pendingCount " +
           "FROM CounterStaff cs " +
           "LEFT JOIN Transaction t ON t.staffId = cs.userId " +
           "AND t.type = 'COUNTER_DEPOSIT' AND t.status = 'PENDING' " +
           "WHERE cs.counterId = :counterId AND cs.isActive = true " +
           "GROUP BY cs.userId")
    List<Object[]> findStaffPendingCountsByCounterId(@Param("counterId") UUID counterId);
}

