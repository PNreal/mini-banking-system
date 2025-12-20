-- Notification Service Database Initialization Script
-- Database: notification_db (PostgreSQL)

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    channel VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);

-- Add comments for documentation
COMMENT ON TABLE notifications IS 'Stores all system notifications sent to users';
COMMENT ON COLUMN notifications.notification_id IS 'Primary key, unique notification identifier';
COMMENT ON COLUMN notifications.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN notifications.type IS 'Notification type (TRANSACTION_SUCCESS, ACCOUNT_CREATED, etc.)';
COMMENT ON COLUMN notifications.title IS 'Notification title';
COMMENT ON COLUMN notifications.message IS 'Notification message content';
COMMENT ON COLUMN notifications.recipient_email IS 'Email address for email notifications';
COMMENT ON COLUMN notifications.recipient_phone IS 'Phone number for SMS notifications';
COMMENT ON COLUMN notifications.status IS 'Status: PENDING, SENT, DELIVERED, FAILED, READ';
COMMENT ON COLUMN notifications.channel IS 'Delivery channel: EMAIL, SMS, PUSH, IN_APP';
COMMENT ON COLUMN notifications.sent_at IS 'Timestamp when notification was sent';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was read by user';
COMMENT ON COLUMN notifications.created_at IS 'Timestamp when notification was created';

-- Insert sample notifications for testing
-- Welcome notification
INSERT INTO notifications (
    notification_id, user_id, type, title, message,
    recipient_email, status, channel, sent_at, created_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'ACCOUNT_CREATED',
    'Chào mừng đến với MiniBank',
    'Tài khoản của bạn đã được tạo thành công. Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.',
    'test.user@example.com',
    'SENT',
    'EMAIL',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM notifications LIMIT 1);

-- Transaction success notification
INSERT INTO notifications (
    notification_id, user_id, type, title, message,
    recipient_email, status, channel, sent_at, created_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'TRANSACTION_SUCCESS',
    'Giao dịch thành công',
    'Bạn vừa thực hiện giao dịch nạp tiền 1,000,000 VND thành công. Số dư hiện tại: 5,000,000 VND.',
    'customer1@example.com',
    'DELIVERED',
    'EMAIL',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'TRANSACTION_SUCCESS' LIMIT 1);

-- Security alert notification
INSERT INTO notifications (
    notification_id, user_id, type, title, message,
    recipient_email, status, channel, created_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'SECURITY_ALERT',
    'Cảnh báo bảo mật',
    'Phát hiện đăng nhập từ thiết bị mới. Nếu không phải bạn, vui lòng đổi mật khẩu ngay.',
    'customer2@example.com',
    'PENDING',
    'EMAIL',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'SECURITY_ALERT' LIMIT 1);

-- Balance low notification
INSERT INTO notifications (
    notification_id, user_id, type, title, message,
    recipient_email, status, channel, sent_at, read_at, created_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'BALANCE_LOW',
    'Số dư tài khoản thấp',
    'Số dư tài khoản của bạn đang thấp hơn 100,000 VND. Vui lòng nạp thêm tiền.',
    'customer3@example.com',
    'READ',
    'IN_APP',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '12 hours',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'BALANCE_LOW' LIMIT 1);

-- Promotional notification
INSERT INTO notifications (
    notification_id, user_id, type, title, message,
    recipient_email, status, channel, sent_at, created_at
)
SELECT 
    gen_random_uuid(),
    gen_random_uuid(),
    'PROMOTIONAL',
    'Ưu đãi đặc biệt',
    'Chuyển khoản miễn phí trong tháng 12. Áp dụng cho tất cả giao dịch dưới 10 triệu VND.',
    'customer4@example.com',
    'SENT',
    'EMAIL',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'PROMOTIONAL' LIMIT 1);

-- Grant permissions (if needed)
-- GRANT ALL PRIVILEGES ON TABLE notifications TO your_user;
