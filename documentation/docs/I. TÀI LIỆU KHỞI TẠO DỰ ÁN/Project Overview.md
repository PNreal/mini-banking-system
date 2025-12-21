# **PROJECT OVERVIEW -- MINI BANKING SYSTEM**

**Version:** 1.0  
**Last update:** 2025-12-22  
**Team:** 6 members

---

## **1. Giới thiệu dự án**

### **1.1. Mô tả tổng quan**

Mini Banking System là một hệ thống ngân hàng mini được phát triển với kiến trúc microservices, cung cấp các chức năng ngân hàng cơ bản cho người dùng cá nhân và quản trị viên. Hệ thống được xây dựng hoàn toàn bằng công nghệ container Docker, giúp việc triển khai và quản lý trở nên đơn giản và linh hoạt.

### **1.2. Mục tiêu dự án**

- Xây dựng một hệ thống ngân hàng mini hoàn chỉnh với các chức năng cơ bản
- Áp dụng kiến trúc microservices để đảm bảo tính mở rộng và bảo trì
- Sử dụng công nghệ container để dễ dàng triển khai và quản lý
- Cung cấp trải nghiệm người dùng tốt trên cả web và giao diện quản trị

---

## **2. Kiến trúc hệ thống**

### **2.1. Kiến trúc tổng quan**

Hệ thống được xây dựng theo kiến trúc microservices với các thành phần chính:

- **Backend Services:** Các microservices được triển khai độc lập
- **Frontend Applications:** Giao diện người dùng và quản trị
- **API Gateway:** Điểm vào chính cho tất cả các request
- **Databases:** Cơ sở dữ liệu riêng cho từng service
- **Message Queue:** Kafka để xử lý các tác động bất đồng bộ

### **2.2. Các thành phần hệ thống**

#### **Backend Services (Microservices)**
- **API Gateway** (Port 8080) - Điểm vào chính, xử lý routing và CORS
- **User Service** (Port 8081) - Quản lý người dùng và authentication
- **Account Service** (Port 8082) - Quản lý tài khoản ngân hàng
- **Transaction Service** (Port 8083) - Xử lý giao dịch
- **Admin Service** (Port 8084) - Quản lý admin
- **Log Service** (Port 8085) - Ghi log hệ thống
- **Notification Service** (Port 8086) - Gửi thông báo

#### **Frontend Applications**
- **Customer Web** (Port 3002) - Giao diện khách hàng (React)
- **Admin Panel** (Port 3001) - Giao diện quản trị (React + Vite)

#### **Databases & Infrastructure**
- PostgreSQL (6 databases riêng cho mỗi service)
- Kafka + Zookeeper (Message queue)

---

## **3. Tính năng chính**

### **3.1. Tính năng người dùng**

- **Đăng ký/Đăng nhập:** Xác thực người dùng với các vai trò khác nhau
- **Nạp tiền:**
  - Nạp tiền từ ví điện tử
  - Nạp tiền bằng cách quét mã QR
  - Nạp tiền tại quầy giao dịch
- **Rút tiền:**
  - Rút tiền tại quầy giao dịch
  - Rút tiền về ví điện tử
- **Chuyển khoản:** Chuyển tiền giữa các tài khoản trong hệ thống
- **Lịch sử giao dịch:** Xem chi tiết các giao dịch đã thực hiện
- **Quản lý thông tin cá nhân:** Cập nhật thông tin tài khoản

### **3.2. Tính năng quản trị**

- **Quản lý người dùng:** Khóa/Mở khóa, Đóng băng/Mở đóng băng tài khoản
- **Quản lý quầy giao dịch:** Thêm, Sửa, Xóa quầy giao dịch
- **Quản lý nhân viên trong quầy:** Thêm, Sửa, Xóa nhân viên
- **Thống kê và báo cáo:** Xem các báo cáo về hoạt động hệ thống

### **3.3. Tính năng nhân viên quầy**

- **Xác nhận giao dịch nạp tiền tại quầy**
- **Xem thông báo về yêu cầu nạp tiền**

---

## **4. Công nghệ sử dụng**

### **4.1. Backend**

- **Java Spring Boot:** Framework chính cho các microservices
- **PostgreSQL:** Cơ sở dữ liệu chính cho mỗi service
- **Kafka:** Message queue cho xử lý bất đồng bộ
- **JWT:** Xác thực và phân quyền

### **4.2. Frontend**

- **React.js:** Thư viện chính cho frontend
- **Vite:** Build tool cho admin panel
- **TailwindCSS:** Framework CSS

### **4.3. DevOps & Infrastructure**

- **Docker:** Container hóa các dịch vụ
- **Docker Compose:** Orchestration cho môi trường phát triển
- **Nginx:** Reverse proxy (nếu cần)

---

## **5. Cấu trúc dự án**

```
mini-banking-system/
├── api-gateway/                # API Gateway service
├── services/                   # Backend microservices
│   ├── user-service/
│   ├── account-service/
│   ├── transaction-service/
│   ├── admin-service/
│   ├── log-service/
│   └── notification-service/
├── frontend/                   # Customer/Staff UI (React)
├── banking-admin-hub-main/     # Admin Panel (React + Vite)
├── docker/                     # Docker configs & init scripts
├── scripts/                    # Scripts quản lý
├── documentation/              # Tài liệu kỹ thuật
│   └── docs/                   # Tài liệu chi tiết
├── docker-compose.yml          # Docker Compose config
└── README.md                   # File hướng dẫn nhanh
```

---

## **6. Triển khai và vận hành**

### **6.1. Yêu cầu hệ thống**

- Docker Desktop
- Docker Compose
- RAM tối thiểu: 8GB
- Bộ nhớ trống: 10GB

### **6.2. Các bước triển khai**

1. Clone repository
2. Chạy lệnh `docker-compose up -d`
3. Kiểm tra trạng thái với `docker-compose ps`
4. Truy cập ứng dụng qua URL đã cung cấp

### **6.3. Tài khoản test**

| Loại | Email | Password |
|------|-------|----------|
| Admin | admin@minibank.com | Admin@123 |
| Customer | test.user@example.com | TestPassword#123 |
| Staff | staff@minibank.com | Staff@123 |
| Counter Admin | counter.admin@minibank.com | CounterAdmin@123 |

---

## **7. Lộ trình phát triển**

### **7.1. Hoàn thành**

- [x] Kiến trúc microservices cơ bản
- [x] Authentication và phân quyền
- [x] Các tính năng giao dịch cơ bản
- [x] Giao diện người dùng cơ bản
- [x] Giao diện quản trị

### **7.2. Kế hoạch phát triển**

- [ ] Tối ưu hóa hiệu suất và bảo mật
- [ ] Thêm tính năng báo cáo và phân tích
- [ ] Hỗ trợ đa ngôn ngữ
- [ ] Tích hợp các cổng thanh toán bên thứ ba
- [ ] Phát triển ứng dụng di động

---

## **8. Liên hệ và hỗ trợ**

- **Repository:** [Link đến repository]
- **Documentation:** [Link đến tài liệu chi tiết]
- **Issues:** [Link đến issue tracker]

---

**Lưu ý:** Đây là tài liệu tổng quan về dự án. Để biết chi tiết kỹ thuật, vui lòng tham khảo các tài liệu khác trong thư mục documentation.
