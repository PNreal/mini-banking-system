package com.minibank.userservice.repository;

import com.minibank.userservice.model.KycRequest;
import com.minibank.userservice.model.KycStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KycRequestRepository extends JpaRepository<KycRequest, UUID> {

    // Tìm KYC request của user (lấy cái mới nhất)
    Optional<KycRequest> findFirstByUserIdOrderByCreatedAtDesc(UUID userId);

    // Tìm tất cả KYC requests của user
    List<KycRequest> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Tìm theo trạng thái
    Page<KycRequest> findByStatus(KycStatus status, Pageable pageable);

    // Tìm theo trạng thái và sắp xếp theo thời gian tạo
    Page<KycRequest> findByStatusOrderByCreatedAtAsc(KycStatus status, Pageable pageable);

    // Đếm số lượng KYC requests theo trạng thái
    long countByStatus(KycStatus status);

    // Đếm số lượng KYC requests đang chờ của một staff
    @Query("SELECT COUNT(k) FROM KycRequest k WHERE k.status = :status")
    long countPendingRequests(@Param("status") KycStatus status);

    // Tìm KYC requests được xác minh bởi staff
    Page<KycRequest> findByVerifiedByOrderByVerifiedAtDesc(UUID staffId, Pageable pageable);

    // Kiểm tra user đã có KYC approved chưa
    boolean existsByUserIdAndStatus(UUID userId, KycStatus status);

    // Tìm theo CCCD
    Optional<KycRequest> findByCitizenIdAndStatus(String citizenId, KycStatus status);
}
