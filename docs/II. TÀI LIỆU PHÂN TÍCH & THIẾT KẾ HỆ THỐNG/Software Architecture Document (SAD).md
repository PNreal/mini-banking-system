# **SOFTWARE ARCHITECTURE DOCUMENT (SAD)**

### **Dự án: Mini Banking System**

## **1. Giới thiệu** {#giới-thiệu}

### **1.1. Mục tiêu** {#mục-tiêu}

Tài liệu mô tả chi tiết kiến trúc phần mềm của hệ thống Mini Banking.  
Mục tiêu chính:

- Làm rõ các thành phần, cấu trúc, luồng dữ liệu và công nghệ.

- Là cơ sở cho đội dev phát triển, kiểm thử, triển khai và bảo trì hệ
  > thống.

- Đảm bảo tính nhất quán giữa thiết kế nghiệp vụ (BRD, SRS) và hiện thực
  > kỹ thuật.

### **1.2. Phạm vi** {#phạm-vi}

Hệ thống Mini Banking cung cấp các chức năng ngân hàng cơ bản:

- Quản lý người dùng.

- Quản lý tài khoản.

- Thực hiện nạp, rút, chuyển tiền.

- Lưu trữ lịch sử giao dịch.

- Gửi thông báo cho người dùng.

- Quản trị viên kiểm soát toàn hệ thống.

## **2. Kiến trúc tổng quan** {#kiến-trúc-tổng-quan}

### **2.1. Mô hình tổng thể** {#mô-hình-tổng-thể}

Hệ thống áp dụng **Microservice Architecture**.

- Mỗi dịch vụ chịu trách nhiệm cho một domain nghiệp vụ riêng.

- Giao tiếp qua **REST API** và **Kafka message queue**.

- Mỗi service có cơ sở dữ liệu riêng (Database per Service).

- API Gateway đóng vai trò entry point duy nhất.

### **2.2. Sơ đồ logic** {#sơ-đồ-logic}

![](media/image1.png){width="6.267716535433071in"
height="5.847222222222222in"}

## **3. Thành phần hệ thống** {#thành-phần-hệ-thống}

| **Thành phần**           | **Mô tả**                                 | **Database**   |     |
|--------------------------|-------------------------------------------|----------------|-----|
| **User Service**         | Đăng ký, đăng nhập, xác thực JWT.         | user_db        |     |
| **Account Service**      | Tạo và quản lý tài khoản ngân hàng.       | account_db     |     |
| **Transaction Service**  | Nạp, rút, chuyển tiền nội bộ.             | transaction_db |     |
| **Notification Service** | Gửi thông báo Email/SMS khi có giao dịch. | notif_db       |     |
| **Admin Service**        | Dashboard quản trị, giám sát hệ thống.    | admin_db       |     |
| **Audit/Log Service**    | Ghi log, lưu vết hành động và sự kiện.    | log_db         |     |

## **4. Giao tiếp giữa các service** {#giao-tiếp-giữa-các-service}

| **Loại giao tiếp** | **Mô tả**                                                      | **Công nghệ**    |
|--------------------|----------------------------------------------------------------|------------------|
| REST API           | Dữ liệu đồng bộ giữa các service (User, Account, Transaction). | HTTPS + JSON     |
| Event-driven       | Truyền sự kiện bất đồng bộ (transaction done, notify).         | Kafka            |
| WebSocket          | Thông báo real-time cho người dùng.                            | WebSocket        |
| Auth (Client)      | JWT (Access & Refresh token) cho client.                       | JSON Web Token   |
| Auth (Service)     | X-Internal-Secret header cho service-to-service.              | Service Token    |
| Service Discovery  | Định tuyến động giữa các service.                              | Consul / Eureka  |

## **5. Luồng xử lý chính** {#luồng-xử-lý-chính}

### **5.1. Đăng nhập người dùng** {#đăng-nhập-người-dùng}

1.  Client gửi request /api/v1/users/login.

2.  User Service xác thực thông tin.

3.  Trả JWT cho client.

4.  Các request khác phải kèm JWT qua API Gateway.

### **5.2. Giao dịch chuyển tiền** {#giao-dịch-chuyển-tiền}

1.  Client gọi API /api/v1/transactions/transfer (với JWT token).

2.  Transaction Service xác thực token và kiểm tra quyền truy cập.

3.  Transaction Service gọi Account Service `/internal/accounts/transfer` với:
    - fromAccountId, toAccountId, amount
    - X-Internal-Secret header để xác thực service-to-service

4.  Account Service thực hiện trong một database transaction ACID:
    - SELECT FOR UPDATE để lock cả 2 tài khoản (pessimistic locking)
    - Kiểm tra sender account status = ACTIVE
    - Kiểm tra receiver account tồn tại và status = ACTIVE hoặc FROZEN
    - Kiểm tra số dư người gửi đủ
    - Trừ số dư người gửi, cộng số dư người nhận
    - Commit transaction (hoặc rollback nếu lỗi)

5.  Transaction Service tạo record transaction trong transaction_db.

6.  Transaction Service gửi sự kiện TRANSACTION_COMPLETED đến Kafka.

7.  Notification Service nhận event và gửi thông báo (Email/SMS/WebSocket).

8.  Log Service nhận event và lưu nhật ký.

