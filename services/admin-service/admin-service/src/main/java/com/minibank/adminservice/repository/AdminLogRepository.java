package com.minibank.adminservice.repository;

import com.minibank.adminservice.entity.AdminLog;
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
public interface AdminLogRepository extends JpaRepository<AdminLog, UUID> {

    Page<AdminLog> findByAdminIdOrderByTimeDesc(UUID adminId, Pageable pageable);

    Page<AdminLog> findByTargetUserOrderByTimeDesc(UUID targetUser, Pageable pageable);

    Page<AdminLog> findByActionOrderByTimeDesc(String action, Pageable pageable);

    @Query("SELECT al FROM AdminLog al WHERE al.time BETWEEN :startTime AND :endTime ORDER BY al.time DESC")
    Page<AdminLog> findByTimeBetween(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    @Query("SELECT al FROM AdminLog al WHERE al.adminId = :adminId AND al.time BETWEEN :startTime AND :endTime ORDER BY al.time DESC")
    Page<AdminLog> findByAdminIdAndTimeBetween(
            @Param("adminId") UUID adminId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            Pageable pageable
    );

    List<AdminLog> findByAction(String action);
}

