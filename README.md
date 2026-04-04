# Flower Shop E-commerce Platform

Hệ thống thương mại điện tử chuyên biệt cho ngành hoa kiểng, được xây dựng trên nền tảng **MERN Stack** (MongoDB, Express, React, Node.js). Dự án tập trung vào trải nghiệm người dùng mượt mà, quản trị linh hoạt và khả năng tiếp cận (accessibility) tối ưu.

## Các tính năng chính

### Giao diện người dùng
- **Trình diễn sản phẩm**: Trang chủ tích hợp banner tự động, danh mục sản phẩm nổi bật và đánh giá từ khách hàng.
- **Trải nghiệm mua sắm**: Giỏ hàng lưu trữ đồng bộ với LocalStorage, cập nhật số lượng thời gian thực.
- **Tối ưu hóa hiển thị**: Hỗ trợ chế độ Dark Mode, hình ảnh tải chậm (Lazy-load) và thiết kế đáp ứng (Responsive).
- **Tiêu chuẩn Accessibility**: Tuân thủ ARIA, hỗ trợ điều hướng bàn phím (Keyboard navigation) và trình đọc màn hình.

### Hệ thống quản trị
- **Quản lý nội dung**: CRUD sản phẩm (hỗ trợ tải lên nhiều ảnh) và bài viết hướng dẫn.
- **Điều phối đơn hàng**: Theo dõi và cập nhật trạng thái đơn hàng tập trung.
- **Bảo mật**: Xác thực qua JWT và phân quyền người dùng (Role-based access control).

## Công nghệ sử dụng
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose ODM)
- **DevOps**: Docker, Docker Compose, Nginx

## Cài đặt hệ thống

### Yêu cầu tiên quyết
- Node.js phiên bản 18 trở lên
- Cơ sở dữ liệu MongoDB (Local hoặc Atlas)

### 1. Cấu hình Backend

```powershell
cd backend
npm install
# Cấu hình MONGO_URI và JWT_SECRET trong file .env
npm run seed
npm run dev
```

- Tài khoản mặc định: `admin@flower.local / admin123`
- Endpoint: `http://localhost:5000`

### 2. Cấu hình Frontend

```powershell
cd frontend
npm install
npm run dev
```

- Endpoint: `http://localhost:5173`

### 3. Triển khai với Docker

```powershell
docker-compose up -d --build
```

## Danh mục API

| Nhóm      | Phương thức | Endpoint           | Mô tả                               |
|-----------|-------------|--------------------|-------------------------------------|
| Xác thực  | POST        | /api/auth/login    | Đăng nhập hệ thống                  |
| Sản phẩm  | GET         | /api/products      | Lấy danh sách sản phẩm              |
| Sản phẩm  | POST        | /api/products      | Thêm sản phẩm mới (Admin)           |
| Bài viết  | GET         | /api/articles      | Lấy danh sách bài viết              |
| Đơn hàng  | POST        | /api/orders        | Khởi tạo đơn hàng                   |
| Đơn hàng  | GET         | /api/orders        | Xem danh sách đơn hàng (Admin)      |
| Tệp tin   | POST        | /api/upload        | Tải tệp lên hệ thống                |

## Xử lý sự cố

### Xung đột cổng (Port conflict)
Nếu cổng `5173` đã được sử dụng, thực hiện lệnh sau trên PowerShell để giải phóng:

```powershell
$pid = (Get-NetTCPConnection -LocalPort 5173 | Select -First 1).OwningProcess
Stop-Process -Id $pid -Force
```
