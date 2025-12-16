package com.minibank.transactionservice.exception;

import com.minibank.transactionservice.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation error: {}", errors);

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code("INVALID_INPUT")
                        .message("Validation failed")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .data(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );

        log.warn("Constraint violation: {}", errors);

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code("INVALID_INPUT")
                        .message("Validation failed")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .data(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Invalid request body: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code("INVALID_REQUEST_BODY")
                        .message("Invalid request body format")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.warn("Type mismatch: {}", ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code("INVALID_PARAMETER_TYPE")
                        .message("Invalid parameter type: " + ex.getName())
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccess(
            DataAccessException ex, HttpServletRequest request) {
        log.error("Database error: {}", ex.getMessage(), ex);

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code("DATABASE_ERROR")
                        .message("Database operation failed")
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(TransactionException.class)
    public ResponseEntity<ApiResponse<Object>> handleTransactionException(
            TransactionException ex, HttpServletRequest request) {
        log.warn("TransactionException: {} - {}", ex.getErrorCode(), ex.getMessage());

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code(ex.getErrorCode())
                        .message(ex.getMessage())
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .build();

        return ResponseEntity.status(ex.getHttpStatus()).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.error("Unexpected error [{}]: {}", errorId, ex.getMessage(), ex);

        ApiResponse<Object> response = ApiResponse.<Object>builder()
                .success(false)
                .error(ApiResponse.ErrorDetail.builder()
                        .code("TRANSACTION_FAILED")
                        .message("An unexpected error occurred. Error ID: " + errorId)
                        .timestamp(LocalDateTime.now())
                        .path(request.getRequestURI())
                        .build())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}


