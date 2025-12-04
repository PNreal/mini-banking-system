# HƯỚNG DẪN CHẠY LOG SERVICE

## YÊU CẦU HỆ THỐNG

- Java 17 hoặc cao hơn
- Maven 3.6+ (hoặc Maven Wrapper đã có sẵn)
- Docker Desktop đang chạy
- Docker Compose

---

## BƯỚC 1: KIỂM TRA MÔI TRƯỜNG

### 1.1. Kiểm tra Java
```powershell
java -version
```
Kết quả mong đợi: `openjdk version "17.x.x"` hoặc tương tự

### 1.2. Kiểm tra Docker
```powershell
docker --version
docker-compose --version
```

### 1.3. Set JAVA_HOME (nếu cần)
```powershell
# Tự động detect JAVA_HOME
$javaPath = (Get-Command java).Source
$javaHome = Split-Path (Split-Path $javaPath)
$env:JAVA_HOME = $javaHome
Write-Host "JAVA_HOME set to: $env:JAVA_HOME"

# Hoặc set thủ công
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
```

---

## BƯỚC 2: KHỞI ĐỘNG DOCKER CONTAINERS

### 2.1. Di chuyển đến thư mục root của dự án
```powershell
cd X:\mini-banking-system
```

### 2.2. Kiểm tra containers đang chạy
```powershell
docker-compose ps
```

### 2.3. Dừng containers cũ (nếu có conflict)
```powershell
# Dừng và xóa containers cũ nếu có conflict
docker stop zookeeper kafka postgres-log-service
docker rm zookeeper kafka postgres-log-service
```

### 2.4. Khởi động Docker containers
```powershell
docker-compose up -d
```

### 2.5. Kiểm tra trạng thái containers
```powershell
docker-compose ps
```

Kết quả mong đợi:
```
NAME                   STATUS          PORTS
postgres-log-service   Up (healthy)    0.0.0.0:5433->5432/tcp
kafka                  Up              0.0.0.0:9092->9092/tcp
zookeeper              Up (healthy)     0.0.0.0:2181->2181/tcp
```

### 2.6. Kiểm tra kết nối database
```powershell
docker exec postgres-log-service pg_isready -U log_user -d log_db
```

Kết quả mong đợi: `/var/run/postgresql:5432 - accepting connections`

---

## BƯỚC 3: BUILD PROJECT (TÙY CHỌN)

### 3.1. Di chuyển đến thư mục service
```powershell
cd services\log-service\log-service
```

### 3.2. Build project
```powershell
# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"

# Build (skip tests)
.\mvnw.cmd clean compile -DskipTests

# Hoặc build JAR file
.\mvnw.cmd clean package -DskipTests
```

---

## BƯỚC 4: CHẠY SERVICE

### Cách 1: Chạy bằng Maven (Khuyến nghị cho development)

```powershell
# Di chuyển đến thư mục service
cd X:\mini-banking-system\services\log-service\log-service

# Set JAVA_HOME
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"

# Chạy service
.\mvnw.cmd spring-boot:run
```

### Cách 2: Chạy bằng JAR file

```powershell
# Di chuyển đến thư mục service
cd X:\mini-banking-system\services\log-service\log-service

# Build JAR (nếu chưa build)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
.\mvnw.cmd clean package -DskipTests

# Chạy JAR
java -jar target\log-service-0.0.1-SNAPSHOT.jar
```

### Cách 3: Chạy từ IDE (IntelliJ IDEA / Eclipse / VS Code)

1. Mở project trong IDE
2. Set JAVA_HOME trong IDE settings
3. Tìm class `LogServiceApplication.java`
4. Click Run hoặc Debug

---

## BƯỚC 5: KIỂM TRA SERVICE ĐÃ CHẠY

### 5.1. Kiểm tra port 8085
```powershell
netstat -ano | findstr ":8085"
```

Kết quả mong đợi: Có process đang listen trên port 8085

### 5.2. Kiểm tra logs trong console

Khi service khởi động thành công, bạn sẽ thấy:
```
Started LogServiceApplication in X.XXX seconds
```

### 5.3. Test API endpoint

**Test Health endpoint:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8085/api/v1/health" -Method GET
```

**Test Admin endpoint:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8085/api/v1/admin/logs?page=0&size=10" -Method GET
```

**Test User endpoint (cần header X-User-Id):**
```powershell
$headers = @{
    "X-User-Id" = "123e4567-e89b-12d3-a456-426614174000"
}
Invoke-WebRequest -Uri "http://localhost:8085/api/v1/logs/me?page=0&size=10" -Method GET -Headers $headers
```

**Hoặc dùng curl:**
```powershell
curl http://localhost:8085/api/v1/admin/logs
```

---

## BƯỚC 6: XEM LOGS

