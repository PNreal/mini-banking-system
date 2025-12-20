# Notification System - Tổng quan hệ thống thông báo

## 📊 Database Schema

### Bảng: `notifications`

| Trường | Kiểu | Mô tả | Ràng buộc |
|--------|------|-------|-----------|
| notification_id | UUID | Primary key | NOT NULL, AUTO |
| user_id | UUID | User nhận thông báo | NOT NULL |
| type | VARCHAR(50) | Loại thông báo | NOT NULL, ENUM |
| title | VARCHAR(200) | Tiêu đề | NOT NULL |
| message | TEXT | Nội dung | NOT NULL |
| recipient_email | VARCHAR(255) | Email nhận | NULL |
| recipient_phone | VARCHAR(20) | SĐT nhận | NULL |
| status | VARCHAR(20) | Trạng thái | NOT NULL, ENUM |
| channel | VARCHAR(20) | Kênh gửi | NOT NULL, ENUM |
| sent_at | TIMESTAMP | Thời điểm gửi | NULL |
| read_at | TIMESTAMP | Thời điểm đọc | NULL |
| created_at | TIMESTAMP | Thời gian tạo | NOT NULL |

### Indexes:
- `idx_notifications_user_id` - Tìm theo user
- `idx_notifications_status` - Lọc theo trạng thái
- `idx_notifications_type` - Lọc theo loại
- `idx_notifications_created_at` - Sắp xếp theo thời gian
- `idx_notifications_channel` - Lọc theo kênh

---

## 🎯 Enums

### NotificationType (12 loại)

| Enum | Mô tả | Use Case |
|------|-------|----------|
| TRANSACTION_SUCCESS | Giao dịch thành công | Sau khi deposit/withdraw/transfer thành công |
| TRANSACTION_FAILED | Giao dịch thất bại | Khi giao dịch bị lỗi |
| ACCOUNT_CREATED | Tài khoản được tạo | Sau khi đăng ký thành công |
| ACCOUNT_LOCKED | Tài khoản bị khóa | Admin khóa tài khoản |
| ACCOUNT_UNLOCKED | Tài khoản được mở khóa | Admin mở khóa tài khoản |
| ACCOUNT_FROZEN | Tài khoản bị đóng băng | Admin/User đóng băng tài khoản |
| ACCOUNT_UNFROZEN | Tài khoản được mở băng | Admin mở băng tài khoản |
| BALANCE_LOW | Số dư thấp | Khi số dư < ngưỡng cảnh báo |
| PAYMENT_DUE | Thanh toán đến hạn | Nhắc nhở thanh toán |
| SECURITY_ALERT | Cảnh báo bảo mật | Đăng nhập từ thiết bị mới, thay đổi mật khẩu |
| SYSTEM_UPDATE | Cập nhật hệ thống | Thông báo bảo trì, nâng cấp |
| PROMOTIONAL | Khuyến mãi | Ưu đãi, chương trình marketing |

### NotificationStatus (5 trạng thái)

| Status | Mô tả | Workflow |
|--------|-------|----------|
| PENDING | Chờ gửi | Mới tạo, chưa gửi |
| SENT | Đã gửi | Đã gửi qua channel |
| DELIVERED | Đã nhận | Xác nhận user nhận được |
| FAILED | Thất bại | Gửi không thành công |
| READ | Đã đọc | User đã đọc |

### NotificationChannel (4 kênh)

| Channel | Mô tả | Yêu cầu |
|---------|-------|---------|
| EMAIL | Email | recipient_email bắt buộc |
| SMS | Tin nhắn | recipient_phone bắt buộc |
| PUSH | Push notification | Device token (từ mobile app) |
| IN_APP | Thông báo trong app | Không yêu cầu thêm |

---

## 🏗️ Architecture

### Components:

