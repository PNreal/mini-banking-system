\c transaction_db;

CREATE TABLE IF NOT EXISTS transaction (
    trans_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_acc UUID,
    to_acc UUID,
    amount DECIMAL(18,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'TRANSFER')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SUCCESS', 'FAILED')),
    
    CONSTRAINT chk_transaction_logic CHECK (
        (type = 'DEPOSIT' AND from_acc IS NULL AND to_acc IS NOT NULL) OR
        (type = 'WITHDRAW' AND from_acc IS NOT NULL AND to_acc IS NULL) OR
        (type = 'TRANSFER' AND from_acc IS NOT NULL AND to_acc IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_transaction_timestamp ON transaction(timestamp);
CREATE INDEX IF NOT EXISTS idx_transaction_from_acc ON transaction(from_acc);
CREATE INDEX IF NOT EXISTS idx_transaction_to_acc ON transaction(to_acc);
CREATE INDEX IF NOT EXISTS idx_transaction_type ON transaction(type);
CREATE INDEX IF NOT EXISTS idx_transaction_status ON transaction(status);
CREATE INDEX IF NOT EXISTS idx_transaction_from_to_timestamp ON transaction(from_acc, to_acc, timestamp DESC);

