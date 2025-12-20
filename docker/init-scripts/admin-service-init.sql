-- Admin Service Database Initialization Script
-- Database: admin_db (PostgreSQL)

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    admin_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_user UUID NOT NULL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_user ON admin_logs(target_user);
CREATE INDEX IF NOT EXISTS idx_admin_logs_time ON admin_logs(time);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Add comments for documentation
COMMENT ON TABLE admin_logs IS 'Stores all administrative actions performed by admins';
COMMENT ON COLUMN admin_logs.admin_log_id IS 'Primary key, unique log identifier';
COMMENT ON COLUMN admin_logs.admin_id IS 'Foreign key to users table (admin who performed action)';
COMMENT ON COLUMN admin_logs.action IS 'Action type: FREEZE, UNFREEZE, LOCK, UNLOCK, CREATE_USER, UPDATE_USER, DELETE_USER, etc.';
COMMENT ON COLUMN admin_logs.target_user IS 'Foreign key to users table (user affected by action)';
COMMENT ON COLUMN admin_logs.time IS 'Timestamp when action was performed';

-- Insert sample admin logs for testing
-- Admin freezes a user account
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'FREEZE_ACCOUNT',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs LIMIT 1);

-- Admin unfreezes a user account
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'UNFREEZE_ACCOUNT',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'UNFREEZE_ACCOUNT' LIMIT 1);

-- Admin locks a user account
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'LOCK_ACCOUNT',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'LOCK_ACCOUNT' LIMIT 1);

-- Admin unlocks a user account
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'UNLOCK_ACCOUNT',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'UNLOCK_ACCOUNT' LIMIT 1);

-- Admin creates a new user
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'CREATE_USER',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'CREATE_USER' LIMIT 1);

-- Admin updates user information
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'UPDATE_USER',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'UPDATE_USER' LIMIT 1);

-- Admin deletes a user
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'DELETE_USER',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '10 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'DELETE_USER' LIMIT 1);

-- Admin approves KYC
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'APPROVE_KYC',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '6 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'APPROVE_KYC' LIMIT 1);

-- Admin rejects KYC
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'REJECT_KYC',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '8 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'REJECT_KYC' LIMIT 1);

-- Admin creates a counter
INSERT INTO admin_logs (admin_log_id, admin_id, action, target_user, time)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'CREATE_COUNTER',
    gen_random_uuid(),
    CURRENT_TIMESTAMP - INTERVAL '15 days'
WHERE NOT EXISTS (SELECT 1 FROM admin_logs WHERE action = 'CREATE_COUNTER' LIMIT 1);

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON TABLE admin_logs TO your_user;
