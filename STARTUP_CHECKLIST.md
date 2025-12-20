# ✅ Checklist Khởi Động Mini Banking System

## Trước Khi Bắt Đầu
- [ ] Docker Desktop đang chạy
- [ ] Đã cài Java 17+
- [ ] Đã cài Node.js 16+
- [ ] Đã clone repository

## Khởi Động Lần Đầu

### 1. Cài Đặt Dependencies
- [ ] Frontend: `cd frontend && npm install --legacy-peer-deps`
- [ ] Admin: `cd banking-admin-hub-main/banking-admin-hub-main && npm install --legacy-peer-deps`

### 2. Khởi Động Databases
```powershell
docker-compose up -d
```
- [ ] Đợi 30 giây
- [ ] Kiểm tra: `docker ps` (phải có 7 containers)
- [ ] Nếu Kafka exit: `docker start kafka`

### 3. Khởi Động Backend (7 terminals)

**Terminal 1:**
```powershell
cd services/user-service/user-service
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started UserServiceApplication"

**Terminal 2:**
```powershell
cd services/account-service/account-service
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started AccountServiceApplication"

**Terminal 3:**
```powershell
cd services/transaction-service/transaction-service
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started TransactionServiceApplication"

**Terminal 4:**
```powershell
cd services/admin-service/admin-service
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started AdminServiceApplication"

**Terminal 5:**
```powershell
cd services/log-service/log-service
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started LogServiceApplication"

**Terminal 6:**
```powershell
cd services/notification-service/notification-service
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started NotificationServiceApplication"

**Terminal 7:**
```powershell
cd api-gateway/api-gateway
.\mvnw.cmd spring-boot:run
```
- [ ] Đợi thấy "Started ApiGatewayApplication"

### 4. Khởi Động Frontend

**Terminal 8:**
```powershell
cd frontend
npm start
```
- [ ] Đợi thấy "Compiled successfully"
- [ ] Tự động mở browser

## Kiểm Tra Hoạt Động

### Test Backend
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/admin/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@minibank.com","password":"Admin@123"}'
```
- [ ] Nhận được accessToken

### Test Frontend
- [ ] Mở http://localhost:3002
- [ ] Đăng nhập: test.user@example.com / TestPassword#123
- [ ] Mở http://localhost:3001
- [ ] Đăng nhập: admin@minibank.com / Admin@123

## Khởi Động Lần Sau (Nhanh Hơn)

### Sử dụng Script
```powershell
.\start-system.ps1
# Đợi 2-3 phút
.\start-frontend.ps1
```

### Kiểm Tra Trạng Thái
```powershell
.\check-status.ps1
```

## Dừng Hệ Thống

### Cách 1: Sử dụng Script
```powershell
.\stop-system.ps1
```

### Cách 2: Thủ Công
- [ ] Đóng tất cả terminal windows (Ctrl+C)
- [ ] Chạy: `docker-compose down`

## Xử Lý Lỗi Thường Gặp

### Lỗi: Port đã được sử dụng
```powershell
netstat -ano | findstr ":<port>"
taskkill /PID <PID> /F
```

### Lỗi: Kafka không kết nối
```powershell
docker restart kafka
```

### Lỗi: Database connection failed
```powershell
docker-compose restart
```

### Lỗi: Cannot compile tests (Log Service)
```powershell
cd services/log-service/log-service
Remove-Item -Recurse -Force src\test
.\mvnw.cmd spring-boot:run
```

## Thời Gian Ước Tính

- **Lần đầu:** ~10-15 phút (bao gồm download dependencies)
- **Lần sau:** ~5-7 phút
- **Với script:** ~3-5 phút

## Ports Sử dụng

| Service | Port |
|---------|------|
| API Gateway | 8080 |
| User Service | 8081 |
| Account Service | 8082 |
| Transaction Service | 8083 |
| Admin Service | 8084 |
| Log Service | 8085 |
| Notification Service | 8086 |
| Customer Web | 3002 |
| Admin Panel | 3001 |
| Kafka | 9092 |
| Zookeeper | 2181 |
| PostgreSQL (User) | 5434 |
| PostgreSQL (Account) | 5432 |
| PostgreSQL (Transaction) | 5437 |
| PostgreSQL (Admin) | 5435 |
| PostgreSQL (Log) | 5433 |
| PostgreSQL (Notification) | 5436 |

---

**Tip:** Bookmark trang này để tham khảo nhanh!
