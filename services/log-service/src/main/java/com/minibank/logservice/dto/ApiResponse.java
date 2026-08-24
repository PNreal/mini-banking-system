package com.minibank.logservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
        ErrorResponse error = ErrorResponse.builder()
                .code(code)
                .message(message)
                .path(path)
                .build();
        return ApiResponse.<T>builder()
                .success(false)
                .error(error)
                .build();
    }
}

