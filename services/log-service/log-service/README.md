# Log Service

Microservice để ghi log và lưu vết hành động trong hệ thống Mini Banking.

## Yêu Cầu

- Java 17+
- Maven 3.6+
- Docker & Docker Compose

## Cấu Hình Docker

Service này sử dụng Docker để chạy PostgreSQL và Kafka. Đảm bảo Docker Desktop đang chạy trước khi start service.

### Khởi động Docker services:

Từ thư mục root của dự án:
```bash
docker-compose up -d
```

Điều này sẽ khởi động:
- PostgreSQL (port 5433) - Database cho log service
- Kafka (port 9092) - Message broker
- Zookeeper (port 2181) - Required by Kafka

### Kiểm tra services đang chạy:
```bash
docker-compose ps
```

### Xem logs:
```bash
docker-compose logs -f
```

## Chạy Application

### 1. Build project:
```bash
mvn clean install
```

### 2. Run application:
```bash
mvn spring-boot:run
```

Hoặc chạy từ IDE:
- Main class: `com.minibank.logservice.LogServiceApplication`

### 3. Kiểm tra service đang chạy:
- Health check: `http://localhost:8085/actuator/health` (nếu có actuator)
- API base: `http://localhost:8085/api/v1`

## Cấu Hình

File cấu hình: `src/main/resources/application.properties`

### Database:
- Host: `localhost:5433`
- Database: `log_db`
- Username: `log_user`
- Password: `log_password`

### Kafka:
- Bootstrap servers: `localhost:9092`
- Consumer group: `log-service-group`

## API Endpoints

### Admin Endpoints (ADMIN only):
- `GET /api/v1/admin/logs` - Lấy tất cả logs

### User Endpoints:
- `GET /api/v1/logs/me` - Lấy logs của user hiện tại

## Kafka Topics

Service này lắng nghe các topics sau:
- `USER_EVENT` - Events từ User Service
- `TRANSACTION_COMPLETED` - Events từ Transaction Service  
- `ADMIN_ACTION` - Events từ Admin Service
- `ACCOUNT_EVENT` - Events từ Account Service

## Database Schema

Bảng `log`:
- `log_id` (UUID, PK)
- `user_id` (UUID, FK)
- `action` (VARCHAR(255))
- `detail` (TEXT)
- `time` (TIMESTAMP)

Schema được tự động tạo khi PostgreSQL container khởi động lần đầu.

## Troubleshooting

### Database connection error:
1. Kiểm tra PostgreSQL container đang chạy: `docker-compose ps postgres-log`
2. Kiểm tra logs: `docker-compose logs postgres-log`
3. Đảm bảo port 5433 không bị chiếm dụng

### Kafka connection error:
1. Kiểm tra Kafka container: `docker-compose ps kafka`
2. Kiểm tra Zookeeper: `docker-compose ps zookeeper`
3. Xem logs: `docker-compose logs kafka`

### Port conflicts:
Nếu port 8085, 5433, hoặc 9092 đã được sử dụng, thay đổi trong:
- `application.properties` (server.port, datasource.url, kafka.bootstrap-servers)
- `docker-compose.yml` (port mappings)

