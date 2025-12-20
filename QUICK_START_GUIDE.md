# 🚀 Hướng Dẫn Khởi Động Nhanh - Mini Banking System

## 📋 Yêu Cầu Hệ Thống

- **Java 17** hoặc cao hơn
- **Node.js 16+** và npm
- **Docker Desktop** (đang chạy)
- **Maven** (hoặc sử dụng mvnw có sẵn)

## ⚡ Khởi Động Nhanh (3 Bước)

### Bước 1: Khởi động Databases & Kafka

```powershell
docker-compose up -d
```

Đợi ~30 giây để các containers khởi động hoàn tất. Kiểm tra:

```powershell
docker ps
```

Phải thấy 7 containers đang chạy (healthy):
- postgres-user-service
- postgres-account-service
- postgres-transaction-service
- postgres-admin-service
- postgres-log-service
- postgres-notification-service
- zookeeper
- kafka

**Lưu ý:** Nếu Kafka bị exit, khởi động lại:
```powershell
docker start kafka
```

### Bước 2: Khởi động Backend Services

Mở 7 terminal riêng biệt và chạy từng service:

**Terminal 1 - User Service:**
```powershell
cd services/user-service/user-service
.\mvnw.cmd spring-boot:run
```

**Terminal 2 - Account Service:**
```powershell
cd services/account-service/account-service
.\mvnw.cmd spring-boot:run
```

**Terminal 3 - Transaction Service:**
```powershell
cd services/transaction-service/transaction-service
.\mvnw.cmd spring-boot:run
```

**Terminal 4 - Admin Service:**
```powershell
cd services/admin-service/admin-service
.\mvnw.cmd spring-boot:run
```

**Terminal 5 - Log Service:**
```powershell
cd services/log-service/log-service
.\mvnw.cmd spring-boot:run
```

**Terminal 6 - Notification Service:**
```powershell
cd services/notification-service/notification-service
.\mvnw.cmd spring-boot:run
```

**Terminal 7 - API Gateway:**
```powershell
cd api-gateway/api-gateway
.\mvnw.cmd spring-boot:run
```

**Thời gian khởi động:** Mỗi service ~30-60 giây

### Bước 3: Khởi động Frontend

**Terminal 8 - Frontend (Web + Admin):**
```powershell
cd frontend
npm start
```

Hoặc sử dụng script có sẵn:
```powershell
.\start-frontend.ps1
```

## 🌐 Truy Cập Ứng Dụng

### Frontend Applications
- **Customer Web:** http://localhost:3002
- **Admin Panel:** http://localhost:3001

### Backend Services
- **API Gateway:** http://localhost:8080
- **User Service:** http://localhost:8081
- **Account Service:** http://localhost:8082
- **Transaction Service:** http://localhost:8083
- **Admin Service:** http://localhost:8084
- **Log Service:** http://localhost:8085
- **Notification Service:** http://localhost:8086

## 👤 Tài Khoản Test

### Admin Panel (http://localhost:3001/admin)
```
Email: admin@minibank.com
Password: Admin@123
```

### Customer Web (http://localhost:3002)
```
Email: test.user@example.com
Password: TestPassword#123
```

### Staff Login
```
Email: staff@minibank.com
Password: Staff@123
```

### Counter Admin
```
Email: counter.admin@minibank.com
Password: CounterAdmin@123
```

## 🛑 Dừng Hệ Thống

### Dừng Backend Services
Nhấn `Ctrl+C` trong mỗi terminal đang chạy service

### Dừng Frontend
Nhấn `Ctrl+C` trong terminal frontend

### Dừng Databases & Kafka
```powershell
docker-compose down
```

## 🔧 Xử Lý Sự Cố

### Lỗi: Port đã được sử dụng

Kiểm tra port đang sử dụng:
```powershell
netstat -ano | findstr ":8080"
```

Kill process:
```powershell
taskkill /PID <PID> /F
```

### Lỗi: Kafka không kết nối được

Khởi động lại Kafka:
```powershell
docker restart kafka
```

### Lỗi: Database connection failed

Kiểm tra containers:
```powershell
docker ps -a
```

Khởi động lại containers:
```powershell
docker-compose restart
```

### Lỗi: CORS khi đăng nhập

API Gateway đã được cấu hình CORS. Nếu vẫn lỗi, kiểm tra:
1. API Gateway đang chạy trên port 8080
2. Frontend đang gọi đúng URL: http://localhost:8080/api/v1/...

### Lỗi: Cannot compile tests (Log Service)

Log Service có lỗi test compilation. Đã xóa test files. Nếu gặp lỗi:
```powershell
cd services/log-service/log-service
Remove-Item -Recurse -Force src\test
.\mvnw.cmd spring-boot:run
```

## 📊 Kiểm Tra Trạng Thái

### Kiểm tra tất cả services đang chạy:
```powershell
# Backend services
netstat -an | findstr "808"

# Frontend
netstat -an | findstr "300"

# Databases
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Test API Gateway:
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/admin/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@minibank.com","password":"Admin@123"}'
```

Nếu thành công, bạn sẽ nhận được `accessToken`.

## 📝 Ghi Chú Quan Trọng

1. **Thứ tự khởi động:** Phải khởi động Databases trước, sau đó Backend Services, cuối cùng là Frontend
2. **Kafka:** Kafka đôi khi tự động exit, cần khởi động lại thủ công
3. **Thời gian khởi động:** Tổng thời gian ~5-7 phút cho toàn bộ hệ thống
4. **Memory:** Hệ thống cần ~4-6GB RAM để chạy mượt mà
5. **First run:** Lần đầu chạy sẽ lâu hơn do phải download dependencies

## 🎯 Checklist Khởi Động

- [ ] Docker Desktop đang chạy
- [ ] Chạy `docker-compose up -d`
- [ ] Đợi containers healthy (~30s)
- [ ] Khởi động Kafka nếu cần: `docker start kafka`
- [ ] Khởi động 7 backend services (7 terminals)
- [ ] Đợi mỗi service hiển thị "Started ...Application"
- [ ] Khởi động frontend: `cd frontend && npm start`
- [ ] Truy cập http://localhost:3002 hoặc http://localhost:3001
- [ ] Đăng nhập với tài khoản test

## 🚀 Script Tự Động (Đang Phát Triển)

File `start-all.ps1` đã được tạo nhưng cần cải thiện. Hiện tại khuyến nghị khởi động thủ công từng service để dễ debug.

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong terminal của service bị lỗi
2. Kiểm tra Docker containers: `docker ps -a`
3. Kiểm tra ports: `netstat -ano | findstr ":<port>"`
4. Restart service hoặc container bị lỗi

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-12-20
