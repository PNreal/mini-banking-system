# API Gateway Service

API Gateway cho hệ thống Mini Banking System, đóng vai trò là điểm vào duy nhất cho tất cả các microservices.

## Tính năng

- **Routing**: Định tuyến requests đến các microservices phù hợp
- **JWT Authentication**: Xác thực và authorization với JWT tokens
- **Request Forwarding**: Forward requests với headers và body đầy đủ
- **CORS Configuration**: Hỗ trợ Cross-Origin Resource Sharing
- **Logging**: Ghi log tất cả requests và responses
- **Error Handling**: Xử lý lỗi tập trung

## Tech Stack

- Java 17
- Spring Boot 4.0.0
- Spring Cloud Gateway (WebMVC)
- Spring Security
- JWT (jjwt 0.12.5)
- RestTemplate

## Cấu hình

### Service URLs

Các service URLs được cấu hình trong `application.properties`:

```properties
gateway.services.user-service=http://localhost:8081
gateway.services.account-service=http://localhost:8082
gateway.services.transaction-service=http://localhost:8083
gateway.services.admin-service=http://localhost:8084
gateway.services.log-service=http://localhost:8085
gateway.services.notification-service=http://localhost:8086
```

### JWT Configuration

```properties
jwt.secret=your-secret-key-change-in-production-min-256-bits
jwt.expiration=86400000
```

## API Routes

| Path | Service | Description |
|------|---------|-------------|
| `/api/v1/users/**` | User Service | User authentication và management |
| `/api/v1/account/**` | Account Service | Account management |
| `/api/v1/transactions/**` | Transaction Service | Financial transactions |
| `/api/v1/admin/**` | Admin Service | Admin operations |
| `/api/v1/logs/**` | Log Service | User logs |
| `/api/v1/admin/logs/**` | Log Service | Admin logs |
| `/api/v1/notifications/**` | Notification Service | Notifications |

## Public Endpoints (Không cần authentication)

- `POST /api/v1/users/register`
- `POST /api/v1/users/login`
- `POST /api/v1/users/forgot-password`
- `POST /api/v1/users/reset-password`
- `GET /api/v1/health`
- `GET /actuator/health`
- `GET /actuator/info`

## Authentication

Tất cả các endpoints khác yêu cầu JWT token trong header:

```
Authorization: Bearer <jwt-token>
```

Gateway sẽ:
1. Validate JWT token
2. Extract userId và role từ token
3. Forward userId và role trong headers `X-User-Id` và `X-User-Role` đến downstream services

## Cấu trúc Project

```
api-gateway/
├── src/
│   ├── main/
│   │   ├── java/com/minibank/api_gateway/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── filter/          # Request filters
│   │   │   ├── service/         # Gateway service logic
│   │   │   ├── util/            # Utility classes (JWT)
│   │   │   └── exception/       # Exception handlers
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
└── README.md
```

## Chạy Service

```bash
# Build
mvn clean install

# Run
mvn spring-boot:run
```

Service sẽ chạy trên port **8080**.

## Health Check

```bash
curl http://localhost:8080/api/v1/health
```

## Lưu ý

- JWT secret key phải được thay đổi trong production
- Service URLs có thể được thay thế bằng Eureka service discovery trong tương lai
- Timeout được cấu hình: Connect 5s, Read 10s

