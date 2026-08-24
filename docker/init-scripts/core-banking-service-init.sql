-- Core Banking Service Database Initialization Script
-- Databases & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    account_number VARCHAR(12) UNIQUE NOT NULL,
    balance NUMERIC(19, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_account_number ON accounts(account_number);

-- Counters Table
CREATE TABLE IF NOT EXISTS counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counter_code VARCHAR(20) NOT NULL UNIQUE,
    counter_name VARCHAR(100) NOT NULL,
    branch_name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Counter Staff Table
CREATE TABLE IF NOT EXISTS counter_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counter_id UUID NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_counter_staff_user ON counter_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_counter_staff_counter ON counter_staff(counter_id);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_account_id UUID REFERENCES accounts(id),
    to_account_id UUID REFERENCES accounts(id),
    amount NUMERIC(19, 4) NOT NULL,
    type VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_code VARCHAR(50),
    counter_id UUID REFERENCES counters(id),
    staff_id UUID,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_transactions_from_acc ON transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_acc ON transactions(to_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_code ON transactions(transaction_code);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
