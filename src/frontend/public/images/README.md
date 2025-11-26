# Hướng dẫn thay logo và ảnh

## 📁 Cấu trúc thư mục images

```
public/images/
├── logo.png          - Logo chính (khuyến nghị 200x200px, PNG với nền trong suốt)
├── hero1.jpg         - Banner slide 1 (1920x600px)
├── hero2.jpg         - Banner slide 2 (1920x600px)
├── hero3.jpg         - Banner slide 3 (1920x600px)
├── sample-plant.jpg  - Ảnh sản phẩm mẫu (600x600px)
└── README.md         - File này
```

## 🎨 Yêu cầu kỹ thuật

### Logo
- **Format**: PNG (nền trong suốt) hoặc SVG
- **Kích thước**: 200x200px (hoặc tỷ lệ 1:1)
- **Dung lượng**: < 100KB
- **Màu sắc**: Tương thích với theme vàng/amber

### Banner (Hero Images)
- **Format**: JPG hoặc WebP
- **Kích thước**: 1920x600px (desktop) hoặc 800x400px (mobile)
- **Dung lượng**: < 500KB/ảnh
- **Chất lượng**: 80-90% để cân bằng giữa chất lượng và tốc độ

### Ảnh sản phẩm
- **Format**: JPG hoặc WebP
- **Kích thước**: 600x600px (tỷ lệ 1:1)
- **Dung lượng**: < 200KB/ảnh
- **Background**: Nên có nền trắng hoặc trong suốt

## 📝 Cách thay đổi

### 1. Thay logo
Đặt file logo mới vào: `public/images/logo.png`

### 2. Thay ảnh banner
Đặt 3 ảnh banner vào:
- `public/images/hero1.jpg`
- `public/images/hero2.jpg`
- `public/images/hero3.jpg`

### 3. Thay ảnh sản phẩm mẫu
Đặt file vào: `public/images/sample-plant.jpg`

## 🔧 Tối ưu ảnh (khuyến nghị)

### Sử dụng TinyPNG
1. Truy cập https://tinypng.com/
2. Upload ảnh
3. Download ảnh đã nén

### Sử dụng ImageOptim (Mac) hoặc FileOptimizer (Windows)
- Giảm dung lượng mà không mất chất lượng

## 💡 Mẹo
- Dùng ảnh chất lượng cao cho banner (hiển thị toàn màn hình)
- Dùng ảnh tối ưu cho sản phẩm (nhiều ảnh, tải nhanh)
- Logo nên đơn giản, dễ nhận diện
- Kiểm tra ảnh trên cả light/dark mode
