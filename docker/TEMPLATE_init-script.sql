-- TEMPLATE: Database Initialization Script for New Service
-- Copy this template and save as: docker/init-scripts/{service-name}-init.sql
#
# CHECKLIST:
# [ ] Replace {service-name} with your service name (e.g., "user", "account")
# [ ] Replace {Service Name} with proper service name (e.g., "User", "Account")
# [ ] Add your table definitions
# [ ] Add indexes for better performance
# [ ] Add comments for documentation

-- Database initialization script for {Service Name} Service
-- This script will be executed automatically when PostgreSQL container starts for the first time

-- Connect to {service-name}_db
\c {service-name}_db;

-- Create your tables here
-- Example:
-- CREATE TABLE IF NOT EXISTS {table_name} (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     -- Add your columns here
--     created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- Create indexes for better query performance
-- Example:
-- CREATE INDEX IF NOT EXISTS idx_{table_name}_column_name ON {table_name}(column_name);

-- Add comments for documentation
-- Example:
-- COMMENT ON TABLE {table_name} IS 'Description of the table';
-- COMMENT ON COLUMN {table_name}.id IS 'Primary key, unique identifier';

