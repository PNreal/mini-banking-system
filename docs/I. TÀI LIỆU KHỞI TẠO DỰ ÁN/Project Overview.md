# **PROJECT OVERVIEW – MINI BANKING SYSTEM**

## **1\. Giới thiệu tổng quan**

Mini Banking System là một hệ thống mô phỏng ngân hàng trực tuyến được xây dựng nhằm hỗ trợ việc học tập, nghiên cứu và thực hành phát triển các ứng dụng tài chính có tính an toàn và độ tin cậy cao. Dự án mô phỏng đầy đủ các quy trình giao dịch cơ bản của ngân hàng như: nạp tiền, rút tiền, chuyển khoản và quản lý người dùng.

Hệ thống áp dụng kiến trúc hiện đại, bảo mật và đáp ứng yêu cầu hoạt động ổn định với nhiều người dùng đồng thời.

## **2\. Mục tiêu của dự án**

Dự án hướng tới các mục tiêu chính sau:

* **Tạo hệ thống ngân hàng mô phỏng** giúp người học hiểu rõ quy trình nghiệp vụ tài chính.

* **Đảm bảo tính toàn vẹn dữ liệu** thông qua transaction ACID trong các thao tác số dư.

* **Thiết kế kiến trúc microservices hiện đại**, dễ mở rộng và bảo trì.

* **Cung cấp bộ API chuẩn RESTful**, hỗ trợ giao tiếp với frontend hoặc bên thứ ba.

* **Xây dựng môi trường thực hành hoàn chỉnh**: backend, database, UI, logging, monitoring.

* **Tăng cường tính bảo mật**: mã hóa mật khẩu, JWT, chống brute-force, kiểm soát truy cập.

## **3\. Phạm vi của dự án**

Hệ thống bao gồm 3 nhóm nghiệp vụ chính:

### **3.1. Nhóm 1 – User Management**

* Đăng ký, đăng nhập, đăng xuất

* Quên mật khẩu / Reset mật khẩu qua OTP/token

* Xem thông tin tài khoản

* Tự đóng băng tài khoản (Self-Freeze)

### **3.2. Nhóm 2 – Transaction Management**

* Nạp tiền (Deposit)

* Rút tiền (Withdraw)

* Chuyển tiền nội bộ (Transfer)

* Xem lịch sử giao dịch có phân trang

### **3.3. Nhóm 3 – Admin Management**

* Xem danh sách user

* Khóa, mở khoá tài khoản

* Đóng băng / Gỡ đóng băng tài khoản user

* Xem báo cáo tổng quan giao dịch

## **4\. Kiến trúc hệ thống**

Hệ thống áp dụng:

* **Microservices Architecture**

* **Giao tiếp qua REST API và sự kiện**

* **Mỗi service có database riêng (Database per Service)**

* **API Gateway làm điểm truy cập duy nhất**

* **Tech stack:**

  * Backend: Spring Boot

  * Frontend: React \+ Tailwind

  * Database: PostgreSQL

  * Message Queue: Kafka

  * Authentication: JWT

  * CI/CD: GitHub Actions

  * Deployment: Docker & Kubernetes

## **5\. Người dùng và nhu cầu**

### **User (Khách hàng)**

* Thực hiện giao dịch nhanh chóng, an toàn.

* Xem số dư, lịch sử giao dịch.

* Chủ động bảo vệ tài khoản (Self-Freeze).

### **Admin**

* Kiểm soát hoạt động hệ thống.

* Xử lý các tài khoản bất thường.

* Theo dõi báo cáo giao dịch.

### **Nhóm phát triển**

* Hệ thống có cấu trúc rõ ràng, dễ mở rộng và bảo trì.

* Tài liệu chi tiết và thống nhất.

## **6\. Giá trị mang lại**

* **Đối với học tập:** giúp sinh viên nắm vững kiến trúc microservices, giao dịch tài chính, bảo mật.

* **Đối với doanh nghiệp:** mô phỏng hệ thống ngân hàng có thể dùng trong đào tạo nội bộ.

* **Đối với dev:** một hệ thống hoàn chỉnh để học kiến trúc, database, API và quy trình DevOps.
