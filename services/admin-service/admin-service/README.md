# Admin Service

Admin Service cho hệ thống Mini Banking System, cung cấp các chức năng quản trị hệ thống.

## Tính năng

- **User Management**: Xem danh sách users, lock/unlock, freeze/unfreeze user accounts
- **System Reports**: Xem báo cáo hệ thống (tổng số users, transactions, v.v.)
- **Admin Logging**: Ghi log tất cả các hành động admin
- **Kafka Integration**: Gửi ADMIN_ACTION events qua Kafka

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- Spring Data JPA
- PostgreSQL
- Apache Kafka
- RestTemplate (cho service-to-service communication)

## API Endpoints

### Admin Endpoints (Yêu cầu Admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/admin/users` | Lấy danh sách tất cả users |
| PATCH | `/api/v1/admin/lock/{userId}` | Khóa tài khoản user |
| PATCH | `/api/v1/admin/unlock/{userId}` | Mở khóa tài khoản user |
| PATCH | `/api/v1/admin/freeze/{userId}` | Đóng băng tài khoản user |
| PATCH | `/api/v1/admin/unfreeze/{userId}` | Gỡ đóng băng tài khoản user |
| GET | `/api/v1/admin/report` | Lấy báo cáo hệ thống |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Health check endpoint |

## Cấu hình

### Database

```properties
spring.datasource.url=jdbc:postgresql://localhost:5434/admin_db
spring.datasource.username=admin_user
spring.datasource.password=admin_password
```

### Kafka

```properties
spring.kafka.bootstrap-servers=localhost:9092
kafka.topics.admin-action=ADMIN_ACTION
```

### External Services

```properties
services.user-service.url=http://localhost:8081
services.account-service.url=http://localhost:8082
services.transaction-service.url=http://localhost:8083
```

## Database Schema

### AdminLog Table

```sql
CREATE TABLE admin_logs (
    admin_log_id UUID PRIMARY KEY,
    admin_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_user UUID NOT NULL,
    time TIMESTAMP NOT NULL
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_target_user ON admin_logs(target_user);
CREATE INDEX idx_admin_logs_time ON admin_logs(time);
```

## Service Integration

Admin Service giao tiếp với các services khác:

1. **User Service**: Lấy danh sách users
2. **Account Service**: Lock/unlock, freeze/unfreeze accounts
3. **Kafka**: Gửi ADMIN_ACTION events để log-service ghi log

## Authentication

Tất cả các endpoints yêu cầu:
- JWT token trong header `Authorization: Bearer <token>`
- Admin ID trong header `X-User-Id` (được API Gateway set)
- Admin role được validate bởi API Gateway

## Request/Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "message": "User locked"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "LOCK_FAILED",
    "message": "Failed to lock user: ...",
    "timestamp": "2025-12-04T08:30:00",
    "path": "/api/v1/admin/lock/{userId}"
  }
}
```

## Cấu trúc Project

```
admin-service/
├── src/
│   ├── main/
│   │   ├── java/com/minibank/adminservice/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── exception/       # Exception handlers
│   │   │   ├── repository/     # JPA repositories
│   │   │   └── service/         # Business logic
│   │   └── resources/
│   │       ├── application.properties          # Local config
│   │       └── application-docker.properties   # Docker config
│   └── test/
├── Dockerfile                    # Docker image definition
├── docker-compose.yml            # Docker Compose configuration
├── pom.xml
└── README.md
```

## Docker Configuration

### Dockerfile
Service sử dụng multi-stage build để tối ưu kích thước image:
- Stage 1: Build với Maven
- Stage 2: Runtime với JRE Alpine (nhẹ hơn)

### docker-compose.yml
File này định nghĩa:
- **admin-service**: Spring Boot application
- **postgres**: PostgreSQL 15 database
- **kafka**: Apache Kafka broker
- **zookeeper**: Zookeeper cho Kafka

Tất cả services được cấu hình với health checks và dependencies để đảm bảo khởi động đúng thứ tự.

### Environment Variables

Khi chạy bằng Docker, các biến môi trường sau có thể được override:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/admin_db
SPRING_DATASOURCE_USERNAME=admin_user
SPRING_DATASOURCE_PASSWORD=admin_password
SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092
SPRING_PROFILES_ACTIVE=docker
```

## Chạy Service

