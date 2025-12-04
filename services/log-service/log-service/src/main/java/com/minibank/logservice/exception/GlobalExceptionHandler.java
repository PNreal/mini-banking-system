package com.minibank.logservice.exception;

import com.minibank.logservice.dto.ApiResponse;
import com.minibank.logservice.dto.ErrorResponse;
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

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation errors
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.warn("Validation error: {}", errors);
        
        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("VALIDATION_ERROR")
                .message("Validation failed")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Map<String, String>> response = ApiResponse.<Map<String, String>>builder()
                .success(false)
                .error(errorResponse)
                .data(errors)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle invalid UUID format
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("Illegal argument: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("INVALID_INPUT")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle invalid request body
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        log.warn("Invalid request body: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("INVALID_REQUEST_BODY")
                .message("Invalid request body format")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle type mismatch (e.g., invalid UUID format in path variable)
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.warn("Type mismatch: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("INVALID_PARAMETER_TYPE")
                .message("Invalid parameter type: " + ex.getName())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle database access errors
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccessException(
            DataAccessException ex, HttpServletRequest request) {
        log.error("Database error: {}", ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("DATABASE_ERROR")
                .message("Database operation failed")
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    /**
     * Handle custom LogServiceException
     */
    @ExceptionHandler(com.minibank.logservice.exception.LogServiceException.class)
    public ResponseEntity<ApiResponse<Object>> handleLogServiceException(
            com.minibank.logservice.exception.LogServiceException ex, HttpServletRequest request) {
        log.warn("LogServiceException: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(ex.getErrorCode())
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handle ResourceNotFoundException
     */
    @ExceptionHandler(com.minibank.logservice.exception.ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleResourceNotFoundException(
            com.minibank.logservice.exception.ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Resource not found: {}", ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("RESOURCE_NOT_FOUND")
                .message(ex.getMessage())
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        String errorId = UUID.randomUUID().toString();
        log.error("Unexpected error [{}]: {}", errorId, ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("INTERNAL_SERVER_ERROR")
                .message("An unexpected error occurred. Error ID: " + errorId)
                .timestamp(LocalDateTime.now())
                .path(request.getRequestURI())
                .build();

        ApiResponse<Object> response = ApiResponse.builder()
                .success(false)
                .error(errorResponse)
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}

