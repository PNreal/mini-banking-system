# Log Service

Microservice để quản lý và lưu trữ logs của hệ thống banking.

## Tính năng

- Lưu trữ logs từ các services khác qua Kafka
- API để truy vấn logs với pagination và filtering
- Search logs theo user, action, time range
- Statistics về logs
- Health check endpoint

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- PostgreSQL
- Apache Kafka
- Maven

## API Endpoints

### Admin Endpoints

- `GET /api/v1/admin/logs` - Lấy tất cả logs
- `GET /api/v1/admin/logs/search` - Tìm kiếm logs với filters
- `GET /api/v1/admin/logs/statistics` - Lấy thống kê logs

### User Endpoints

- `GET /api/v1/logs/me` - Lấy logs của user hiện tại

### Health Check

- `GET /api/v1/health` - Health check endpoint
- `GET /actuator/health` - Spring Boot Actuator health

## Kafka Topics

Service lắng nghe các topics:
- `USER_EVENT`
- `TRANSACTION_COMPLETED`
- `ADMIN_ACTION`
- `ACCOUNT_EVENT`

## Cấu trúc Project

```
log-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/minibank/logservice/
│   │   │       ├── config/          # Configuration classes
│   │   │       ├── controller/      # REST controllers
│   │   │       ├── consumer/        # Kafka consumers
│   │   │       ├── dto/             # Data Transfer Objects
│   │   │       ├── entity/          # JPA entities
│   │   │       ├── exception/       # Exception handlers
│   │   │       ├── repository/      # Data repositories
│   │   │       ├── service/         # Business logic
│   │   │       ├── util/            # Utility classes
│   │   │       └── validation/      # Custom validators
│   │   └── resources/
│   │       ├── application.properties          # Local development
│   │       └── application-docker.properties   # Docker environment
│   └── test/                        # Unit tests
├── Dockerfile                        # Docker image build
├── docker-compose.yml                # Docker Compose configuration
├── pom.xml
└── README.md
```

## Chạy Service

### Chạy bằng Maven (Local)

Xem chi tiết trong [RUN_GUIDE.md](./RUN_GUIDE.md) hoặc [QUICK_START.md](./QUICK_START.md)

### Chạy bằng Docker

```bash
# Khởi động tất cả services (PostgreSQL, Kafka, Log Service)
docker-compose up -d

# Xem logs
docker-compose logs -f log-service

# Dừng services
docker-compose down
```

**Lưu ý:** Khi chạy bằng Docker, service sẽ tự động sử dụng `application-docker.properties` với cấu hình phù hợp cho môi trường container.

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=LogServiceTest
```

## Build

```bash
# Build JAR
mvn clean package

# Run JAR
java -jar target/log-service-0.0.1-SNAPSHOT.jar
```

## Configuration

Xem `application.properties` để cấu hình:
- Database connection
- Kafka settings
- Server port
- Logging levels

## License

Internal project

