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

## **PORT ALLOCATION**

### **Application Ports:**
- API Gateway: `8080`
- User Service: `8081`
- Account Service: `8082`
- Transaction Service: `8083`
- Notification Service: `8084`
- **Log Service: `8085`** (Đang sử dụng)
- Admin Service: `8086`
- Available: `8087`, `8088`, `8089`

### **PostgreSQL Ports:**
- **Log Service: `5433`** (Đang sử dụng)
- User Service: `5434`
- Account Service: `5435`
- Transaction Service: `5436`
- Notification Service: `5437`
- Admin Service: `5438`
- Available: `5439`

### **Shared Services:**
- Kafka: `9092` (external), `29092` (internal)
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

- `docker/TEMPLATE_docker-compose-service.yml` - Template docker-compose
- `docker/TEMPLATE_application.properties` - Template application.properties
- `docker/TEMPLATE_init-script.sql` - Template init script

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

**Chúc bạn code vui vẻ và không bị conflict!**

