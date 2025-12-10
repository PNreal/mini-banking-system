# User Service - MiniBank System

User Service là dịch vụ cốt lõi của hệ thống Mini Banking System, chịu trách nhiệm quản lý định danh, xác thực và thông tin người dùng.

## 🌟 Tính năng

- **Authentication**: Đăng ký (Register), Đăng nhập (Login), cấp phát JWT Access Token & Refresh Token.
- **Security**: Đổi mật khẩu, Quên mật khẩu (gửi email thật qua SMTP), Tự khóa tài khoản (Self-freeze).
- **Validation**: Kiểm tra dữ liệu đầu vào (Email, Password) chặt chẽ.

## 🛠 Tech Stack

- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.x / 4.x
- **Database:** MySQL (Chạy qua XAMPP hoặc cài trực tiếp)
- **Security:** Spring Security & JWT
- **Mail:** JavaMailSender (Gmail SMTP)
- **Build Tool:** Maven

## 🔌 API Endpoints

### Public Endpoints (Ai cũng gọi được)

| Method | Endpoint | Mô tả |
|--------|----------|-------------|
| POST | `/api/users/register` | Đăng ký tài khoản mới |
| POST | `/api/users/login` | Đăng nhập hệ thống (Trả về Token) |
| POST | `/api/users/forgot-password` | Yêu cầu reset mật khẩu (Gửi Email) |

### Protected Endpoints (Cần Token)

| Method | Endpoint | Mô tả | Headers yêu cầu |
|--------|----------|-------------|-----------------|
| PUT | `/api/users/self-freeze` | Tự khóa tài khoản | `Authorization: Bearer <token>` |

## ⚙️ Cấu hình (Cần thiết để chạy)

Trước khi chạy, hãy đảm bảo file `src/main/resources/application.properties` đã được điền đúng thông tin:

### Database (MySQL)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/minibank
spring.datasource.username=root
# Nếu XAMPP không đặt pass thì để trống, nếu có thì điền vào
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
```

### Mail Configuration

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=EMAIL_THAT_CUA_BAN@gmail.com
spring.mail.password=MAT_KHAU_UNG_DUNG_16_KY_TU
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT KEY auto_increment,
    email varchar(255) unique not null,
    password_hash varchar(255) not null,
    is_active BOOLEAN DEFAULT TRUE,
    is_frozen BOOLEAN DEFAULT FALSE,
    reset_token_hash VARCHAR(255) default NULL,
    reset_token_expire timestamp NULL default NULL,
    refresh_token_hash VARCHAR(255) default NULL,
    refresh_token_expire timestamp NULL default NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

create unique index id_user_email on User(email);
create index id_refresh_token on User(refresh_token_hash);
create index id_reset_token on User(reset_token_hash);
```

## Service Integration

Admin Service giao tiếp với các services khác:

1. **Account Service**: Khi USER_CREATED event được tạo ra, Account Service sẽ lắng nghe để tạo tài khoản ngân hàng mặc định.
2. **Kafka**: Publish các sự kiện liên quan đến thay đổi trạng thái user.

## Authentication

- Public Endpoints: Không yêu cầu header.
- Protected Endpoints Yêu cầu JWT token trong header Authorization: Bearer <token>
- Token được ký (sign) bởi User Service và có thể được verify bởi API Gateway hoặc các service khác thông qua Public Key hoặc Shared Secret.

## Request/Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "nguyenvana",
    "email": "vana@example.com",
    "fullName": "Nguyen Van A"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with email '...' not found",
    "timestamp": "2025-12-04T08:30:00",
    "path": "/api/v1/users/login"
  }
}
```

## Cấu trúc Project

```
admin-service/
├── src/
│   ├── main/
│   │   ├── java/com/minibank/userservice/
│   │   │   ├── config/          # Security, Kafka configs
│   │   │   ├── controller/      # REST controllers
│   │   │   ├── dto/             # Request/Response DTOs
│   │   │   ├── entity/          # JPA entities
│   │   │   ├── model/           # Stores user information
│   │   │   ├── repository/      # JPA repositories
│   │   │   └── service/         # Business logic (Auth, User mgmt)
│   │   └── resources/
│   │       └── application.properties          # Local config
│   │       
│   └── test/w
├── pom.xml
└── README.md
```

### Environment Variables

Khi chạy bằng Docker, các biến môi trường sau có thể được override:

```bash
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/minibank
spring.datasource.username=root
spring.datasource.password=password
```

## Chạy Service

## Yêu cầu
- Java 17 đã cài đặt.
- Maven đã cài đặt (hoặc dùng Maven có sẵn trong IntelliJ).
- MySQL (XAMPP) đang bật và đã tạo database tên là minibank

#### Các bước chạy
- Mở dự án bằng IntelliJ IDEA.
- Đợi Maven tải thư viện xong.
- Mở file UserServiceApplication.java.
- Nhấn nút Run.
- Service sẽ chạy tại: http://localhost:8081

## Test nhanh (Postman)

1. **Đăng ký**:
URL: http://localhost:8081/api/users/register (POST)
Body: {"email": "test@gmail.com", "password": "123"}

2. **Đăng nhập**:
URL: http://localhost:8081/api/users/login (POST)
Body: {"email": "test@gmail.com", "password": "123"}
Kết quả: Copy chuỗi accessToken.

3. **Tự khóa tài khoản**:
URL: http://localhost:8081/api/users/self-freeze (PUT)
Auth: Chọn Bearer Token -> Dán token vừa copy vào.
Kết quả: Database cột is_frozen chuyển thành 1.

4. **Yêu cầu Quên mật khẩu**:
URL: http://localhost:8081/api/users/forgot-password
```json:
{"email": "email_cua_ban@gmail.com"}
```
Kết quả: Kiểm tra hộp thư Gmail của bạn, copy đoạn mã Token trong link hoặc lấy từ Database.

5. **Đặt lại mật khẩu**:
URL: http://localhost:8081/api/users/reset-password
```json:
{
    "token": "TOKEN",
    "newPassword": "Newpassword"
}
```
Kết quả: 204 No Content (Thành công). Hãy thử đăng nhập lại bằng mật khẩu mới.
