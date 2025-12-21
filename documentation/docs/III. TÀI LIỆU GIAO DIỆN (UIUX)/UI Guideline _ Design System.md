# **UI SPECIFICATION DOCUMENT -- MINI BANKING SYSTEM** {#ui-specification-document-mini-banking-system}

**Version:** 1.0  
**Date:** 2025  
**Author:** Nhóm 7

# **1. Purpose** {#purpose}

Tài liệu mô tả giao diện người dùng (UI) cho hệ thống Mini Banking, bao
gồm:

- Cấu trúc các màn hình

- Các thành phần giao diện

- Input/Output

- Trạng thái (error/success)

- Behavior (hành vi giao diện)

- Navigation Flow

Mục tiêu là giúp Frontend Developer và đội QA hiểu rõ từng màn hình.

# **2. UI PRINCIPLES** {#ui-principles}

- Giao diện đơn giản, trực quan

- Dùng màu sắc nhất quán

- Hỗ trợ responsive (Laptop, Mobile)

- Tập trung vào tính dễ dùng, bảo mật

- Mọi trường quan trọng phải có validate

# **3. SCREEN LIST** {#screen-list}

Hệ thống có 11 màn hình chính:

1.  Login

2.  Register

3.  Forgot Password

4.  Reset Password

5.  User Dashboard

6.  Deposit

7.  Withdraw

8.  Transfer

9.  Transaction History

10. User Account Settings (Self-Freeze)

11. Admin Dashboard & Management

# **4. UI SPECIFICATION BY SCREEN** {#ui-specification-by-screen}

# **4.1. LOGIN PAGE** {#login-page}

### **URL: /login**

### **Components**

| **Loại** | **Tên**            | **Mô tả**                           |
|----------|--------------------|-------------------------------------|
| Input    | Email              | Nhập email                          |
| Input    | Password           | Nhập mật khẩu                       |
| Button   | Login              | Gửi request đăng nhập               |
| Link     | Forgot password?   | Điều hướng sang trang quên mật khẩu |
| Link     | Create new account | Điều hướng sang trang đăng ký       |

### **Validation**

- Email không hợp lệ → \"Email format invalid\"

- Mật khẩu sai → \"Incorrect email or password\"

- Tài khoản bị khóa → \"Your account is locked\"

### **Success**

- Điều hướng → /dashboard

# **4.2. REGISTER PAGE** {#register-page}

### **URL: /register**

### **Components**

| **Loại** | **Mô tả**        |
|----------|------------------|
| Input    | Email            |
| Input    | Password         |
| Input    | Confirm password |
| Input    | Full name        |
| Button   | Register         |
| Link     | Login            |

### **Validation**

- Email tồn tại → \"Email already used\"

- Password yếu → \"Password must contain uppercase, number...\"

### **Success**

- Hiển thị \"Registration successful\"

- Điều hướng → /login

# **4.3. FORGOT PASSWORD PAGE** {#forgot-password-page}

### **URL: /forgot-password**

### **Components**

- Input: Email

- Button: Send OTP

### **Behavior**

- Nếu email không tồn tại → lỗi

- Thành công → thông báo \"OTP sent to your email\"

# **4.4. RESET PASSWORD PAGE** {#reset-password-page}

### **URL: /reset-password**

### **Components**

- Input: OTP

- Input: New password

- Input: Confirm new password

- Button: Reset password

### **Success**

- \"Password successfully updated\"

- Điều hướng → /login

# **4.5. USER DASHBOARD** {#user-dashboard}

### **URL: /dashboard**

### **Components**

| **Thành phần** | **Mô tả**           |
|----------------|---------------------|
| User Info Card | Email, Họ tên       |
| Balance Card   | Số dư hiện tại      |
| Button         | Deposit             |
| Button         | Withdraw            |
| Button         | Transfer            |
| Button         | Transaction History |
| Button         | Freeze Account      |
| Button         | Logout              |

### **Behavior**

- WebSocket realtime cập nhật số dư khi có giao dịch

- Nếu tài khoản FROZEN → disable thao tác

# **4.6. DEPOSIT PAGE** {#deposit-page}

