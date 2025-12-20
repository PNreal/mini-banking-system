-- Account Service Database Initialization Script
-- Database: account_db (PostgreSQL)

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(20) UNIQUE,
    user_id UUID NOT NULL UNIQUE,
    balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);

-- Add comments for documentation
COMMENT ON TABLE accounts IS 'Stores bank account information for users';
COMMENT ON COLUMN accounts.id IS 'Primary key, unique account identifier';
COMMENT ON COLUMN accounts.account_number IS 'Bank account number (12 digits), auto-generated';
COMMENT ON COLUMN accounts.user_id IS 'Foreign key to users table (unique - one account per user)';
COMMENT ON COLUMN accounts.balance IS 'Current account balance';
COMMENT ON COLUMN accounts.status IS 'Account status: ACTIVE, FROZEN, or LOCKED';
COMMENT ON COLUMN accounts.created_at IS 'Timestamp when account was created';
COMMENT ON COLUMN accounts.updated_at IS 'Timestamp when account was last updated';

-- Note: Sample data will be created automatically when users register
-- or can be created by AccountService when user-service creates users

-- Insert sample accounts for existing test users (if they exist)
-- These will be created by the application, but we can add some for testing

-- Sample account for admin (if needed for testing)
INSERT INTO accounts (id, account_number, user_id, balance, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    '100000000001',
    user_id,
    1000000.00,
    'ACTIVE',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT gen_random_uuid() as user_id) AS temp
WHERE NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = '100000000001')
LIMIT 1;

-- Note: In production, accounts should be created via API calls from user-service
-- This ensures proper synchronization between services
