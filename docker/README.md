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

### **4. Dừng services:**
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
```

### **Container name conflict?**
```bash
# Xóa container cũ
docker rm -f postgres-log-service
```

### **Database connection failed?**
```bash
# Kiểm tra container
docker-compose ps postgres-log

# Xem logs
docker-compose logs postgres-log
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
    ├── log-service-init.sql           # Init script cho log service
    └── {service-name}-init.sql        # Thêm init script cho service mới
```

---

## **LIÊN HỆ**

Nếu có thắc mắc:
1. Đọc [Docker Conventions & Guidelines](./../docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20%26%20Guidelines.md)
2. Kiểm tra [SERVICE_PORT_ALLOCATION.md](./SERVICE_PORT_ALLOCATION.md)
3. Hỏi team trong channel #docker-support

---

**Happy Coding!**
