package com.minibank.logservice.repository;

import com.minibank.logservice.entity.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LogRepository extends JpaRepository<Log, UUID> {

    /**
     * Find all logs for a specific user
     */
    Page<Log> findByUserIdOrderByTimeDesc(UUID userId, Pageable pageable);

    /**
     * Find logs by user and action
     */
    List<Log> findByUserIdAndActionOrderByTimeDesc(UUID userId, String action);

    /**
     * Find logs within a time range
     */
    @Query("SELECT l FROM Log l WHERE l.time BETWEEN :startTime AND :endTime ORDER BY l.time DESC")
    Page<Log> findByTimeBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * Find logs by user within a time range
     */
    @Query("SELECT l FROM Log l WHERE l.userId = :userId AND l.time BETWEEN :startTime AND :endTime ORDER BY l.time DESC")
    Page<Log> findByUserIdAndTimeBetween(
            @Param("userId") UUID userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    /**
     * Find logs by action
     */
    Page<Log> findByActionOrderByTimeDesc(String action, Pageable pageable);
}

