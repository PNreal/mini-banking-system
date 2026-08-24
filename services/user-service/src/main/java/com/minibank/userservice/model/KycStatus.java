package com.minibank.userservice.model;

public enum KycStatus {
    PENDING,      // Chờ xác minh
    APPROVED,     // Đã duyệt
    REJECTED,     // Từ chối
    RESUBMITTED   // Nộp lại sau khi bị từ chối
}