```
┌─────────────────────────────────────────────────────────┐
│                  Notification Service                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Kafka      │  │  REST API    │  │  WebSocket   │  │
│  │  Consumer    │  │  Controller  │  │  Controller  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┼──────────────────┘          │
│                            ▼                             │
│                  ┌──────────────────┐                    │
│                  │ NotificationService│                   │
│                  └─────────┬────────┘                    │
│                            │                             │
│         ┌──────────────────┼──────────────────┐          │
│         ▼                  ▼                  ▼          │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐      │
│  │   Email    │   │    SMS     │   │    Push    │      │
│  │  Service   │   │  Service   │   │  Service   │      │
│  └────────────┘   └────────────┘   └────────────┘      │
│                                                           │
│                  ┌──────────────────┐                    │
│                  │  WebSocket       │                    │
│                  │  Service         │                    │
│                  └──────────────────┘                    │
│                                                           │
│                  ┌──────────────────┐                    │
│                  │  Retry           │                    │
│                  │  Scheduler       │                    │
│                  └──────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflow

### 1. Tạo Notification

```
Event (Kafka) → Consumer → NotificationService.createNotification()
                              ↓
                    Save to Database (PENDING)
                              ↓
                    Push to WebSocket (real-time)
                              ↓
                    Send Async (EMAIL/SMS/PUSH)
                              ↓
                    Update Status (SENT/FAILED)
```

### 2. Gửi Notification

**Email:**
```
NotificationService → JavaMailSender
                    → Build HTML template
                    → Send email
                    → Update status (SENT/FAILED)
```

**SMS:**
```
NotificationService → SmsService
                    → Send via SMS provider
                    → Update status (SENT/FAILED)
```

**Push:**
```
NotificationService → PushNotificationService
                    → Send to device token
                    → Update status (SENT/FAILED)
```

**In-App:**
```
NotificationService → WebSocketService
                    → Push to connected clients
                    → Status = SENT immediately
```

### 3. Đọc Notification

```
User opens app → GET /api/notifications
               → Display unread count
               → User clicks notification
               → POST /api/notifications/{id}/read
               → Update status = READ, read_at = now
```

---

## 📡 API Endpoints

### Customer APIs:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/notifications` | Lấy tất cả notifications |
| GET | `/api/notifications?page=0&size=10` | Lấy với phân trang |
| GET | `/api/notifications/unread` | Lấy chưa đọc |
| GET | `/api/notifications/{id}` | Lấy chi tiết |
| POST | `/api/notifications/{id}/read` | Đánh dấu đã đọc |
| POST | `/api/notifications/read-all` | Đánh dấu tất cả đã đọc |
| GET | `/api/notifications/stats` | Thống kê |

### Internal APIs:

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/internal/notifications` | Tạo notification mới |
| POST | `/internal/notifications/{id}/resend` | Gửi lại |

### WebSocket:

| Endpoint | Mô tả |
|----------|-------|
| `/ws/notifications` | WebSocket connection |
| `/topic/notifications/{userId}` | Subscribe theo user |

---

## 🔧 Repository Methods

### NotificationRepository:

```java
// Tìm theo user
List<Notification> findByUserId(UUID userId)
Page<Notification> findByUserId(UUID userId, Pageable pageable)

// Tìm theo status
List<Notification> findByUserIdAndStatus(UUID userId, NotificationStatus status)

// Tìm theo type
List<Notification> findByUserIdAndType(UUID userId, NotificationType type)

// Tìm theo channel
List<Notification> findByUserIdAndChannel(UUID userId, NotificationChannel channel)

// Đã đọc / Chưa đọc
List<Notification> findReadNotificationsByUserId(UUID userId)
List<Notification> findUnreadNotificationsByUserId(UUID userId)
long countUnreadByUserId(UUID userId)

// Pending notifications (cho retry)
List<Notification> findPendingNotificationsBefore(LocalDateTime beforeDate)

