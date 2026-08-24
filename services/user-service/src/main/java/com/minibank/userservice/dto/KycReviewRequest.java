package com.minibank.userservice.dto;

import com.minibank.userservice.model.KycStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycReviewRequest {

    @NotNull(message = "Status is required")
    private KycStatus status; // APPROVED or REJECTED

    private String rejectionReason; // Required if status is REJECTED

    private String notes; // Optional notes from staff
}
