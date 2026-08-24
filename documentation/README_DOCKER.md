# **DOCKER QUICK REFERENCE - MINI BANKING SYSTEM**

> **QUAN TRỌNG:** Đọc tài liệu này trước khi thêm service mới để tránh conflict!

---

## **QUICK START**

```bash
# Khởi động tất cả services
docker-compose up -d

# Kiểm tra status
docker-compose ps

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

---

## **TRUY CẬP HỆ THỐNG**

- **Customer Web (Khách hàng & Quầy):** http://localhost:3000
- **Admin Panel (Quản trị viên):** http://localhost:3001
- **API Gateway:** http://localhost:8080

---

## **TÀI KHOẢN TEST**

| Loại | Email | Password |
|------|-------|----------|
| Admin | admin@minibank.com | Admin@123 |
| Customer | test.user@example.com | TestPassword#123 |
| Staff | staff@minibank.com | Staff@123 |
| Counter Admin | counter.admin@minibank.com | CounterAdmin@123 |

---

## **PORT ALLOCATION (ĐÃ TÁI CẤU TRÚC)**

### **Application Ports (Backend):**
- API Gateway: `8080`
- User Service: `8081`
- Core Banking Service: `8082`
- Log Service: `8083`
- Notification Service: `8084`

### **Frontend Ports:**
- Customer Web: `3000`
- Admin Panel: `3001`

### **PostgreSQL Ports (Liên tục 5432 -> 5435):**
- User DB (`user_db`): `5432`
- Core Banking DB (`banking_db`): `5433`
- Log DB (`log_db`): `5434`
- Notification DB (`notification_db`): `5435`

### **Shared Services:**
- Kafka: `9092` (host), `29092` (internal)
- Zookeeper: `2181`

**Lưu ý:** Kafka và Zookeeper là SHARED - chỉ có 1 instance!

---

## **THÊM SERVICE MỚI?**

### **Checklist:**
1. Kiểm tra [SERVICE_PORT_ALLOCATION.md](./docker/SERVICE_PORT_ALLOCATION.md)
2. Chọn port chưa được sử dụng
3. Copy template từ `docker/TEMPLATE_*.yml`
4. Thay thế `{placeholders}` với thông tin service của bạn
5. **KHÔNG** thêm Kafka/Zookeeper nếu đã có
6. Cập nhật [SERVICE_PORT_ALLOCATION.md](./docker/SERVICE_PORT_ALLOCATION.md)
7. Test: `docker-compose up -d`

---

## **TÀI LIỆU CHI TIẾT**

- [Docker Conventions & Guidelines](./docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20%26%20Guidelines.md) - Hướng dẫn chi tiết
- [Service Port Allocation](./docker/SERVICE_PORT_ALLOCATION.md) - Bảng phân bổ port
- [Docker README](./docker/README.md) - Hướng dẫn sử dụng Docker

---

## **TEMPLATES**

- `docker/templates/docker-compose-service.yml` - Template docker-compose
- `docker/templates/application.properties` - Template application.properties
- `docker/templates/init-script.sql` - Template init script

---

## **LỖI THƯỜNG GẶP**

### **Port already in use:**
```bash
# Kiểm tra port
netstat -ano | findstr "5433"  # Windows
lsof -i :5433                   # Linux/Mac

# Giải pháp: Đổi port hoặc dừng process đang dùng port
```

### **Container name conflict:**
```bash
# Xóa container cũ
docker rm -f postgres-log-service
```

### **Service không khởi động:**
```bash
# Xem logs của service cụ thể
docker-compose logs user-service

# Khởi động lại
docker-compose down
docker-compose up -d
```

### **Database connection failed:**
```bash
# Kiểm tra container
docker-compose ps postgres-user

# Xem logs
docker-compose logs postgres-user

# Restart lại
docker-compose restart postgres-user
```

### **Frontend không truy cập được:**
```bash
# Kiểm tra container frontend đang chạy
docker-compose ps frontend

# Xem logs
docker-compose logs frontend

# Restart lại
docker-compose restart frontend
```

Xem thêm trong [Docker Conventions & Guidelines](./docs/IV.%20TÀI%20LIỆU%20KỸ%20THUẬT/Docker%20Conventions%20%26%20Guidelines.md#8-troubleshooting)

---

## **QUY TẮC QUAN TRỌNG**

### **PHẢI LÀM:**
- Kiểm tra port allocation trước khi thêm service
- Sử dụng naming convention: `postgres-{service-name}-service`
- Sử dụng network: `banking-network`
- Cập nhật tài liệu sau khi thêm service

### **KHÔNG ĐƯỢC LÀM:**
- Dùng port đã được phân bổ
- Tạo Kafka/Zookeeper riêng cho mỗi service
- Merge code mà không kiểm tra conflict

---

## **SCRIPTS HỮU ÍCH**

- `scripts/stop-all.ps1` - Dừng toàn bộ hệ thống
- `scripts/check-services.ps1` - Kiểm tra trạng thái services
- `scripts/run-tests.ps1` - Chạy unit tests

---

**Chúc bạn code vui vẻ và không bị conflict!**