### 6.1. Xem logs của Docker containers
```powershell
# Xem logs PostgreSQL
docker logs postgres-log-service

# Xem logs Kafka
docker logs kafka

# Xem logs Zookeeper
docker logs zookeeper

# Xem logs tất cả containers
docker-compose logs -f
```

### 6.2. Xem logs của application

Logs sẽ hiển thị trong console nơi bạn chạy `mvnw.cmd spring-boot:run`

---

## TROUBLESHOOTING

### Lỗi: Port 8085 đã được sử dụng

**Giải pháp:**
1. Tìm process đang dùng port:
   ```powershell
   netstat -ano | findstr ":8085"
   ```
2. Dừng process đó hoặc đổi port trong `application.properties`:
   ```properties
   server.port=8086
   ```

### Lỗi: Database connection failed

**Giải pháp:**
1. Kiểm tra PostgreSQL container đang chạy:
   ```powershell
   docker-compose ps postgres-log
   ```
2. Kiểm tra logs:
   ```powershell
   docker logs postgres-log-service
   ```
3. Kiểm tra port mapping:
   ```powershell
   docker port postgres-log-service
   ```

### Lỗi: Kafka connection failed

**Giải pháp:**
1. Kiểm tra Kafka container:
   ```powershell
   docker-compose ps kafka
   ```
2. Kiểm tra Zookeeper:
   ```powershell
   docker-compose ps zookeeper
   ```
3. Xem logs:
   ```powershell
   docker logs kafka
   docker logs zookeeper
   ```

### Lỗi: JAVA_HOME not set

**Giải pháp:**
```powershell
# Tự động detect và set
$javaPath = (Get-Command java).Source
$javaHome = Split-Path (Split-Path $javaPath)
$env:JAVA_HOME = $javaHome

# Hoặc set thủ công
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
```

### Lỗi: Container name conflict

**Giải pháp:**
```powershell
# Dừng và xóa containers cũ
docker stop zookeeper kafka postgres-log-service
docker rm zookeeper kafka postgres-log-service

# Khởi động lại
docker-compose up -d
```

### Lỗi: Test compilation failed

**Giải pháp:**
Chạy service với skip tests:
```powershell
.\mvnw.cmd spring-boot:run -Dmaven.test.skip=true
```

---

## DỪNG SERVICE

### Dừng application
- Nhấn `Ctrl+C` trong terminal đang chạy service
- Hoặc đóng terminal window

### Dừng Docker containers
```powershell
cd X:\mini-banking-system
docker-compose down
```

### Dừng và xóa volumes (xóa dữ liệu)
```powershell
docker-compose down -v
```

---

## THÔNG TIN KẾT NỐI

### Database
- **Host:** localhost
- **Port:** 5433
- **Database:** log_db
- **Username:** log_user
- **Password:** log_password
- **Connection String:** `jdbc:postgresql://localhost:5433/log_db`

### Kafka
- **Bootstrap Servers:** localhost:9092
- **Consumer Group:** log-service-group

### Application
- **Port:** 8085
- **Base URL:** http://localhost:8085
- **API Base:** http://localhost:8085/api/v1

---

## API ENDPOINTS

### Admin Endpoints
- `GET /api/v1/admin/logs` - Lấy tất cả logs
  - Query params: `page`, `size`, `sortBy`, `sortDir`
- `GET /api/v1/admin/logs/search` - Tìm kiếm logs với filters
  - Query params: `userId`, `action`, `startTime`, `endTime`, `page`, `size`
- `GET /api/v1/admin/logs/statistics` - Lấy thống kê logs
  - Query params: `userId`, `startTime`, `endTime`

### User Endpoints
- `GET /api/v1/logs/me` - Lấy logs của user hiện tại
  - Header: `X-User-Id` (temporary, sẽ được thay bằng JWT)
  - Query params: `page`, `size`, `sortBy`, `sortDir`

### Health Check
- `GET /api/v1/health` - Health check endpoint
- `GET /actuator/health` - Spring Boot Actuator health

---

## KAFKA TOPICS

Service lắng nghe các topics sau:
- `USER_EVENT` - Events từ User Service
- `TRANSACTION_COMPLETED` - Events từ Transaction Service
- `ADMIN_ACTION` - Events từ Admin Service
- `ACCOUNT_EVENT` - Events từ Account Service

---

## QUICK START (TÓM TẮT)

```powershell
# 1. Khởi động Docker
cd X:\mini-banking-system
docker-compose up -d

# 2. Chạy service
cd services\log-service\log-service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
.\mvnw.cmd spring-boot:run

# 3. Test
Invoke-WebRequest -Uri "http://localhost:8085/api/v1/health"
Invoke-WebRequest -Uri "http://localhost:8085/api/v1/admin/logs"
```

---

**Chúc bạn chạy service thành công!**
