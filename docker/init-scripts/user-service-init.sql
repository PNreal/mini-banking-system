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

-- Insert sample staff users
-- Password: staff123 (hashed with BCrypt)
INSERT INTO users (user_id, email, password_hash, full_name, status, role, employee_code, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'staff1@minibank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn A', 'ACTIVE', 'STAFF', 'STF001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'staff2@minibank.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị B', 'ACTIVE', 'STAFF', 'STF002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert sample customer users
-- Password: customer123 (hashed with BCrypt)
INSERT INTO users (user_id, email, password_hash, full_name, status, role, citizen_id, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'customer1@example.com', '$2a$10$5Ys0qjLjjH7G7K3YKjKjKOeKjKjKjKjKjKjKjKjKjKjKjKjKjKjKj', 'Lê Văn C', 'ACTIVE', 'CUSTOMER', '001234567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'customer2@example.com', '$2a$10$5Ys0qjLjjH7G7K3YKjKjKOeKjKjKjKjKjKjKjKjKjKjKjKjKjKjKj', 'Phạm Thị D', 'ACTIVE', 'CUSTOMER', '001234567891', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'customer3@example.com', '$2a$10$5Ys0qjLjjH7G7K3YKjKjKOeKjKjKjKjKjKjKjKjKjKjKjKjKjKjKj', 'Hoàng Văn E', 'LOCKED', 'CUSTOMER', '001234567892', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'customer4@example.com', '$2a$10$5Ys0qjLjjH7G7K3YKjKjKOeKjKjKjKjKjKjKjKjKjKjKjKjKjKjKj', 'Vũ Thị F', 'FROZEN', 'CUSTOMER', '001234567893', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

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

-- Insert sample KYC requests for testing
-- KYC request cho customer1 (APPROVED)
INSERT INTO kyc_requests (
    kyc_id, user_id, citizen_id, full_name, date_of_birth, gender,
    place_of_issue, date_of_issue, expiry_date,
    permanent_address, current_address, phone_number, email,
    front_id_image_url, back_id_image_url, selfie_image_url,
    status, verified_by, verified_at, notes,
    created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.user_id,
    '001234567890',
    'Lê Văn C',
    '1990-05-15'::DATE,
    'MALE',
    'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
    '2020-01-10'::DATE,
    '2030-01-10'::DATE,
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    '123 Nguyễn Huệ, Quận 1, TP.HCM',
    '0901234567',
    'customer1@example.com',
    '/uploads/kyc/front_001234567890.jpg',
    '/uploads/kyc/back_001234567890.jpg',
    '/uploads/kyc/selfie_001234567890.jpg',
    'APPROVED',
    (SELECT user_id FROM users WHERE email = 'staff1@minibank.com' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    'Xác minh thành công. Thông tin chính xác.',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM users u
WHERE u.email = 'customer1@example.com'
ON CONFLICT DO NOTHING;

-- KYC request cho customer2 (PENDING)
INSERT INTO kyc_requests (
    kyc_id, user_id, citizen_id, full_name, date_of_birth, gender,
    place_of_issue, date_of_issue, expiry_date,
    permanent_address, current_address, phone_number, email,
    front_id_image_url, back_id_image_url, selfie_image_url,
    status, notes,
    created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.user_id,
    '001234567891',
    'Phạm Thị D',
    '1995-08-20'::DATE,
    'FEMALE',
    'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
    '2021-03-15'::DATE,
    '2031-03-15'::DATE,
    '456 Lê Lợi, Quận 3, TP.HCM',
    '456 Lê Lợi, Quận 3, TP.HCM',
    '0902345678',
    'customer2@example.com',
    '/uploads/kyc/front_001234567891.jpg',
    '/uploads/kyc/back_001234567891.jpg',
    '/uploads/kyc/selfie_001234567891.jpg',
    'PENDING',
    'Chờ xác minh',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM users u
WHERE u.email = 'customer2@example.com'
ON CONFLICT DO NOTHING;

-- KYC request cho customer3 (REJECTED)
INSERT INTO kyc_requests (
    kyc_id, user_id, citizen_id, full_name, date_of_birth, gender,
    place_of_issue, date_of_issue, expiry_date,
    permanent_address, current_address, phone_number, email,
    front_id_image_url, back_id_image_url, selfie_image_url,
    status, verified_by, verified_at, rejection_reason, notes,
    created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.user_id,
    '001234567892',
    'Hoàng Văn E',
    '1988-12-10'::DATE,
    'MALE',
    'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
    '2019-06-20'::DATE,
    '2029-06-20'::DATE,
    '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    '789 Trần Hưng Đạo, Quận 5, TP.HCM',
    '0903456789',
    'customer3@example.com',
    '/uploads/kyc/front_001234567892.jpg',
    '/uploads/kyc/back_001234567892.jpg',
    '/uploads/kyc/selfie_001234567892.jpg',
    'REJECTED',
    (SELECT user_id FROM users WHERE email = 'staff2@minibank.com' LIMIT 1),
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    'Hình ảnh CCCD không rõ ràng. Vui lòng chụp lại.',
    'Từ chối do hình ảnh mờ',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM users u
WHERE u.email = 'customer3@example.com'
ON CONFLICT DO NOTHING;

-- KYC request mới cho test.user (PENDING)
INSERT INTO kyc_requests (
    kyc_id, user_id, citizen_id, full_name, date_of_birth, gender,
    place_of_issue, date_of_issue, expiry_date,
    permanent_address, current_address, phone_number, email,
    front_id_image_url, back_id_image_url, selfie_image_url,
    status, notes,
    created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    u.user_id,
    '079099001234',
    'Nguyen Van Test',
    '1992-03-25'::DATE,
    'MALE',
    'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
    '2022-01-01'::DATE,
    '2032-01-01'::DATE,
    '111 Võ Văn Tần, Quận 3, TP.HCM',
    '111 Võ Văn Tần, Quận 3, TP.HCM',
    '0904567890',
    'test.user@example.com',
    '/uploads/kyc/front_079099001234.jpg',
    '/uploads/kyc/back_079099001234.jpg',
    '/uploads/kyc/selfie_079099001234.jpg',
    'PENDING',
    'Đang chờ xác minh',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE u.email = 'test.user@example.com'
ON CONFLICT DO NOTHING;
