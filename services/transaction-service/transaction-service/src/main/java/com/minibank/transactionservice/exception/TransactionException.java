package com.minibank.transactionservice.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Business exception for transaction service with standardized error code and HTTP status.
 */
@Getter
public class TransactionException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public TransactionException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }
}


