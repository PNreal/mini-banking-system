# Hướng dẫn khởi động các Service

> **QUAN TRỌNG:** Chỉ database và infrastructure (Kafka, Zookeeper) chạy bằng Docker.  
> Tất cả Java services và Frontend chạy trực tiếp (không dùng Docker).

## Bước 1: Khởi động Databases và Infrastructure bằng Docker

Chạy lệnh sau để khởi động tất cả databases, Kafka và Zookeeper:

```powershell
docker-compose up -d
```

Kiểm tra các containers đang chạy:

```powershell
docker ps
```

Bạn sẽ thấy các containers sau:
- `postgres-log-service` (port 5433)
- `postgres-user-service` (port 5434)
- `postgres-account-service` (port 5432)
- `postgres-admin-service` (port 5435)
- `postgres-transaction-service` (port 5437)
- `postgres-notification-service` (port 5436)
- `zookeeper` (port 2181)
- `kafka` (port 9092)

**Lưu ý:** Chỉ các containers trên được chạy bằng Docker. Các Java services sẽ chạy trực tiếp bằng Maven.

## Bước 2: Khởi động các Service Java (Không dùng Docker)

### Cách 1: Dùng script tự động

Chạy script PowerShell:

```powershell
.\start-services.ps1
```

### Cách 2: Khởi động thủ công từng service

Mở các cửa sổ terminal riêng và chạy từng service:

**1. User Service (port 8081)**
```powershell
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
```

**2. Account Service (port 8082)**
```powershell
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run
```

**3. Transaction Service (port 8083)**
```powershell
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run
```

**4. Admin Service (port 8084)**
```powershell
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run
```

**5. Log Service (port 8085)**
```powershell
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run
```

**6. Notification Service (port 8086)**
```powershell
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run
```

**7. API Gateway (port 8080)**
```powershell
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

## Bước 3: Khởi động Frontend (Không dùng Docker)

Hệ thống tách **2 UI**:
- **Customer/Staff UI**: `frontend` (port 3000)
- **Admin UI (mới)**: `banking-admin-hub-main/banking-admin-hub-main` (port 3001)

```powershell
# Customer/Staff UI
cd frontend
npm start

# Admin UI (mới)
cd ..\banking-admin-hub-main\banking-admin-hub-main
npm i
npm run dev
```

## Kiểm tra các Service

Sau khi khởi động, các service sẽ chạy trên các port sau:

- **User Service**: http://localhost:8081
- **Account Service**: http://localhost:8082
- **Transaction Service**: http://localhost:8083
- **Admin Service**: http://localhost:8084
- **Log Service**: http://localhost:8085
- **Notification Service**: http://localhost:8086
- **API Gateway**: http://localhost:8080
- **Customer/Staff UI**: http://localhost:3000
- **Admin UI (mới)**: http://localhost:3001/admin

## Dừng các Service

### Dừng Databases và Kafka:
```powershell
docker-compose down
```

### Dừng các Service Java:
- Đóng các cửa sổ terminal đang chạy service
- Hoặc dùng Task Manager để kill các process Java

## Lưu ý quan trọng

1. **Docker chỉ dùng cho database và infrastructure:**
   - Chỉ chạy `docker-compose up -d` ở root để khởi động databases và Kafka
   - KHÔNG chạy các file `docker-compose.yml` trong từng service

2. **Java services chạy trực tiếp:**
   - Tất cả Java services phải chạy bằng Maven: `.\mvnw.cmd spring-boot:run`
   - KHÔNG chạy Java services bằng Docker

3. **Yêu cầu hệ thống:**
   - Đảm bảo Java 17+ và Maven đã được cài đặt
   - Đảm bảo Docker đang chạy trước khi chạy `docker-compose up -d`

4. **Thứ tự khởi động:**
   - Bước 1: Khởi động databases và Kafka bằng Docker
   - Bước 2: Khởi động các Java services theo thứ tự: User Service → Account Service → Transaction Service → Admin Service → Log Service → Notification Service → API Gateway
   - Bước 3: Khởi động Frontend (có thể chạy độc lập sau khi API Gateway đã khởi động)

