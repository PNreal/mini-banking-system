package com.minibank.notificationservice.repository;

import com.minibank.notificationservice.entity.Notification;
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
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    List<Notification> findByUserId(UUID userId);
    
    Page<Notification> findByUserId(UUID userId, Pageable pageable);
    
    List<Notification> findByUserIdAndStatus(UUID userId, Notification.NotificationStatus status);
    
    List<Notification> findByUserIdAndType(UUID userId, Notification.NotificationType type);
    
    List<Notification> findByUserIdAndChannel(UUID userId, Notification.NotificationChannel channel);
    
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status = 'READ'")
    List<Notification> findReadNotificationsByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.status != 'READ'")
    List<Notification> findUnreadNotificationsByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.userId = :userId AND n.status != 'READ'")
    long countUnreadByUserId(@Param("userId") UUID userId);
    
    @Query("SELECT n FROM Notification n WHERE n.status = 'PENDING' AND n.createdAt <= :beforeDate")
    List<Notification> findPendingNotificationsBefore(@Param("beforeDate") LocalDateTime beforeDate);
    
    @Query("SELECT n FROM Notification n WHERE n.userId = :userId AND n.createdAt BETWEEN :startDate AND :endDate")
    List<Notification> findByUserIdAndDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}

