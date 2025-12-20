# Hướng Dẫn Chạy Ứng Dụng Từng Bước

## 📋 Giới Thiệu

Tài liệu này hướng dẫn cách chạy ứng dụng Banking System theo từng bước, giúp bạn kiểm soát tốt hơn và dễ dàng debug khi cần.

**Phù hợp cho:** Development, khi cần xem logs chi tiết và debug từng service

---

## 🔧 Yêu Cầu Trước Khi Chạy

Đảm bảo đã cài đặt:
- ✅ **Docker Desktop** (đang chạy)
- ✅ **Java 17+**
- ✅ **Maven** hoặc Maven Wrapper
- ✅ **Node.js 16+** và **npm**

---

## 🚀 Các Bước Khởi Động

### Bước 1: Khởi Động Databases

Mở **PowerShell** tại thư mục gốc của project và chạy:

```powershell
docker-compose up -d
```

**Kết quả mong đợi:**
```
✔ Container postgres-account-service           Started
✔ Container postgres-transaction-service       Started
✔ Container postgres-user-service              Started
✔ Container postgres-notification-service      Started
✔ Container postgres-admin-service             Started
✔ Container postgres-log-service               Started
✔ Container zookeeper                          Healthy
✔ Container kafka                              Started
```

**Kiểm tra databases đã chạy:**
```powershell
docker ps
```

Bạn sẽ thấy 8 containers đang chạy (6 PostgreSQL + Kafka + Zookeeper).

---

### Bước 2: Đợi Databases Khởi Động Hoàn Toàn

Đợi 10-15 giây để databases khởi động hoàn toàn:

```powershell
Start-Sleep -Seconds 15
```

Hoặc đơn giản chờ 15 giây.

**Tại sao cần đợi?**
- Databases cần thời gian để khởi tạo schema
- Kafka cần kết nối với Zookeeper
- Đảm bảo tất cả services sẵn sàng nhận kết nối

---

### Bước 3: Khởi Động Backend Services

**Mở 7 terminals riêng biệt** và khởi động từng service:

#### Terminal 1: User Service (port 8081)
```powershell
cd services\user-service\user-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 2: Account Service (port 8082)
```powershell
cd services\account-service\account-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 3: Transaction Service (port 8083)
```powershell
cd services\transaction-service\transaction-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 4: Admin Service (port 8084)
```powershell
cd services\admin-service\admin-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 5: Log Service (port 8085)
```powershell
cd services\log-service\log-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 6: Notification Service (port 8086)
```powershell
cd services\notification-service\notification-service
.\mvnw.cmd spring-boot:run
```

#### Terminal 7: API Gateway (port 8080)
```powershell
cd api-gateway\api-gateway
.\mvnw.cmd spring-boot:run
```

**Thời gian khởi động:** Khoảng 2-3 phút cho tất cả services.

**Kết quả mong đợi:** Mỗi terminal sẽ hiển thị:
```
Started ...Application in X.XXX seconds
```

**Lưu ý:** Giữ tất cả 7 terminals mở để xem logs chi tiết của từng service.

**Xem hướng dẫn trực quan:** [HUONG_DAN_MO_7_TERMINALS.md](../HUONG_DAN_MO_7_TERMINALS.md)

---

### Bước 4: Khởi Động Frontend

Mở **terminal mới** (PowerShell hoặc CMD) và chạy:

```powershell
cd frontend
npm start
```

**Kết quả mong đợi:**
```
Compiled successfully!

You can now view the app in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Lưu ý:** 
- Giữ terminal này mở để frontend tiếp tục chạy
- Nhấn `Ctrl + C` để dừng frontend

---

### Bước 5 (Tùy chọn): Khởi Động Admin Panel

Nếu cần sử dụng Admin Panel, mở **terminal mới** khác và chạy:

```powershell
cd banking-admin-hub-main\banking-admin-hub-main
npm run dev
```

Admin Panel sẽ chạy trên: http://localhost:3001

---

## ✅ Kiểm Tra Ứng Dụng Đã Chạy

