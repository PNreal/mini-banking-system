# mini-banking
Mini Banking System - Java Spring Boot Microservices + React + PostgreSQL
# 🏦 Mini Banking System
> Java Spring Boot Microservices + React + PostgreSQL + Docker  
> Team 6 members — 2025

## Structure
doc/
- backend/
- /auth-service
- /user-service
- /account-service
- /transaction-service
- /notification-service
- /admin-service
- frontend/
- docs/
## Tech Stack
- Java Spring Boot 3
- ReactJS
- PostgreSQL
- Docker & Docker Compose

## Features

### User Features
- Đăng ký/Đăng nhập
- Nạp tiền (Ví điện tử, Quét mã QR, Nạp tại quầy)
- Rút tiền (Rút tại quầy, Ví điện tử)
- Chuyển khoản
- Xem lịch sử giao dịch
- Quản lý thông tin cá nhân

### Admin Features
- Quản lý người dùng (Khóa/Mở khóa, Đóng băng/Mở đóng băng)
- **Quản lý quầy giao dịch** (Thêm, Sửa, Xóa quầy)
- **Quản lý nhân viên trong quầy** (Thêm, Sửa, Xóa nhân viên - mã số và tên)
- Xem thống kê và báo cáo

### Staff Features
- Xác nhận giao dịch nạp tiền tại quầy
- Xem thông báo về yêu cầu nạp tiền

## Recent Updates

### Quản lý quầy giao dịch và nhân viên (Latest)
- Admin có thể thêm, sửa, xóa quầy giao dịch
- Admin có thể quản lý nhân viên trong từng quầy (mã số nhân viên và tên)
- Giao diện quản lý trực quan với danh sách quầy và nhân viên
- API endpoints đầy đủ cho CRUD operations

Xem chi tiết API tại: `docs/II. TÀI LIỆU PHÂN TÍCH & THIẾT KẾ HỆ THỐNG/API Specification.md`