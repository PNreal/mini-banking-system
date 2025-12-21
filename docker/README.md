# **DOCKER SETUP GUIDE - MINI BANKING SYSTEM**

**Quick Navigation:**
- [Docker Conventions & Guidelines](./../docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20%26%20Guidelines.md) - Chi tiết về conventions
- [Service Port Allocation](./SERVICE_PORT_ALLOCATION.md) - Bảng phân bổ port
- [Templates](./TEMPLATE_*.yml) - Templates để copy

---

## **QUICK START**

### **1. Khởi động tất cả services:**
```bash
docker-compose up -d
```

### **2. Kiểm tra services đang chạy:**
```bash
docker-compose ps
```

### **3. Xem logs:**
```bash
docker-compose logs -f
```

### **4. Truy cập ứng dụng:**
- **Customer Web:** http://localhost:3002
- **Admin Panel:** http://localhost:3001
- **API Gateway:** http://localhost:8080

### **5. Dừng services:**
```bash
docker-compose down
```

---

## **THÊM SERVICE MỚI?**

### **Bước 1: Kiểm tra Port Allocation**
Xem file [SERVICE_PORT_ALLOCATION.md](./SERVICE_PORT_ALLOCATION.md) để chọn port chưa được sử dụng.

### **Bước 2: Copy Template**
Copy template từ:
- `docker/TEMPLATE_docker-compose-service.yml` → Thêm vào `docker-compose.yml`
- `docker/TEMPLATE_application.properties` → Copy vào `services/{service-name}/{service-name}/src/main/resources/application.properties`
- `docker/TEMPLATE_init-script.sql` → Copy vào `docker/init-scripts/{service-name}-init.sql`

### **Bước 3: Điền thông tin**
Thay thế các `{placeholders}` trong template:
- `{service-name}` → Tên service (e.g., "user", "account")
- `{port}` → Port đã chọn
- `{application-port}` → Application port đã chọn

### **Bước 4: Cập nhật tài liệu**
- Cập nhật [SERVICE_PORT_ALLOCATION.md](./SERVICE_PORT_ALLOCATION.md) với port mới
- Commit với message: `feat: add {service-name} docker configuration`

### **Bước 5: Test**
```bash
docker-compose up -d
docker-compose ps
```

---

## **QUAN TRỌNG - ĐỌC TRƯỚC KHI CODE**

### **PHẢI LÀM:**
1. Kiểm tra port allocation trước khi thêm service
2. Sử dụng naming convention: `postgres-{service-name}-service`
3. Sử dụng network: `banking-network`
4. **KHÔNG** thêm Kafka/Zookeeper nếu đã có trong docker-compose.yml
5. Cập nhật tài liệu sau khi thêm service

### **KHÔNG ĐƯỢC LÀM:**
1. Dùng port đã được phân bổ
2. Tạo Kafka/Zookeeper riêng cho mỗi service
3. Đặt tên container/volume tùy ý
4. Merge code mà không kiểm tra conflict

---

## **TROUBLESHOOTING**

### **Port conflict?**
```bash
# Kiểm tra port đang được sử dụng
netstat -ano | findstr "5433"  # Windows
lsof -i :5433                   # Linux/Mac

# Giải pháp:
# 1. Đổi port trong docker-compose.yml
# 2. Hoặc dừng process đang dùng port
```

### **Container name conflict?**
```bash
# Xóa container cũ
docker rm -f postgres-log-service

# Restart lại
docker-compose up -d
```

### **Database connection failed?**
```bash
# Kiểm tra container
docker-compose ps postgres-log

# Xem logs
docker-compose logs postgres-log

# Restart lại
docker-compose restart postgres-log
```

### **Service không khởi động?**
```bash
# Xem logs của service
docker-compose logs user-service

# Kiểm tra dependencies
docker-compose ps

# Restart lại
docker-compose restart user-service
```

### **Frontend không truy cập được?**
```bash
# Xem logs của frontend
docker-compose logs frontend

# Kiểm tra port
netstat -ano | findstr "3001"

# Restart lại
docker-compose restart frontend
```

Xem chi tiết trong [Docker Conventions & Guidelines](./../docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20%26%20Guidelines.md#8-troubleshooting)

---

## **CẤU TRÚC THƯ MỤC**

```
docker/
├── README.md                          # File này
├── SERVICE_PORT_ALLOCATION.md         # Bảng phân bổ port
├── TEMPLATE_docker-compose-service.yml # Template docker-compose
├── TEMPLATE_application.properties     # Template application.properties
├── TEMPLATE_init-script.sql           # Template init script
└── init-scripts/
    ├── account-service-init.sql
    ├── admin-service-init.sql
    ├── kyc-service-init.sql
    ├── log-service-init.sql
    ├── notification-service-init.sql
    ├── transaction-service-init.sql
    └── user-service-init.sql
```

---

## **SCRIPTS HỮU ÍCH**

Từ thư mục gốc của project, bạn có thể sử dụng các scripts sau:
- `scripts/stop-all.ps1` - Dừng toàn bộ hệ thống
- `scripts/check-services.ps1` - Kiểm tra trạng thái services
- `scripts/run-tests.ps1` - Chạy unit tests

---

## **LIÊN HỆ**

Nếu có thắc mắc:
1. Đọc [Docker Conventions & Guidelines](./../docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20%26%20Guidelines.md)
2. Kiểm tra [SERVICE_PORT_ALLOCATION.md](./SERVICE_PORT_ALLOCATION.md)
3. Sử dụng scripts trong thư mục `scripts/`
4. Kiểm tra logs bằng `docker-compose logs -f [service-name]`

---

**Happy Coding!**