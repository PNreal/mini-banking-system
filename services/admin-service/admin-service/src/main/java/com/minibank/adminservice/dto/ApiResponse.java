package com.minibank.adminservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private ErrorResponse error;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message, String path) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(code)
                .message(message)
                .timestamp(java.time.LocalDateTime.now())
                .path(path)
                .build();
        return ApiResponse.<T>builder()
                .success(false)
                .error(errorResponse)
                .build();
    }
}