**Lưu ý quan trọng:**
- Phải đảm bảo ACID transaction để tránh mất tiền
- Sử dụng pessimistic locking để tránh race condition
- Validation đầy đủ account status trước khi thực hiện giao dịch

### **5.3. Nạp tiền (Deposit)** {#nạp-tiền-deposit}

1.  Client gọi API /api/v1/transactions/deposit (với JWT token).

2.  Transaction Service xác thực token.

3.  Transaction Service gọi Account Service để:
    - Kiểm tra account status phải ACTIVE
    - Update balance (trong database transaction)

4.  Transaction Service tạo record transaction.

5.  Gửi sự kiện TRANSACTION_COMPLETED đến Kafka.

6.  Notification và Log Service xử lý event.

### **5.4. Rút tiền (Withdraw)** {#rút-tiền-withdraw}

1.  Client gọi API /api/v1/transactions/withdraw (với JWT token).

2.  Transaction Service xác thực token.

3.  Transaction Service gọi Account Service với pessimistic locking:
    - Kiểm tra account status phải ACTIVE
    - Kiểm tra số dư đủ (SELECT FOR UPDATE)
    - Trừ số dư (trong database transaction)

4.  Transaction Service tạo record transaction.

5.  Gửi sự kiện TRANSACTION_COMPLETED đến Kafka.

6.  Notification và Log Service xử lý event.

## **6. Xử lý lỗi và Retry** {#xử-lý-lỗi-và-retry}

### **6.1. REST API Error Handling** {#rest-api-error-handling}

| **HTTP Status** | **Xử lý**                    | **Ví dụ** |
|-----------------|------------------------------|-----------|
| 400             | Trả về ngay cho caller       | Validation error, account status invalid |
| 401             | Trả về ngay cho caller       | JWT token invalid |
| 404             | Ghi log + trả lỗi business   | Account not found |
| 500             | Retry 3 lần (exponential backoff) | Internal server error |
| 503             | Queue lại hoặc retry 5 lần   | Service unavailable |

**Retry Strategy:**
- Exponential backoff: 1s, 2s, 4s
- Max retries: 3 lần cho 500, 5 lần cho 503
- Timeout: ≤ 3 giây mỗi request

### **6.2. Kafka Event Handling** {#kafka-event-handling}

- Consumer phải **idempotent** (xử lý nhiều lần vẫn đúng).
- Lưu offset để đảm bảo không mất sự kiện.
- Retry queue với exponential backoff cho các event thất bại.
- Dead letter queue cho các event không thể xử lý sau nhiều lần retry.

### **6.3. Distributed Transaction Pattern** {#distributed-transaction-pattern}

**Phương án ưu tiên:** Gộp decrease/increase vào một API call với database transaction ở Account Service (đảm bảo ACID).

**Phương án thay thế:** Saga Pattern với compensating transactions nếu không thể gộp API:
- Choreography: Các service tự điều phối qua events
- Orchestration: Một service điều phối các bước
- Compensating transactions để rollback khi có lỗi

## **7. Hiệu năng và giám sát** {#hiệu-năng-và-giám-sát}

| **Hạng mục**     | **Giải pháp**                               |
|------------------|---------------------------------------------|
| Caching          | Redis                                       |
| Giám sát         | Prometheus + Grafana                        |
| Log tập trung    | ELK Stack (Elastic + Logstash + Kibana)     |
| Alert            | Grafana Alert / Slack integration           |
| Performance test | k6 / JMeter                                 |
| Benchmark        | 1000 TPS (transactions per second) mục tiêu |

## **8. Cấu trúc dự án (Repository Layout)** {#cấu-trúc-dự-án-repository-layout}

mini-banking/

├── api-gateway/

│ ├── routes/

│ ├── middlewares/

│ └── config/

├── services/

│ ├── user-service/

│ ├── account-service/

│ ├── transaction-service/

│ ├── notification-service/

│ ├── admin-service/

│ └── log-service/

├── common/

│ ├── dto/

│ ├── utils/

│ └── auth/

├── docker/

│ ├── docker-compose.yml

│ └── Dockerfile

└── docs/

├── architecture/

└── api/

## **9. Công nghệ và tiêu chuẩn kỹ thuật** {#công-nghệ-và-tiêu-chuẩn-kỹ-thuật}

| **Hạng mục**     | **Công nghệ sử dụng**  |
|------------------|------------------------|
| Backend          | Spring Boot            |
| Frontend         | React.js / TailwindCSS |
| Database         | PostgreSQL             |
| Message Queue    | Kafka                  |
| Authentication   | JWT                    |
| Containerization | Docker                 |
| CI/CD            | GitHub Actions         |
| Deployment       | Kubernetes             |
| Monitoring       | Prometheus, Grafana    |
| Logging          | ELK Stack              |

## **10. Phi chức năng (Non-Functional Requirements)** {#phi-chức-năng-non-functional-requirements}

| **Thuộc tính**    | **Mục tiêu**                    |
|-------------------|---------------------------------|
| Hiệu năng         | Đáp ứng 1000 TPS (transactions per second) |
| Sẵn sàng          | 99.9% uptime                    |
| Bảo mật           | OWASP Top 10 compliance         |
| Mở rộng           | Scale ngang từng service        |
| Bảo trì           | Module độc lập, CI/CD pipeline  |
| Khả năng phục hồi | Restart tự động, rollback nhanh |
