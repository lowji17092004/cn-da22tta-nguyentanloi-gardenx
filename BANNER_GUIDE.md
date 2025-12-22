# Hướng dẫn thêm Banner cho trang

## Bước 1: Tải ảnh banner
1. Truy cập: https://vivina.net/hoa-cay-canh-cay-ct-c741.html
2. Click chuột phải vào banner (ảnh lớn ở đầu trang)
3. Chọn "Save image as..." / "Lưu ảnh với tên..."
4. Lưu với tên: `banner-products.jpg`

## Bước 2: Copy ảnh vào project
```bash
# Copy ảnh vào thư mục public/images
Copy-Item "path\to\downloaded\banner-products.jpg" "D:\DOANCN\src\frontend\public\images\banner-products.jpg"
```

## Bước 3: Các trang cần thêm banner
- ✅ Trang sản phẩm (Shop)
- ✅ Trang chi tiết sản phẩm
- ✅ Trang đơn hàng (Orders)
- ✅ Trang chi tiết đơn hàng
- ✅ Trang giỏ hàng (Cart)

## Bước 4: Code mẫu để thêm banner
```jsx
{/* Banner Section */}
<div className="page-banner">
  <img 
    src="/images/banner-products.jpg" 
    alt="Banner" 
    className="banner-image"
    onError={(e) => { e.target.src = '/images/hoakieng.jpg'; }}
  />
  <div className="banner-overlay">
    <h1 className="banner-title">Tiêu đề trang</h1>
    <p className="banner-subtitle">Mô tả ngắn</p>
  </div>
</div>
```

## CSS cho banner
```css
.page-banner {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  margin-bottom: 40px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 20px;
}

.banner-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 12px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.banner-subtitle {
  font-size: 18px;
  font-weight: 400;
  opacity: 0.95;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}
```

## Lưu ý
- Ảnh banner nên có kích thước tối thiểu: 1920x400px
- Format: JPG hoặc WebP để tối ưu tốc độ tải
- Nếu không tải được ảnh từ vivina.net, có thể dùng ảnh có sẵn trong `/public/images/`
