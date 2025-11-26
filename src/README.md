# Flower Shop - Cửa hàng Hoa Kiểng

Website bán và quảng bá hoa kiểng chuyên nghiệp, xây dựng với React, Node.js, và MongoDB.

## 🌟 Tính năng

### Người dùng
- 🏠 Trang chủ với banner tự động, sản phẩm nổi bật, bán chạy, testimonials
- 🛍️ Cửa hàng với danh sách sản phẩm từ API
- 🛒 Giỏ hàng với lưu trữ local và badge số lượng
- 📝 Thanh toán với thông tin khách hàng
- 📰 Bài viết hướng dẫn chăm sóc hoa
- 🌓 Dark mode với lưu preferences
- ♿ Accessibility: ARIA, skip links, keyboard nav, screen reader announcements

### Quản trị viên
- ✏️ CRUD sản phẩm với upload nhiều ảnh
- ✏️ CRUD bài viết
- 📦 Quản lý đơn hàng
- 🔐 JWT authentication + role-based access

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- MongoDB (local hoặc Atlas)

### 1. Backend

```powershell
cd backend
npm install

# Tạo .env
copy .env.example .env
# Sửa MONGO_URI và JWT_SECRET trong .env

# Seed dữ liệu
npm run seed

# Chạy dev
npm run dev
```

Tài khoản admin: `admin@flower.local` / `admin123`  
Backend: http://localhost:5000

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173  
(Vite proxy `/api` → backend)

### 3. Docker (tùy chọn)

```powershell
docker-compose up -d --build
```

- Frontend (nginx): http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB local container

## 📚 API Endpoints

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập (JWT)

### Products
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo (admin)
- `PUT /api/products/:id` - Cập nhật (admin)
- `DELETE /api/products/:id` - Xóa (admin)

### Articles
- `GET /api/articles` - Danh sách bài viết
- `POST /api/articles` - Tạo (admin)
- `PUT /api/articles/:id` - Cập nhật (admin)
- `DELETE /api/articles/:id` - Xóa (admin)

### Orders
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders` - Danh sách (admin)
- `PUT /api/orders/:id` - Cập nhật trạng thái (admin)

### Upload
- `POST /api/upload` - Upload file (admin)
- `DELETE /api/upload/:filename` - Xóa file (admin)

## 🎨 UI/UX Features

- Banner carousel với play/pause + pause-on-hover
- Card animations (hover lift)
- Dark mode toggle
- Cart badge hiển thị số lượng
- Lazy-load images
- Skip-to-content link
- Keyboard navigation (Arrow keys)
- Screen reader announcements (aria-live)
- Mobile-first responsive

## 🔧 Troubleshooting

### Port đã được sử dụng
```powershell
$pid = (Get-NetTCPConnection -LocalPort 5173 | Select -First 1).OwningProcess
Stop-Process -Id $pid -Force
```

### MongoDB Atlas Whitelist
Thêm IP vào Network Access trong Atlas Console hoặc dùng `0.0.0.0/0` (dev only).

## 📦 Scripts

### Backend
- `npm start` - Production
- `npm run dev` - Development (nodemon)
- `npm run seed` - Seed data

### Frontend
- `npm run dev` - Dev server
- `npm run build` - Build production
- `npm run preview` - Preview build

## 📝 License

MIT © 2025 Flower Shop Team