// Tìm theo khoảng thời gian
List<Notification> findByUserIdAndDateRange(UUID userId, LocalDateTime start, LocalDateTime end)
```

---

## 🎨 Features

### ✅ Đã implement:

1. **Multi-channel delivery**
   - Email (JavaMailSender)
   - SMS (SmsService)
   - Push (PushNotificationService)
   - In-App (WebSocket)

2. **Real-time notifications**
   - WebSocket integration
   - Push to connected clients
   - Auto-update UI

3. **Async processing**
   - @Async annotation
   - Non-blocking sends
   - Background processing

4. **Retry mechanism**
   - NotificationRetryScheduler
   - Auto-retry failed notifications
   - Configurable retry policy

5. **Rich content**
   - HTML email templates
   - Formatted messages
   - Custom styling

6. **Statistics**
   - Total, unread, read counts
   - Sent, failed counts
   - Per-user stats

7. **Pagination**
   - Page-based queries
   - Configurable page size
   - Sort by created_at

8. **Filtering**
   - By type
   - By status
   - By channel
   - By date range

---

## 📝 Sample Data

Init script tạo 5 notifications mẫu:

1. **ACCOUNT_CREATED** - Welcome email (SENT)
2. **TRANSACTION_SUCCESS** - Deposit success (DELIVERED)
3. **SECURITY_ALERT** - Login from new device (PENDING)
4. **BALANCE_LOW** - Low balance warning (READ)
5. **PROMOTIONAL** - Special offer (SENT)

---

## 🔐 Security

### Authentication:
- WebSocket: Token-based auth (WebSocketAuthInterceptor)
- REST API: JWT token in header
- User can only access their own notifications

### Authorization:
- User: Read own notifications
- Admin: Can create notifications for any user
- Internal services: Can create via internal API

---

## 🚀 Usage Examples

### 1. Tạo notification (Internal):

```java
NotificationRequest request = NotificationRequest.builder()
    .userId(userId)
    .type(NotificationType.TRANSACTION_SUCCESS)
    .title("Giao dịch thành công")
    .message("Bạn vừa nạp 1,000,000 VND thành công")
    .channel(NotificationChannel.EMAIL)
    .recipientEmail("user@example.com")
    .build();

notificationService.createNotification(request);
```

### 2. Lấy unread notifications:

```java
List<NotificationResponse> unread = 
    notificationService.getUnreadNotificationsByUserId(userId);
```

### 3. Đánh dấu đã đọc:

```java
notificationService.markAsRead(notificationId);
```

### 4. Thống kê:

```java
NotificationStatsResponse stats = 
    notificationService.getNotificationStats(userId);
// stats.getUnreadCount()
// stats.getTotalNotifications()
```

---

## 🔄 Integration với Services khác

### Transaction Service:
```java
// Sau khi giao dịch thành công
kafkaTemplate.send("TRANSACTION_COMPLETED", event);
// → NotificationEventConsumer nhận
// → Tạo notification TRANSACTION_SUCCESS
```

### User Service:
```java
// Sau khi tạo user
kafkaTemplate.send("USER_EVENT", event);
// → Tạo notification ACCOUNT_CREATED
```

### Admin Service:
```java
// Sau khi admin lock account
kafkaTemplate.send("ADMIN_ACTION", event);
// → Tạo notification ACCOUNT_LOCKED
```

---

## ⚙️ Configuration

### Email (application.yml):
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

### WebSocket:
```yaml
websocket:
  allowed-origins: http://localhost:3000
  endpoint: /ws
```

### Async:
```yaml
notification:
  async:
    core-pool-size: 5
    max-pool-size: 10
    queue-capacity: 100
```

---

## 📊 Performance

### Indexes giúp:
- Tìm notifications của user nhanh (user_id)
- Lọc theo status hiệu quả (status)
- Sort theo thời gian tối ưu (created_at)

### Async processing:
- Không block main thread
- Gửi email/SMS background
- Response nhanh cho client

### WebSocket:
- Real-time delivery
- Không cần polling
- Tiết kiệm bandwidth

---

## 🐛 Error Handling

### Failed notifications:
- Status = FAILED
- Retry scheduler tự động thử lại
- Admin có thể resend manually

### Email errors:
- Log error details
- Update status
- Notify admin if critical

### WebSocket disconnect:
- Notifications vẫn lưu DB
- User nhận khi reconnect
- Không mất thông báo

---

## 📈 Future Enhancements

1. **Template system** - Notification templates
2. **Preferences** - User notification preferences
3. **Batching** - Batch multiple notifications
4. **Priority** - High/Medium/Low priority
5. **Scheduling** - Schedule notifications
6. **Analytics** - Open rate, click rate
7. **A/B Testing** - Test different messages
8. **Rich media** - Images, videos in notifications

---

## ✅ Checklist

- [x] Database schema
- [x] Entity & Repository
- [x] Service layer
- [x] REST API
- [x] WebSocket
- [x] Email service
- [x] SMS service
- [x] Push notification service
- [x] Kafka consumer
- [x] Retry scheduler
- [x] Init script với sample data
- [x] Documentation
- [ ] Frontend UI
- [ ] Unit tests
- [ ] Integration tests
