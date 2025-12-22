# Hướng Dẫn Cài Đặt PATH để Chạy Banking System từ Bất Kỳ Đâu

## Cách 1: Thêm vào Environment Variables (Khuyến nghị)

### Bước 1: Mở Environment Variables
- Nhấn `Win + X` → chọn "System"
- Hoặc tìm "Environment Variables" trong Start menu
- Click "Environment Variables" ở góc dưới phải

### Bước 2: Thêm biến môi trường mới
1. Click "New..." (dưới "User variables")
2. Điền:
   - **Variable name:** `BANKING_PROJECT`
   - **Variable value:** `X:\mini-banking-system` (thay bằng đường dẫn thực tế của bạn)
3. Click OK

### Bước 3: Thêm vào PATH
1. Chọn biến `Path` → Click "Edit"
2. Click "New" → Thêm: `%BANKING_PROJECT%\scripts`
3. Click OK

### Bước 4: Khởi động lại terminal
- Đóng tất cả terminal/PowerShell
- Mở terminal mới

### Bước 5: Chạy lệnh
```bash
start-banking.bat
```

---

## Cách 2: Tạo Shortcut trên Desktop (Nhanh nhất)

1. Chuột phải trên Desktop → "New" → "Shortcut"
2. Điền đường dẫn:
   ```
   cmd.exe /c "X:\mini-banking-system\scripts\start-banking.bat"
   ```
3. Đặt tên: `Start Banking System`
4. Click Finish

Giờ chỉ cần double-click shortcut để khởi động!

---

## Cách 3: Thêm vào PowerShell Profile

### Bước 1: Mở PowerShell Profile
```powershell
notepad $PROFILE
```

### Bước 2: Thêm dòng này vào file
```powershell
# Mini Banking System
Set-Alias -Name banking-start -Value "X:\mini-banking-system\scripts\start-banking.ps1"
Set-Alias -Name banking-cmd -Value "X:\mini-banking-system\scripts\banking-commands.bat"

function banking-go {
    Set-Location "X:\mini-banking-system"
}
```

### Bước 3: Lưu file (Ctrl+S) và khởi động lại PowerShell

### Bước 4: Chạy lệnh
```powershell
banking-start
```

---

## Các Lệnh Có Sẵn

Sau khi cài đặt PATH, bạn có thể chạy:

### Batch Commands
```bash
start-banking.bat          # Khởi động tất cả services
banking-commands start     # Khởi động
banking-commands stop      # Dừng
banking-commands status    # Kiểm tra trạng thái
banking-commands logs      # Xem logs
banking-commands reset     # Reset dữ liệu
banking-commands clean     # Xóa tất cả
```

### PowerShell Commands
```powershell
banking-start              # Khởi động tất cả services
banking-cmd start          # Khởi động
banking-cmd stop           # Dừng
banking-cmd status         # Kiểm tra trạng thái
banking-go                 # Chuyển đến thư mục dự án
```

---

## Kiểm Tra Cài Đặt

Mở terminal mới và chạy:
```bash
echo %BANKING_PROJECT%
```

Nếu hiển thị đường dẫn dự án, cài đặt thành công!

---

## Troubleshooting

### Lỗi: "start-banking.bat is not recognized"
- Kiểm tra PATH đã được thêm chưa: `echo %PATH%`
- Khởi động lại terminal
- Kiểm tra đường dẫn có đúng không

### Lỗi: "Docker is not installed"
- Cài Docker Desktop: https://www.docker.com/products/docker-desktop/
- Khởi động Docker Desktop
- Khởi động lại terminal

### Lỗi: "no configuration file provided"
- Đảm bảo bạn đang chạy từ thư mục dự án
- Hoặc sử dụng script `start-banking.bat` (tự động chuyển đến thư mục đúng)

---

## Gợi Ý

- **Cách 1** (Environment Variables): Tốt nhất cho long-term, có thể sử dụng lại
- **Cách 2** (Shortcut): Nhanh nhất, chỉ cần double-click
- **Cách 3** (PowerShell Profile): Tốt nhất cho DevOps/developers

Chọn cách phù hợp với bạn!
