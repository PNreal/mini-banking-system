-- Database initialization script for Log Service
-- This script will be executed automatically when PostgreSQL container starts for the first time

-- Create database (already created by POSTGRES_DB env var, but ensure it exists)
-- CREATE DATABASE IF NOT EXISTS log_db;

-- Connect to log_db
\c log_db;

-- Create log table
CREATE TABLE IF NOT EXISTS log (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    action VARCHAR(255) NOT NULL,
    detail TEXT,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_log_user_id ON log(user_id);
CREATE INDEX IF NOT EXISTS idx_log_time ON log(time);
CREATE INDEX IF NOT EXISTS idx_log_action ON log(action);

-- Add comments for documentation
COMMENT ON TABLE log IS 'Stores all system logs and user actions';
COMMENT ON COLUMN log.log_id IS 'Primary key, unique log identifier';
COMMENT ON COLUMN log.user_id IS 'Foreign key to users table, identifies who performed the action';
COMMENT ON COLUMN log.action IS 'Action type (e.g., login, logout, deposit, withdraw, freeze, etc.)';
COMMENT ON COLUMN log.detail IS 'Additional details about the action';
COMMENT ON COLUMN log.time IS 'Timestamp when the action occurred';

