package com.minibank.transactionservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private Boolean success;
    private T data;
    private ErrorDetail error;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(String code, String message, String path) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(ErrorDetail.builder()
                        .code(code)
                        .message(message)
                        .timestamp(LocalDateTime.now())
                        .path(path)
                        .build())
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ErrorDetail {
        private String code;
        private String message;
        private LocalDateTime timestamp;
        private String path;
    }
}

