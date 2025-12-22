-- User Service Database Initialization Script
-- Database: user_db (PostgreSQL)

-- Create users table if not exists (JPA will create it, but we define it here for reference)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    citizen_id VARCHAR(20),
    employee_code VARCHAR(20),
    phone_number VARCHAR(20),
    email_verified BOOLEAN NOT NULL DEFAULT false,
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMP,
    refresh_token VARCHAR(255),
    refresh_token_expiry TIMESTAMP,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    login_locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample admin user
-- Password: Admin@123 (hashed with BCrypt)
INSERT INTO users (user_id, email, password_hash, full_name, status, role, employee_code, email_verified, failed_login_attempts, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'admin@minibank.com', '$2a$10$vpIVHqcjTsBO3eYlA3eJIuchy4qAx8KqPLQB3mo2QKCeNknXbOm/m', 'Admin User', 'ACTIVE', 'ADMIN', 'ADM001', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Không tạo sẵn staff và customer test - admin sẽ tự tạo qua giao diện

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_refresh_token ON users(refresh_token);

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON TABLE users TO your_user;

-- ============================================
-- KYC REQUESTS TABLE
-- ============================================

-- Create kyc_requests table
CREATE TABLE IF NOT EXISTS kyc_requests (
    kyc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    
    -- Thông tin CCCD/CMND
    citizen_id VARCHAR(20) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    place_of_issue VARCHAR(100),
    date_of_issue DATE,
    expiry_date DATE,
    permanent_address VARCHAR(200),
    current_address VARCHAR(200),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    
    -- URLs của hình ảnh
    front_id_image_url VARCHAR(500),
    back_id_image_url VARCHAR(500),
    selfie_image_url VARCHAR(500),
    
    -- Trạng thái xác minh
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    
    -- Thông tin xác minh
    verified_by UUID,
    verified_at TIMESTAMP,
    rejection_reason VARCHAR(500),
    notes VARCHAR(1000),
    
    -- Audit fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_kyc_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create indexes for KYC table
CREATE INDEX IF NOT EXISTS idx_kyc_user_id ON kyc_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_requests(status);
CREATE INDEX IF NOT EXISTS idx_kyc_citizen_id ON kyc_requests(citizen_id);
CREATE INDEX IF NOT EXISTS idx_kyc_verified_by ON kyc_requests(verified_by);
CREATE INDEX IF NOT EXISTS idx_kyc_created_at ON kyc_requests(created_at);

-- Không tạo sẵn KYC test data - dữ liệu sẽ được tạo qua giao diện
