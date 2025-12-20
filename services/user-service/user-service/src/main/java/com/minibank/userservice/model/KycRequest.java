package com.minibank.userservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "kyc_requests")
public class KycRequest {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "kyc_id")
    private UUID id;

    @Column(nullable = false)
    private UUID userId;

    // Thông tin CCCD/CMND
    @Column(nullable = false, length = 20)
    private String citizenId;

    @Column(nullable = false, length = 150)
    private String fullName;

    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender; // MALE, FEMALE, OTHER

    @Column(length = 100)
    private String placeOfIssue; // Nơi cấp

    private LocalDate dateOfIssue; // Ngày cấp

    private LocalDate expiryDate; // Ngày hết hạn

    @Column(length = 200)
    private String permanentAddress; // Địa chỉ thường trú

    @Column(length = 200)
    private String currentAddress; // Địa chỉ hiện tại

    @Column(length = 20)
    private String phoneNumber;

    @Column(length = 100)
    private String email;

    // URLs của hình ảnh (lưu trên file storage hoặc S3)
    @Column(length = 500)
    private String frontIdImageUrl; // CCCD mặt trước

    @Column(length = 500)
    private String backIdImageUrl; // CCCD mặt sau

    @Column(length = 500)
    private String selfieImageUrl; // Ảnh chân dung

    // Trạng thái xác minh
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private KycStatus status = KycStatus.PENDING;

    // Thông tin xác minh
    private UUID verifiedBy; // Staff ID người xác minh

    private Instant verifiedAt; // Thời điểm xác minh

    @Column(length = 500)
    private String rejectionReason; // Lý do từ chối (nếu có)

    @Column(length = 1000)
    private String notes; // Ghi chú của nhân viên

    // Audit fields
    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    public void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Constructors
    public KycRequest() {
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPlaceOfIssue() {
        return placeOfIssue;
    }

    public void setPlaceOfIssue(String placeOfIssue) {
        this.placeOfIssue = placeOfIssue;
    }

    public LocalDate getDateOfIssue() {
        return dateOfIssue;
    }

    public void setDateOfIssue(LocalDate dateOfIssue) {
        this.dateOfIssue = dateOfIssue;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getPermanentAddress() {
        return permanentAddress;
    }

    public void setPermanentAddress(String permanentAddress) {
        this.permanentAddress = permanentAddress;
    }

    public String getCurrentAddress() {
        return currentAddress;
    }

    public void setCurrentAddress(String currentAddress) {
        this.currentAddress = currentAddress;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFrontIdImageUrl() {
        return frontIdImageUrl;
    }

    public void setFrontIdImageUrl(String frontIdImageUrl) {
        this.frontIdImageUrl = frontIdImageUrl;
    }

    public String getBackIdImageUrl() {
        return backIdImageUrl;
    }

    public void setBackIdImageUrl(String backIdImageUrl) {
        this.backIdImageUrl = backIdImageUrl;
    }

    public String getSelfieImageUrl() {
        return selfieImageUrl;
    }

    public void setSelfieImageUrl(String selfieImageUrl) {
        this.selfieImageUrl = selfieImageUrl;
    }

    public KycStatus getStatus() {
        return status;
    }

    public void setStatus(KycStatus status) {
        this.status = status;
    }

    public UUID getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(UUID verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
