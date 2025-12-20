# Hướng dẫn nhanh - Khởi động và Dừng ứng dụng

> Tài liệu này giúp bạn khởi động và dừng ứng dụng một cách nhanh chóng.

## 🚀 Khởi động ứng dụng

### Cách 1: Khởi động tự động (Khuyến nghị)

**Bước 1: Khởi động Databases và Infrastructure (Docker)**
```powershell
docker-compose up -d
```

**Bước 2: Khởi động tất cả Java Services**
```powershell
.\start-services.ps1
```

**Bước 3: Khởi động Frontend (mở terminal mới)**

Hệ thống có 2 UI:
- **Customer/Staff UI**: thư mục `frontend` (port 3000)
- **Admin UI (mới)**: thư mục `banking-admin-hub-main/banking-admin-hub-main` (port 3001)

```powershell
# Customer/Staff UI
cd frontend
npm start

# Admin UI (mới)
cd ..\banking-admin-hub-main\banking-admin-hub-main
npm i
npm run dev
```

### Cách 2: Khởi động thủ công

Xem chi tiết trong [START_SERVICES.md](./START_SERVICES.md)

---

## 🛑 Dừng ứng dụng

### Cách 1: Dừng tự động (Khuyến nghị)

**Dừng tất cả Java Services:**
```powershell
.\stop-services.ps1
```

**Dừng Databases và Infrastructure:**
```powershell
docker-compose down
```

**Dừng Frontend:**
- Nhấn `Ctrl + C` trong terminal đang chạy frontend

### Cách 2: Dừng thủ công

**Dừng Java Services:**
```powershell
# Tìm và kill tất cả process Java
Get-Process -Name java -ErrorAction SilentlyContinue | Stop-Process -Force
```

Hoặc dùng Task Manager:
- Mở Task Manager (Ctrl + Shift + Esc)
- Tìm các process `java.exe`
- End Task cho tất cả

**Dừng Databases và Infrastructure:**
```powershell
docker-compose down
```

**Dừng Frontend:**
- Nhấn `Ctrl + C` trong terminal đang chạy frontend

---

## 📊 Kiểm tra trạng thái

### Kiểm tra tất cả services
```powershell
.\check-services.ps1
```

### Kiểm tra Docker containers
```powershell
docker ps
```

### Kiểm tra các port đang được sử dụng
```powershell
Get-NetTCPConnection | Where-Object {$_.LocalPort -in @(8080,8081,8082,8083,8084,8085,8086,3000,3001)} | Select-Object LocalPort, State
```

---

## 🔧 Các lệnh hữu ích khác

### Xem logs của Docker containers
```powershell
docker-compose logs -f
```

### Xem logs của một service cụ thể
```powershell
docker-compose logs -f postgres-account-service
```

### Restart một Docker container
```powershell
docker-compose restart postgres-account-service
```

### Xóa tất cả Docker containers và volumes (CẢNH BÁO: Xóa dữ liệu)
```powershell
docker-compose down -v
```

### Xem các process Java đang chạy
```powershell
Get-Process -Name java | Select-Object Id, ProcessName, StartTime
```

### Kill một process Java cụ thể
```powershell
Stop-Process -Id <PID> -Force
```

---

## 📍 Địa chỉ truy cập

Sau khi khởi động, các service sẽ chạy trên các port sau:

| Service | URL | Port |
|---------|-----|------|
| **Customer/Staff UI** | http://localhost:3000 | 3000 |
| **Admin UI (mới)** | http://localhost:3001/admin | 3001 |
| **API Gateway** | http://localhost:8080 | 8080 |
| **User Service** | http://localhost:8081 | 8081 |
| **Account Service** | http://localhost:8082 | 8082 |
| **Transaction Service** | http://localhost:8083 | 8083 |
| **Admin Service** | http://localhost:8084 | 8084 |
| **Log Service** | http://localhost:8085 | 8085 |
| **Notification Service** | http://localhost:8086 | 8086 |

---

## ⚡ Quy trình nhanh nhất

### Khởi động (3 lệnh)
```powershell
# Terminal 1: Databases
docker-compose up -d

# Terminal 1: Java Services
.\start-services.ps1

# Terminal 2: Frontend
cd frontend && npm start

# Terminal 3: Admin UI (mới)
cd banking-admin-hub-main\banking-admin-hub-main && npm i && npm run dev
```

### Dừng (2 lệnh)
```powershell
# Dừng Java Services
.\stop-services.ps1

# Dừng Databases
docker-compose down

# Frontend: Nhấn Ctrl+C trong terminal
```

---

## ⚠️ Lưu ý quan trọng

1. **Thứ tự khởi động:**
   - Databases và Kafka phải khởi động trước
   - Sau đó mới khởi động các Java Services
   - Frontend có thể khởi động sau cùng

2. **Kiểm tra trước khi khởi động:**
   - Đảm bảo Docker đang chạy
   - Đảm bảo Java 17+ đã được cài đặt
   - Đảm bảo các port không bị chiếm dụng

3. **Khi gặp lỗi:**
   - Chạy `.\check-services.ps1` để kiểm tra trạng thái
   - Kiểm tra logs: `docker-compose logs`
   - Đảm bảo không có process cũ đang chạy

---

## 📝 Checklist khởi động

- [ ] Docker đang chạy
- [ ] Java 17+ đã cài đặt
- [ ] Node.js và npm đã cài đặt
- [ ] Không có process Java cũ đang chạy
- [ ] Các port 8080-8086 và 3000-3001 không bị chiếm dụng
- [ ] Đã chạy `docker-compose up -d`
- [ ] Đã chạy `.\start-services.ps1`
- [ ] Đã chạy `npm start` trong thư mục `frontend`
- [ ] Đã chạy `npm run dev` trong thư mục `banking-admin-hub-main/banking-admin-hub-main`

---

## 🔄 Restart nhanh

Nếu cần restart toàn bộ hệ thống:

```powershell
# Dừng tất cả
.\stop-services.ps1
docker-compose down

# Khởi động lại
docker-compose up -d
.\start-services.ps1
# Frontend: cd frontend && npm start
```

