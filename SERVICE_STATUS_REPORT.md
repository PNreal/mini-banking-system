# BÁO CÁO TRẠNG THÁI CÁC SERVICE API

**Ngày kiểm tra:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Hệ thống:** Mini Banking System

---

## 📊 TỔNG QUAN

| Service | Port | Trạng thái | Ghi chú |
|---------|------|------------|---------|
| API Gateway | 8080 | ❌ KHÔNG CHẠY | Service chính để điều hướng request |
| User Service | 8081 | ❌ KHÔNG CHẠY | Quản lý người dùng |
| Account Service | 8082 | ❌ KHÔNG CHẠY | Quản lý tài khoản |
| Transaction Service | 8083 | ❌ KHÔNG CHẠY | Quản lý giao dịch |
| Admin Service | 8084 | ❌ KHÔNG CHẠY | Quản trị hệ thống |
| Log Service | 8085 | ❌ KHÔNG CHẠY | Ghi log hệ thống |
| Notification Service | 8086 | ❌ KHÔNG CHẠY | Gửi thông báo |

**Tổng số service:** 7  
**Service đang chạy:** 0  
**Service không chạy:** 7

---

## 🔍 CHI TIẾT KIỂM TRA

### Các Port Đã Kiểm Tra:
- ✅ Port 8080 (API Gateway) - Không có service đang lắng nghe
- ✅ Port 8081 (User Service) - Không có service đang lắng nghe
- ✅ Port 8082 (Account Service) - Không có service đang lắng nghe
- ✅ Port 8083 (Transaction Service) - Không có service đang lắng nghe
- ✅ Port 8084 (Admin Service) - Không có service đang lắng nghe
- ✅ Port 8085 (Log Service) - Không có service đang lắng nghe
- ✅ Port 8086 (Notification Service) - Không có service đang lắng nghe

### Docker Containers:
- ✅ PostgreSQL (Account Service) - Đang chạy trên port 5435
- ❌ Các service khác chưa được khởi động

---

## 🚀 HƯỚNG DẪN KHỞI ĐỘNG CÁC SERVICE

### Cách 1: Khởi động từng service bằng Maven (Khuyến nghị cho Development)

#### 1. API Gateway
```powershell
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

#### 2. User Service
```powershell
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
```

#### 3. Account Service
```powershell
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run
```

#### 4. Transaction Service
```powershell
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run
```

#### 5. Admin Service
```powershell
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run
```

#### 6. Log Service
```powershell
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run
```

#### 7. Notification Service
```powershell
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run
```

### Cách 2: Khởi động bằng Docker Compose

#### Bước 1: Khởi động infrastructure (Database, Kafka, Zookeeper)
```powershell
cd X:\mini-banking-system
docker-compose up -d
```

#### Bước 2: Khởi động từng service bằng Docker
Mỗi service có file `docker-compose.yml` riêng trong thư mục của nó:
```powershell
# Ví dụ: Log Service
cd services\log-service\log-service
docker-compose up -d
```

### Cách 3: Khởi động tất cả trong các terminal riêng biệt

Mở 7 terminal windows và chạy từng service ở mỗi terminal để có thể theo dõi logs riêng biệt.

---

## ⚙️ YÊU CẦU TRƯỚC KHI KHỞI ĐỘNG

### 1. Kiểm tra Java
```powershell
java -version
# Cần Java 17 hoặc cao hơn
```

### 2. Set JAVA_HOME (nếu cần)
```powershell
# Tự động detect
$javaPath = (Get-Command java).Source
$javaHome = Split-Path (Split-Path $javaPath)
$env:JAVA_HOME = $javaHome

# Hoặc set thủ công
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
```

### 3. Kiểm tra Docker (nếu dùng Docker)
```powershell
docker --version
docker-compose --version
```

### 4. Khởi động Infrastructure Services
Trước khi chạy các service, cần đảm bảo:
- ✅ PostgreSQL databases đã được khởi động
- ✅ Kafka và Zookeeper đã được khởi động (nếu service sử dụng)

```powershell
# Khởi động infrastructure
docker-compose up -d

# Kiểm tra status
docker-compose ps
```

---

## 🧪 KIỂM TRA SERVICE ĐÃ CHẠY

Sau khi khởi động service, kiểm tra bằng cách:

### 1. Kiểm tra Health Endpoint
```powershell
# PowerShell
Invoke-WebRequest -Uri http://localhost:8080/actuator/health -UseBasicParsing
Invoke-WebRequest -Uri http://localhost:8081/actuator/health -UseBasicParsing
# ... tương tự cho các port khác
```

### 2. Chạy script kiểm tra tự động
```powershell
powershell -ExecutionPolicy Bypass -File check-services.ps1
```

### 3. Kiểm tra port đang lắng nghe
```powershell
netstat -ano | findstr "8080 8081 8082 8083 8084 8085 8086"
```

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Thứ tự khởi động:** Nên khởi động infrastructure services (database, Kafka) trước, sau đó mới khởi động các application services.

2. **Port conflicts:** Nếu gặp lỗi "port already in use", kiểm tra xem có process nào đang sử dụng port đó không:
   ```powershell
   netstat -ano | findstr "8080"
   ```

3. **Database connections:** Đảm bảo các database đã được khởi động và có thể kết nối được trước khi chạy các service.

4. **Logs:** Theo dõi logs của từng service để phát hiện lỗi sớm:
   ```powershell
   # Nếu dùng Docker
   docker-compose logs -f <service-name>
   ```

---

## 🔗 TÀI LIỆU THAM KHẢO

- [Service Port Allocation](./docker/SERVICE_PORT_ALLOCATION.md)
- [Docker Quick Reference](./README_DOCKER.md)
- [How to Run Tests](./HOW_TO_RUN_TESTS.md)
- [Log Service Run Guide](./services/log-service/log-service/RUN_GUIDE.md)

---

**Kết luận:** Tất cả các service API hiện tại đều chưa được khởi động. Cần khởi động infrastructure services trước, sau đó khởi động từng application service theo thứ tự phụ thuộc.