### Cách 1: Chạy bằng Docker (Khuyến nghị)

Service đã được cấu hình để chạy bằng Docker với Docker Compose, bao gồm tất cả dependencies (PostgreSQL, Kafka, Zookeeper).

#### Yêu cầu
- Docker Desktop hoặc Docker Engine đã được cài đặt
- Docker Compose đã được cài đặt

#### Các bước chạy

1. **Di chuyển vào thư mục service:**
```bash
cd services/admin-service/admin-service
```

2. **Khởi động tất cả services bằng Docker Compose:**
```bash
docker-compose up -d
```

Lệnh này sẽ:
- Build Docker image cho admin-service
- Khởi động PostgreSQL database (port 5434)
- Khởi động Zookeeper (port 2182)
- Khởi động Kafka (port 9094)
- Khởi động admin-service (port 8084)

3. **Kiểm tra trạng thái các containers:**
```bash
docker ps --filter "name=admin"
```

4. **Xem logs của admin-service:**
```bash
docker logs admin-service
# Hoặc xem logs real-time
docker logs -f admin-service
```

5. **Dừng tất cả services:**
```bash
docker-compose down
```

6. **Dừng và xóa volumes (xóa dữ liệu database):**
```bash
docker-compose down -v
```

#### Các lệnh Docker hữu ích khác

```bash
# Restart admin-service
docker-compose restart admin-service

# Xem logs của tất cả services
docker-compose logs

# Rebuild và khởi động lại
docker-compose up -d --build

# Kiểm tra health check
curl http://localhost:8084/actuator/health
```

#### Ports được sử dụng

| Service | Port | Mô tả |
|---------|------|-------|
| Admin Service | 8084 | REST API endpoint |
| PostgreSQL | 5434 | Database (mapped từ 5432) |
| Kafka | 9094 | Kafka broker |
| Zookeeper | 2182 | Zookeeper cho Kafka |

### Cách 2: Chạy bằng Maven (Local Development)

Nếu bạn muốn chạy service trực tiếp trên máy local:

#### Yêu cầu
- Java 17+
- Maven 3.6+
- PostgreSQL đang chạy trên port 5434
- Kafka đang chạy trên port 9092 (hoặc cập nhật trong `application.properties`)

#### Các bước

1. **Cập nhật cấu hình trong `application.properties`** nếu cần:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5434/admin_db
spring.kafka.bootstrap-servers=localhost:9092
```

2. **Build và chạy:**
```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

Service sẽ chạy trên port **8084**.

## Troubleshooting

### Docker Issues

**Port đã được sử dụng:**
```bash
# Kiểm tra port nào đang được sử dụng
netstat -ano | findstr :8084
netstat -ano | findstr :5434
netstat -ano | findstr :9094

# Hoặc thay đổi port trong docker-compose.yml
```

**Container không khởi động:**
```bash
# Xem logs chi tiết
docker logs admin-service
docker logs admin-postgres
docker logs admin-kafka

# Kiểm tra health status
docker ps -a
```

**Database connection issues:**
- Đảm bảo PostgreSQL container đã healthy trước khi admin-service khởi động
- Kiểm tra network connectivity giữa containers: `docker network inspect admin-service_default`

**Kafka connection issues:**
- Đảm bảo Zookeeper đã khởi động trước Kafka
- Kiểm tra Kafka health check: `docker exec admin-kafka kafka-broker-api-versions --bootstrap-server localhost:9094`

### Local Development Issues

**Database connection failed:**
- Kiểm tra PostgreSQL đang chạy: `pg_isready -p 5434`
- Kiểm tra credentials trong `application.properties`

**Kafka connection failed:**
- Kiểm tra Kafka đang chạy và accessible tại `localhost:9092`
- Kiểm tra Zookeeper đang chạy

## Lưu ý

- Admin Service cần User Service và Account Service đang chạy để hoạt động đầy đủ
- Khi chạy bằng Docker, tất cả dependencies (PostgreSQL, Kafka) được tự động khởi động
- Khi chạy local, bạn cần tự khởi động PostgreSQL và Kafka
- Database schema được tự động tạo bởi Hibernate (`spring.jpa.hibernate.ddl-auto=update`)
- Service-to-service authentication sử dụng header `X-Internal-Secret`
- Docker Compose sử dụng profile `docker` để load `application-docker.properties`

