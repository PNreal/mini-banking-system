package com.minibank.logservice.util;

/**
 * Constants for log actions
 */
public class LogAction {
    // User actions
    public static final String LOGIN = "LOGIN";
    public static final String LOGOUT = "LOGOUT";
    public static final String REGISTER = "REGISTER";
    public static final String FAILED_LOGIN = "FAILED_LOGIN";
    public static final String RESET_PASSWORD = "RESET_PASSWORD";
    
    // Transaction actions
    public static final String DEPOSIT = "DEPOSIT";
    public static final String WITHDRAW = "WITHDRAW";
    public static final String TRANSFER = "TRANSFER";
    
    // Account actions
    public static final String FREEZE = "FREEZE";
    public static final String UNFREEZE = "UNFREEZE";
    public static final String SELF_FREEZE = "SELF_FREEZE";
    
    // Admin actions
    public static final String LOCK = "LOCK";
    public static final String UNLOCK = "UNLOCK";
    public static final String ADMIN_FREEZE = "ADMIN_FREEZE";
    public static final String ADMIN_UNFREEZE = "ADMIN_UNFREEZE";
    
    private LogAction() {
        // Utility class
    }
}

