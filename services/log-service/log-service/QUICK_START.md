# QUICK START - LOG SERVICE

## Chạy nhanh trong 3 bước

### 1. Khởi động Docker
```powershell
cd X:\mini-banking-system
docker-compose up -d
```

### 2. Chạy Service
```powershell
cd services\log-service\log-service
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
.\mvnw.cmd spring-boot:run
```

### 3. Test
```powershell
Invoke-WebRequest -Uri "http://localhost:8085/api/v1/admin/logs"
```

---

## Kiểm tra trạng thái

```powershell
# Docker containers
docker-compose ps

# Port 8085
netstat -ano | findstr ":8085"

# Database
docker exec postgres-log-service pg_isready -U log_user -d log_db
```

---

## Dừng service

```powershell
# Dừng application: Ctrl+C trong terminal

# Dừng Docker
docker-compose down
```

---

Xem chi tiết trong [RUN_GUIDE.md](./RUN_GUIDE.md)

