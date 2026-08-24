package com.minibank.userservice.service;

import com.minibank.userservice.dto.KycRequestDto;
import com.minibank.userservice.dto.KycResponse;
import com.minibank.userservice.dto.KycReviewRequest;
import com.minibank.userservice.exception.BadRequestException;
import com.minibank.userservice.exception.NotFoundException;
import com.minibank.userservice.model.KycRequest;
import com.minibank.userservice.model.KycStatus;
import com.minibank.userservice.model.User;
import com.minibank.userservice.repository.KycRequestRepository;
import com.minibank.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final KycRequestRepository kycRequestRepository;
    private final UserRepository userRepository;
    private final AccountServiceClient accountServiceClient;

    /**
     * User gửi yêu cầu KYC
     */
    @Transactional
    public KycResponse submitKycRequest(UUID userId, KycRequestDto dto) {
        // Kiểm tra user tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Kiểm tra xem user đã có KYC approved chưa
        if (kycRequestRepository.existsByUserIdAndStatus(userId, KycStatus.APPROVED)) {
            throw new BadRequestException("User already has approved KYC");
        }

        // Kiểm tra xem có KYC pending không
        kycRequestRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .ifPresent(existing -> {
                    if (existing.getStatus() == KycStatus.PENDING) {
                        throw new BadRequestException("You already have a pending KYC request");
                    }
                });

        // Tạo KYC request mới
        KycRequest kycRequest = new KycRequest();
        kycRequest.setUserId(userId);
        kycRequest.setCitizenId(dto.getCitizenId());
        kycRequest.setFullName(dto.getFullName());
        kycRequest.setDateOfBirth(dto.getDateOfBirth());
        kycRequest.setGender(dto.getGender());
        kycRequest.setPlaceOfIssue(dto.getPlaceOfIssue());
        kycRequest.setDateOfIssue(dto.getDateOfIssue());
        kycRequest.setExpiryDate(dto.getExpiryDate());
        kycRequest.setPermanentAddress(dto.getPermanentAddress());
        kycRequest.setCurrentAddress(dto.getCurrentAddress());
        kycRequest.setPhoneNumber(dto.getPhoneNumber());
        kycRequest.setEmail(dto.getEmail() != null ? dto.getEmail() : user.getEmail());
        kycRequest.setFrontIdImageUrl(dto.getFrontIdImageUrl());
        kycRequest.setBackIdImageUrl(dto.getBackIdImageUrl());
        kycRequest.setSelfieImageUrl(dto.getSelfieImageUrl());
        kycRequest.setStatus(KycStatus.PENDING);

        KycRequest saved = kycRequestRepository.save(kycRequest);
        log.info("KYC request submitted for user: {}", userId);

        return KycResponse.from(saved);
    }

    /**
     * Lấy KYC request của user hiện tại
     */
    public KycResponse getMyKycStatus(UUID userId) {
        return kycRequestRepository.findFirstByUserIdOrderByCreatedAtDesc(userId)
                .map(KycResponse::from)
                .orElse(null);
    }

    /**
     * Lấy tất cả KYC requests của user
     */
    public List<KycResponse> getMyKycHistory(UUID userId) {
        return kycRequestRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(KycResponse::from)
                .toList();
    }

    /**
     * Admin/Staff lấy danh sách KYC pending
     */
    public Page<KycResponse> getPendingKycRequests(Pageable pageable) {
        return kycRequestRepository.findByStatusOrderByCreatedAtAsc(KycStatus.PENDING, pageable)
                .map(KycResponse::from);
    }

    /**
     * Admin/Staff lấy tất cả KYC requests
     */
    public Page<KycResponse> getAllKycRequests(KycStatus status, Pageable pageable) {
        if (status != null) {
            return kycRequestRepository.findByStatus(status, pageable)
                    .map(KycResponse::from);
        }
        return kycRequestRepository.findAll(pageable)
                .map(KycResponse::from);
    }

    /**
     * Lấy chi tiết KYC request
     */
    public KycResponse getKycRequest(UUID kycId) {
        KycRequest kyc = kycRequestRepository.findById(kycId)
                .orElseThrow(() -> new NotFoundException("KYC request not found"));
        return KycResponse.from(kyc);
    }

    /**
     * Admin/Staff review KYC request (approve/reject)
     */
    @Transactional
    public KycResponse reviewKycRequest(UUID kycId, UUID staffId, KycReviewRequest reviewRequest) {
        KycRequest kyc = kycRequestRepository.findById(kycId)
                .orElseThrow(() -> new NotFoundException("KYC request not found"));

        if (kyc.getStatus() != KycStatus.PENDING) {
            throw new BadRequestException("KYC request is not in pending status");
        }

        KycStatus newStatus = reviewRequest.getStatus();
        if (newStatus != KycStatus.APPROVED && newStatus != KycStatus.REJECTED) {
            throw new BadRequestException("Invalid status. Must be APPROVED or REJECTED");
        }

        if (newStatus == KycStatus.REJECTED && 
            (reviewRequest.getRejectionReason() == null || reviewRequest.getRejectionReason().isBlank())) {
            throw new BadRequestException("Rejection reason is required when rejecting KYC");
        }

        kyc.setStatus(newStatus);
        kyc.setVerifiedBy(staffId);
        kyc.setVerifiedAt(Instant.now());
        kyc.setRejectionReason(reviewRequest.getRejectionReason());
        kyc.setNotes(reviewRequest.getNotes());

        KycRequest saved = kycRequestRepository.save(kyc);

        // Nếu approve, cập nhật thông tin user và tạo số tài khoản
        if (newStatus == KycStatus.APPROVED) {
            handleKycApproval(kyc);
        }

        log.info("KYC request {} {} by staff {}", kycId, newStatus, staffId);
        return KycResponse.from(saved);
    }

    /**
     * Xử lý khi KYC được approve - cập nhật user và tạo STK
     */
    private void handleKycApproval(KycRequest kyc) {
        User user = userRepository.findById(kyc.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found"));

        // Cập nhật thông tin user từ KYC
        user.setCitizenId(kyc.getCitizenId());
        user.setFullName(kyc.getFullName());
        user.setPhoneNumber(kyc.getPhoneNumber());
        userRepository.save(user);

        // Gọi Account Service để tạo/kích hoạt số tài khoản
        try {
            accountServiceClient.activateAccountAfterKyc(kyc.getUserId());
            log.info("Account activated for user {} after KYC approval", kyc.getUserId());
        } catch (Exception e) {
            log.error("Failed to activate account for user {}: {}", kyc.getUserId(), e.getMessage());
            // Không throw exception để không rollback KYC approval
        }
    }

    /**
     * Đếm số KYC pending
     */
    public long countPendingKyc() {
        return kycRequestRepository.countByStatus(KycStatus.PENDING);
    }
}