### **URL: /deposit**

### **Components**

- Input: Amount

- Button: Confirm deposit

- Text: Balance after deposit

### **Error**

- \"Invalid amount\"

- \"Account is frozen\"

# **4.7. WITHDRAW PAGE** {#withdraw-page}

### **URL: /withdraw**

### **Components**

- Input: Amount

- Button: Confirm withdrawal

- Balance kiểm tra tự động

### **Errors**

- \"Insufficient balance\"

- \"Account is frozen\"

# **4.8. TRANSFER PAGE** {#transfer-page}

### **URL: /transfer**

### **Components**

- Input: Receiver account ID

- Input: Amount

- Button: Transfer

### **Success**

- Hiện popup giao dịch thành công

- Cập nhật WebSocket realtime

### **Errors**

- \"Receiver account does not exist\"

- \"Not enough balance\"

- \"Your account is frozen\"

# **4.9. TRANSACTION HISTORY PAGE** {#transaction-history-page}

### **URL: /transactions**

### **Components**

| **Component** | **Mô tả**           |
|---------------|---------------------|
| Filter        | Loại giao dịch      |
| Filter        | Thời gian từ -- đến |
| Table         | Danh sách giao dịch |
| Pagination    | Trang 1,2,3...      |

### **Columns**

- Transaction ID

- Type

- Amount

- Timestamp

- Status

### **Empty state**

\"No transactions found\"

# **4.10. USER SETTINGS / SELF-FREEZE** {#user-settings-self-freeze}

### **URL: /settings**

### **Components**

- User info card

- Change password button (optional)

- Button: **Freeze Account (Self-Freeze)  
  > **

### **Freeze Confirmation Popup**

- Input: Password or OTP

- Button: Confirm

### **Behavior**

- Sau khi freeze → tự động logout

- WebSocket gửi alert về thiết bị khác

# **4.11. ADMIN DASHBOARD** {#admin-dashboard}

### **URL: /admin/dashboard**

### **Components**

1.  **User Table  
    > **

    - Email

    - Status

    - Balance

    - CreatedAt

    - Actions (Lock, Unlock, Freeze, Unfreeze)

2.  **Report Summary  
    > **

    - Total users

    - Total transactions today

    - Total money transferred

    - Failed transactions

3.  **Filters  
    > **

    - Status filter

    - Search user

# **5. COLOR & TYPOGRAPHY GUIDELINES** {#color-typography-guidelines}

### **Primary Color: \#2563EB (blue)**

### **Secondary Color: \#4B5563 (gray)**

### **Success: \#16A34A**

### **Error: \#DC2626**

### **Typography**

- Title: 24px / Bold

- Subtitle: 18px / Medium

- Body: 16px / Regular

- Small text: 14px

# **6. ICONS & UX RULES** {#icons-ux-rules}

- Icon tài khoản: user-circle

- Icon giao dịch: arrows-left-right

- Icon nạp tiền: plus-circle

- Icon cảnh báo: exclamation-triangle

- Button Freeze phải màu đỏ

# **7. RESPONSIVE BEHAVIOR** {#responsive-behavior}

**Mobile:**

- 1-column layout

- Card collapse

- Menu dưới dạng Drawer

**Desktop:**

- 2-column hoặc 3-column layout

- Table full-width

# **8. NAVIGATION FLOW** {#navigation-flow}

Login → Dashboard → (Deposit / Withdraw / Transfer / History / Settings)

Register → Login

Forgot password → Reset password → Login

Admin login → Admin dashboard → user management

# **9. VALIDATION RULES** {#validation-rules}

### **Form input validation:**

- Email: regex

- Password: min 8 chars, 1 number, 1 uppercase

- Amount \> 0

- OTP = 6 digits

### **Error message standard:**

- Dễ hiểu

- Ngắn gọn

- Không để lộ thông tin hệ thống

# **10. ACCESSIBILITY** {#accessibility}

- Font \>= 14px

- Tương phản màu tối thiểu 4.5:1

- Button clickable area \>= 44px

- Có focus outline cho keyboard navigation
