-- Transaction Service Database Initialization Script
-- Database: transaction_db

-- Bảng counters sẽ được tạo tự động bởi Hibernate
-- Script này chỉ để tham khảo cấu trúc

-- CREATE TABLE IF NOT EXISTS counters (
--     counter_id UUID PRIMARY KEY,
--     counter_code VARCHAR(20) NOT NULL UNIQUE,
--     name VARCHAR(100) NOT NULL,
--     address VARCHAR(200),
--     max_staff INTEGER NOT NULL,
--     admin_user_id UUID,
--     is_active BOOLEAN NOT NULL DEFAULT TRUE,
--     created_at TIMESTAMP WITH TIME ZONE NOT NULL,
--     updated_at TIMESTAMP WITH TIME ZONE NOT NULL
-- );

-- CREATE TABLE IF NOT EXISTS counter_staff (
--     counter_staff_id UUID PRIMARY KEY,
--     counter_id UUID NOT NULL,
--     user_id UUID NOT NULL,
--     is_active BOOLEAN NOT NULL DEFAULT TRUE,
--     created_at TIMESTAMP WITH TIME ZONE NOT NULL,
--     updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
--     CONSTRAINT uk_counter_user UNIQUE (counter_id, user_id)
-- );

-- Dữ liệu mẫu sẽ được tạo bởi CounterDataInitializer.java khi service khởi động