### Kiểm tra Backend Services

```powershell
# Kiểm tra tất cả ports
netstat -ano | findstr "8080 8081 8082 8083 8084 8085 8086"

# Hoặc dùng script
.\check-services.ps1
```

### Kiểm tra Docker Containers

```powershell
docker ps
```

Phải thấy 8 containers đang chạy.

### Kiểm tra Frontend

Mở trình duyệt và truy cập:
- **Customer/Staff UI**: http://localhost:3000
- **Admin Panel**: http://localhost:3001
- **API Gateway**: http://localhost:8080

---

## 🌐 Các Điểm Truy Cập

### Backend Services
| Service | URL | Mô tả |
|---------|-----|-------|
| API Gateway | http://localhost:8080 | Cổng chính cho tất cả API |
| User Service | http://localhost:8081 | Quản lý người dùng |
| Account Service | http://localhost:8082 | Quản lý tài khoản |
| Transaction Service | http://localhost:8083 | Xử lý giao dịch |
| Admin Service | http://localhost:8084 | Quản trị hệ thống |
| Log Service | http://localhost:8085 | Ghi log hệ thống |
| Notification Service | http://localhost:8086 | Gửi thông báo |

### Frontend
| Ứng dụng | URL | Mô tả |
|----------|-----|-------|
| Customer/Staff UI | http://localhost:3000 | Giao diện khách hàng/nhân viên |
| Admin Panel | http://localhost:3001 | Giao diện quản trị |

### Databases
| Database | Port | Thông tin kết nối |
|----------|------|-------------------|
| Account DB | 5432 | user: account_user, db: account_db |
| Log DB | 5433 | user: log_user, db: log_db |
| User DB | 5434 | user: user_user, db: user_db |
| Admin DB | 5435 | user: admin_user, db: admin_db |
| Notification DB | 5436 | user: notification_user, db: notification_db |
| Transaction DB | 5437 | user: transaction_user, db: transaction_db |

### Message Broker
| Service | Port | Mô tả |
|---------|------|-------|
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordination |

---

## 🛑 Dừng Ứng Dụng

### Dừng Toàn Bộ (Khuyến nghị)

```powershell
.\stop-all.ps1
```

Script này sẽ dừng tất cả: Java services, Node.js, và Docker containers.

### Dừng Từng Phần (Nếu cần)

#### Dừng Frontend
Trong terminal đang chạy frontend, nhấn:
```
Ctrl + C
```

#### Dừng Backend Services
Đóng từng terminal hoặc nhấn `Ctrl + C` trong mỗi terminal.

Hoặc dừng tất cả Java processes:
```powershell
Get-Process -Name java | Stop-Process -Force
```

#### Dừng Databases
```powershell
docker-compose down
```

---

## 🔍 Xem Logs

### Logs Backend Services

Logs của các Java services sẽ hiển thị trong các cửa sổ terminal riêng khi chúng khởi động.

Để xem logs chi tiết của một service cụ thể, bạn có thể khởi động thủ công:

```powershell
cd services\user-service\user-service
mvnw.cmd spring-boot:run
```

### Logs Databases

```powershell
# Xem logs tất cả containers
docker-compose logs -f

# Xem logs một container cụ thể
docker logs -f postgres-user-service
docker logs -f kafka
```

### Logs Frontend

Logs sẽ hiển thị trực tiếp trong terminal đang chạy `npm start`.

---

## ⚠️ Xử Lý Lỗi Thường Gặp

### Lỗi 1: Port đã được sử dụng

**Triệu chứng:**
```
Port 8080 is already in use
```

**Giải pháp:**
```powershell
# Tìm process đang dùng port
netstat -ano | findstr "8080"

# Dừng process theo PID
Stop-Process -Id <PID> -Force

# Hoặc dừng tất cả
.\stop-all.ps1
```

### Lỗi 2: Docker không chạy

**Triệu chứng:**
```
Error: Docker is not running
```

