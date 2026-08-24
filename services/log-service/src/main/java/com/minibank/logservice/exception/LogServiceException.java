package com.minibank.logservice.exception;

public class LogServiceException extends RuntimeException {
    private final String errorCode;

    public LogServiceException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public LogServiceException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }

    public String getErrorCode() {
        return errorCode;
    }
}