**Giải pháp:**
1. Mở Docker Desktop
2. Đợi Docker khởi động hoàn toàn
3. Chạy lại: `docker-compose up -d`

### Lỗi 3: Database connection failed

**Triệu chứng:**
```
Connection refused: localhost:5432
```

**Giải pháp:**
```powershell
# Kiểm tra databases đang chạy
docker ps

# Nếu không chạy, khởi động lại
docker-compose down
docker-compose up -d
Start-Sleep -Seconds 15

# Khởi động lại services (mở 7 terminals)
# Xem hướng dẫn: HUONG_DAN_MO_7_TERMINALS.md
```

### Lỗi 4: Service không khởi động

**Triệu chứng:**
Service không hiển thị "Started successfully"

**Giải pháp:**
```powershell
# Khởi động thủ công để xem logs
cd services\<service-name>\<service-name>
mvnw.cmd spring-boot:run

# Xem lỗi trong logs và fix
```

### Lỗi 5: Frontend không build được

**Triệu chứng:**
```
npm ERR! Missing script: "start"
```

**Giải pháp:**
```powershell
# Cài đặt dependencies
cd frontend
npm install

# Chạy lại
npm start
```

---

## 💡 Tips và Best Practices

### 1. Kiểm tra trước khi chạy
```powershell
# Kiểm tra Docker
docker --version
docker ps

# Kiểm tra Java
java -version

# Kiểm tra Node
node --version
npm --version
```

### 2. Theo dõi tài nguyên hệ thống
- Mở Task Manager để theo dõi CPU và RAM
- Đảm bảo có ít nhất 8GB RAM khả dụng
- Đóng các ứng dụng không cần thiết

### 3. Sử dụng nhiều terminal
- Terminal 1: Databases (docker-compose logs -f)
- Terminal 2: Backend services
- Terminal 3: Frontend
- Terminal 4: Chạy lệnh kiểm tra

### 4. Bookmark các URL
Lưu các URL thường dùng vào bookmark:
- http://localhost:8080 (API Gateway)
- http://localhost:3000 (Customer UI)
- http://localhost:3001 (Admin Panel)

---

## 🔄 Quy Trình Làm Việc Hàng Ngày

### Bắt đầu làm việc:
```powershell
# 1. Khởi động databases
docker-compose up -d

# 2. Đợi databases khởi động
Start-Sleep -Seconds 15

# 3. Khởi động backend (mở 7 terminals)
# Xem hướng dẫn: HUONG_DAN_MO_7_TERMINALS.md

# 4. Khởi động frontend (terminal mới)
cd frontend
npm start
```

### Kết thúc làm việc:
```powershell
.\scripts\stop-all.ps1
```

### Khởi động lại nhanh (nếu databases vẫn chạy):
```powershell
# Chỉ cần khởi động backend (mở 7 terminals)
# Xem hướng dẫn: HUONG_DAN_MO_7_TERMINALS.md

# Và frontend (terminal mới)
cd frontend
npm start
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra logs**: Xem logs trong terminal của service bị lỗi
2. **Kiểm tra trạng thái**: Chạy `.\scripts\check-services.ps1`
3. **Khởi động lại**: Dừng tất cả và chạy lại từ đầu
4. **Xem tài liệu**: Tham khảo [README.md](../README.md), [HUONG_DAN_MO_7_TERMINALS.md](../HUONG_DAN_MO_7_TERMINALS.md)

---

## 📚 Tài Liệu Liên Quan

- [README.md](../README.md) - Thông tin tổng quan về project
- [HUONG_DAN_MO_7_TERMINALS.md](../HUONG_DAN_MO_7_TERMINALS.md) - Hướng dẫn trực quan mở 7 terminals
- [HUONG_DAN_KHOI_DONG_BACKEND.md](HUONG_DAN_KHOI_DONG_BACKEND.md) - Hướng dẫn khởi động backend chi tiết
- [QUICK_REFERENCE.md](../QUICK_REFERENCE.md) - Tra cứu nhanh
- [docker/README.md](../docker/README.md) - Chi tiết về Docker setup
