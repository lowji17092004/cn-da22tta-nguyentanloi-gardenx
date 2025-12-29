# 📊 MÔ HÌNH DỮ LIỆU VÀ DANH SÁCH THỰC THỂ
## THE SUN GARDEN E-COMMERCE PLATFORM

---

## 📑 MỤC LỤC

1. [Tổng quan mô hình dữ liệu](#tổng-quan-mô-hình-dữ-liệu)
2. [Danh sách thực thể](#danh-sách-thực-thể)
3. [Chi tiết từng thực thể](#chi-tiết-từng-thực-thể)
4. [Mối quan hệ giữa các thực thể](#mối-quan-hệ-giữa-các-thực-thể)
5. [Bảng tổng hợp](#bảng-tổng-hợp)

---

## 🎯 TỔNG QUAN MÔ HÌNH DỮ LIỆU

### Kiến trúc Database
- **Loại Database**: MongoDB (NoSQL - Document-based)
- **ORM/ODM**: Mongoose 7.0+
- **Tổng số Collections**: 9
- **Embedded Documents**: 2 (OrderItems, Media)
- **Quan hệ Many-to-Many**: 1 (Users ↔ Coupons)

### Phân loại thực thể

```
┌─────────────────────────────────────────┐
│    CORE ENTITIES (Thực thể chính)       │
├─────────────────────────────────────────┤
│  1. Users         - Quản lý người dùng  │
│  2. Products      - Sản phẩm            │
│  3. Categories    - Danh mục            │
│  4. Orders        - Đơn hàng            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   SUPPORT ENTITIES (Thực thể hỗ trợ)    │
├─────────────────────────────────────────┤
│  5. Reviews       - Đánh giá            │
│  6. Messages      - Tin nhắn            │
│  7. Articles      - Bài viết            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BUSINESS ENTITIES (Nghiệp vụ)          │
├─────────────────────────────────────────┤
│  8. Coupons       - Mã giảm giá         │
│  9. UserCoupons   - Mã đã lưu (M:N)     │
└─────────────────────────────────────────┘
```

---

## 📋 DANH SÁCH THỰC THỂ

### Bảng tổng hợp nhanh

| # | Tên Collection | Mô tả | Số trường | Relationships | Indexes |
|---|----------------|-------|-----------|---------------|---------|
| 1 | **Users** | Tài khoản người dùng | 13 | 1:N (Orders, Reviews, Messages) | 4 |
| 2 | **Products** | Sản phẩm cây cảnh | 12 | N:1 (Categories), 1:N (Reviews) | 7 |
| 3 | **Categories** | Danh mục phân loại | 8 | 1:N (Products, Articles) | 4 |
| 4 | **Orders** | Đơn hàng | 17 | N:1 (Users), N:1 (Coupons) | 4 |
| 5 | **Reviews** | Đánh giá sản phẩm | 10 | N:1 (Users, Products, Orders) | 5 |
| 6 | **Messages** | Tin nhắn hỗ trợ | 9 | N:1 (Users) | 4 |
| 7 | **Coupons** | Mã giảm giá | 11 | 1:N (Orders, UserCoupons) | 5 |
| 8 | **UserCoupons** | Mã đã lưu | 5 | N:1 (Users, Coupons) | 3 |
| 9 | **Articles** | Bài viết blog | 11 | N:1 (Categories, Users) | 6 |

---

## 📖 CHI TIẾT TỪNG THỰC THỂ

---

## 1. 👤 USERS (Người dùng)

### 📌 Thông tin cơ bản
- **Collection Name**: `users`
- **Mục đích**: Quản lý tài khoản và phân quyền người dùng
- **Model File**: `src/backend/models/User.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef0"),
  name: "Nguyễn Văn A",
  email: "user@example.com",
  password: "$2a$10$hashedPasswordString...",
  role: "user",
  phoneNumber: "0912345678",
  avatar: "/uploads/avatars/user123.jpg",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  isLocked: false,
  googleId: null,
  resetPasswordOtp: null,
  resetPasswordExpires: null,
  createdAt: ISODate("2025-01-15T10:30:00Z"),
  updatedAt: ISODate("2025-01-20T14:25:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Unique | Mô tả |
|------------|--------------|----------|--------|-------|
| `_id` | ObjectId | ✅ | ✅ | Primary Key tự động |
| `name` | String | ✅ | ❌ | Họ tên người dùng |
| `email` | String | ✅ | ✅ | Email đăng nhập (lowercase, trim) |
| `password` | String | ✅ | ❌ | Mật khẩu đã hash (bcrypt, 10 rounds) |
| `role` | String (Enum) | ✅ | ❌ | Vai trò: `admin`, `collaborator`, `user` |
| `phoneNumber` | String | ❌ | ✅ | Số điện thoại (sparse index) |
| `avatar` | String | ❌ | ❌ | URL ảnh đại diện |
| `address` | String | ❌ | ❌ | Địa chỉ giao hàng mặc định |
| `isLocked` | Boolean | ✅ | ❌ | Trạng thái khóa tài khoản (default: false) |
| `googleId` | String | ❌ | ❌ | Google OAuth ID |
| `resetPasswordOtp` | String | ❌ | ❌ | Mã OTP 6 số reset password |
| `resetPasswordExpires` | Date | ❌ | ❌ | Thời hạn OTP (5 phút) |
| `createdAt` | Date | ✅ | ❌ | Timestamp tạo (auto) |
| `updatedAt` | Date | ✅ | ❌ | Timestamp cập nhật (auto) |

### 🔑 Indexes

```javascript
// Unique indexes
{ email: 1 }          // Đăng nhập, tìm kiếm user
{ phoneNumber: 1 }    // Sparse index (có thể null)

// Regular indexes
{ role: 1 }           // Filter theo vai trò
{ googleId: 1 }       // Google OAuth lookup
```

### 🔗 Relationships

```
Users (1) ──→ (N) Orders
Users (1) ──→ (N) Reviews
Users (1) ──→ (N) Messages
Users (1) ──→ (N) Articles (as author)
Users (M) ←→ (N) Coupons (through UserCoupons)
```

### ⚙️ Business Rules

1. **Email**: 
   - Phải unique trong hệ thống
   - Tự động convert lowercase
   - Validation format email

2. **Password**:
   - Tối thiểu 6 ký tự
   - Hash bằng bcrypt (10 salt rounds)
   - Không lưu plaintext

3. **Role**:
   - Default: `user`
   - Chỉ admin mới tạo admin/collaborator
   - Ảnh hưởng đến permissions

4. **Lock Account**:
   - Admin có thể lock/unlock
   - User bị lock không đăng nhập được
   - Không xóa user, chỉ lock

### 📝 Sample Queries

```javascript
// Tìm user theo email
User.findOne({ email: 'user@example.com' });

// Lấy tất cả admin
User.find({ role: 'admin', isLocked: false });

// Update avatar
User.findByIdAndUpdate(userId, { avatar: newAvatarUrl });

// Check user tồn tại
User.exists({ email: email });
```

---

## 2. 🛍️ PRODUCTS (Sản phẩm)

### 📌 Thông tin cơ bản
- **Collection Name**: `products`
- **Mục đích**: Quản lý danh mục sản phẩm cây cảnh
- **Model File**: `src/backend/models/Product.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef1"),
  name: "Cây Tùng La Hán Mini",
  price: 250000,
  category: "cay-canh-noi-that",
  description: "Cây tùng la hán mini, phù hợp để bàn làm việc...",
  image: "/uploads/products/tung-la-han-main.jpg",
  images: [
    "/uploads/products/tung-la-han-1.jpg",
    "/uploads/products/tung-la-han-2.jpg"
  ],
  stock: 50,
  bestseller: true,
  featured: false,
  isHidden: false,
  createdAt: ISODate("2025-01-10T08:00:00Z"),
  updatedAt: ISODate("2025-01-25T15:30:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------|--------------|----------|-------|
| `_id` | ObjectId | ✅ | Primary Key |
| `name` | String | ✅ | Tên sản phẩm |
| `price` | Number | ✅ | Giá tiền (VND), min: 0 |
| `category` | String | ✅ | Tên hoặc slug danh mục |
| `description` | String | ❌ | Mô tả chi tiết (HTML) |
| `image` | String | ❌ | URL ảnh chính |
| `images` | Array\<String\> | ❌ | Mảng URL ảnh phụ |
| `stock` | Number | ✅ | Số lượng tồn kho, default: 0, min: 0 |
| `bestseller` | Boolean | ✅ | Sản phẩm bán chạy, default: false |
| `featured` | Boolean | ✅ | Sản phẩm nổi bật, default: false |
| `isHidden` | Boolean | ✅ | Ẩn khỏi trang chủ, default: false |
| `createdAt` | Date | ✅ | Timestamp tạo |
| `updatedAt` | Date | ✅ | Timestamp cập nhật |

### 🔑 Indexes

```javascript
// Text search
{ name: 'text', description: 'text' }

// Filter indexes
{ category: 1, isHidden: 1 }      // Lọc theo danh mục
{ bestseller: 1 }                 // Sản phẩm bán chạy
{ featured: 1 }                   // Sản phẩm nổi bật
{ price: 1 }                      // Sắp xếp theo giá
{ stock: 1 }                      // Kiểm tra tồn kho
```

### 🔗 Relationships

```
Products (N) ──→ (1) Categories
Products (1) ──→ (N) Reviews
Products (1) ──→ (N) OrderItems (embedded in Orders)
```

### ⚙️ Business Rules

1. **Stock Management**:
   - Tự động trừ khi tạo order
   - Hoàn lại khi cancel order
   - Ẩn tự động khi stock = 0

2. **Pricing**:
   - Giá phải > 0
   - Validation tại controller
   - Snapshot giá trong order

3. **Images**:
   - image: Ảnh chính (bắt buộc cho UX)
   - images: Tối đa 5 ảnh phụ
   - Upload qua multer

4. **Visibility**:
   - isHidden = true: Không hiện public
   - Vẫn xem được trong admin
   - Ảnh hưởng SEO

### 📝 Sample Queries

```javascript
// Lấy sản phẩm theo category
Product.find({ 
  category: /^cay-canh-noi-that$/i,
  isHidden: false,
  stock: { $gt: 0 }
});

// Sản phẩm bán chạy
Product.find({ bestseller: true, isHidden: false })
  .sort({ createdAt: -1 })
  .limit(10);

// Full-text search
Product.find({ $text: { $search: 'tùng la hán' } });

// Cập nhật stock
Product.findByIdAndUpdate(
  productId,
  { $inc: { stock: -quantity } },
  { new: true }
);
```

---

## 3. 📁 CATEGORIES (Danh mục)

### 📌 Thông tin cơ bản
- **Collection Name**: `categories`
- **Mục đích**: Phân loại sản phẩm và bài viết
- **Model File**: `src/backend/models/Category.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef2"),
  name: "Cây Cảnh Nội Thất",
  slug: "cay-canh-noi-that",
  description: "Cây cảnh phù hợp trang trí trong nhà, văn phòng",
  icon: "🪴",
  order: 1,
  isActive: true,
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-01T00:00:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Unique | Mô tả |
|------------|--------------|----------|--------|-------|
| `_id` | ObjectId | ✅ | ✅ | Primary Key |
| `name` | String | ✅ | ✅ | Tên danh mục |
| `slug` | String | ✅ | ✅ | URL-friendly name (auto-gen) |
| `description` | String | ❌ | ❌ | Mô tả danh mục |
| `icon` | String | ❌ | ❌ | Icon emoji hoặc URL |
| `order` | Number | ✅ | ❌ | Thứ tự hiển thị, default: 0 |
| `isActive` | Boolean | ✅ | ❌ | Kích hoạt, default: true |
| `createdAt` | Date | ✅ | ❌ | Timestamp tạo |
| `updatedAt` | Date | ✅ | ❌ | Timestamp cập nhật |

### 🔑 Indexes

```javascript
{ slug: 1 }        // Unique, URL lookup
{ name: 1 }        // Search by name
{ order: 1 }       // Sorting display
{ isActive: 1 }    // Filter active categories
```

### 🔗 Relationships

```
Categories (1) ──→ (N) Products
Categories (1) ──→ (N) Articles
```

### ⚙️ Business Rules

1. **Slug Generation**:
   - Tự động từ name
   - Lowercase, replace spaces với dashes
   - Unique constraint

2. **Order**:
   - Thứ tự hiển thị trên menu
   - Tự động increment khi tạo mới
   - Admin có thể sắp xếp lại

3. **Deletion**:
   - Không xóa nếu có products/articles
   - Set isActive = false thay vì xóa
   - Soft delete pattern

### 📝 Sample Queries

```javascript
// Lấy danh mục active
Category.find({ isActive: true }).sort({ order: 1 });

// Tìm theo slug
Category.findOne({ slug: 'cay-canh-noi-that' });

// Count products trong category
Product.countDocuments({ category: categorySlug });
```

---

## 4. 📦 ORDERS (Đơn hàng)

### 📌 Thông tin cơ bản
- **Collection Name**: `orders`
- **Mục đích**: Quản lý đơn hàng và vòng đời giao dịch
- **Model File**: `src/backend/models/Order.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef3"),
  user: ObjectId("67a1b2c3d4e5f6789abcdef0"),
  customerName: "Nguyễn Văn A",
  customerEmail: "user@example.com",
  phone: "0912345678",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  
  items: [
    {
      product: ObjectId("67a1b2c3d4e5f6789abcdef1"),
      name: "Cây Tùng La Hán Mini",
      price: 250000,
      quantity: 2,
      image: "/uploads/products/tung-la-han-main.jpg"
    }
  ],
  
  subtotal: 500000,
  shippingFee: 30000,
  discount: 50000,
  total: 480000,
  
  coupon: {
    code: "SUMMER2025",
    discountValue: 50000
  },
  
  status: "confirmed",
  statusHistory: [
    {
      status: "pending",
      note: "Đơn hàng mới",
      changedBy: ObjectId("67a1b2c3d4e5f6789abcdef0"),
      changedAt: ISODate("2025-01-20T10:00:00Z")
    },
    {
      status: "confirmed",
      note: "Admin xác nhận",
      changedBy: ObjectId("67a1b2c3d4e5f6789admin"),
      changedAt: ISODate("2025-01-20T11:00:00Z")
    }
  ],
  
  paymentMethod: "vnpay",
  paymentStatus: "paid",
  
  notes: "Giao hàng giờ hành chính",
  cancelReason: null,
  
  createdAt: ISODate("2025-01-20T10:00:00Z"),
  updatedAt: ISODate("2025-01-20T11:00:00Z")
}
```

### 📋 Danh sách trường chính

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------|--------------|----------|-------|
| `_id` | ObjectId | ✅ | Primary Key |
| `user` | ObjectId | ✅ | FK → Users |
| `customerName` | String | ✅ | Tên người nhận |
| `customerEmail` | String | ✅ | Email liên hệ |
| `phone` | String | ✅ | SĐT giao hàng |
| `address` | String | ✅ | Địa chỉ chi tiết |
| `items` | Array\<OrderItem\> | ✅ | Danh sách sản phẩm (embedded) |
| `subtotal` | Number | ✅ | Tổng tiền hàng (trước phí/giảm) |
| `shippingFee` | Number | ✅ | Phí vận chuyển, default: 0 |
| `discount` | Number | ✅ | Tổng giảm giá, default: 0 |
| `total` | Number | ✅ | Tổng thanh toán cuối cùng |
| `coupon` | Object | ❌ | Thông tin mã giảm giá |
| `status` | String (Enum) | ✅ | Trạng thái đơn hàng |
| `statusHistory` | Array\<Object\> | ✅ | Lịch sử thay đổi trạng thái |
| `paymentMethod` | String (Enum) | ✅ | Phương thức thanh toán |
| `paymentStatus` | String (Enum) | ✅ | Trạng thái thanh toán |
| `notes` | String | ❌ | Ghi chú khách hàng |
| `cancelReason` | String | ❌ | Lý do hủy đơn |
| `createdAt` | Date | ✅ | Timestamp tạo |
| `updatedAt` | Date | ✅ | Timestamp cập nhật |

### 📦 OrderItem Schema (Embedded)

```javascript
{
  product: ObjectId,      // FK → Products
  name: String,           // Snapshot tên SP
  price: Number,          // Snapshot giá
  quantity: Number,       // Số lượng mua
  image: String           // Snapshot ảnh
}
```

### 🔄 Status Flow

```
pending (Chờ xác nhận)
    ↓
confirmed (Đã xác nhận)
    ↓
preparing (Đang chuẩn bị)
    ↓
shipping (Đang giao)
    ↓
delivered (Đã giao)

// Cancel từ bất kỳ trạng thái nào (trừ delivered)
* → cancelled
```

### 💳 Payment Status

- `pending`: Chờ thanh toán
- `paid`: Đã thanh toán
- `failed`: Thanh toán thất bại

### 💰 Payment Methods

- `cash`: COD (Thanh toán khi nhận hàng)
- `vnpay`: VNPay gateway
- `momo`: MoMo e-wallet

### 🔑 Indexes

```javascript
{ user: 1, status: 1, createdAt: -1 }  // Compound index
{ status: 1 }                           // Filter by status
{ paymentStatus: 1 }                    // Filter payment
{ 'coupon.code': 1 }                    // Check coupon usage
```

### ⚙️ Business Rules

1. **Order Creation**:
   - Snapshot product info (tránh thay đổi giá)
   - Tự động trừ stock
   - Validate coupon nếu có

2. **Status Update**:
   - Lưu lịch sử mỗi lần thay đổi
   - Ghi nhận người thay đổi (changedBy)
   - User chỉ cancel ở pending
   - Admin/Collaborator cancel mọi trạng thái (trừ delivered)

3. **Stock Management**:
   - Trừ stock khi tạo order
   - Hoàn lại stock khi cancel
   - Transaction đảm bảo consistency

4. **Pricing**:
   - total = subtotal + shippingFee - discount
   - Validation tại backend

### 📝 Sample Queries

```javascript
// Lấy orders của user
Order.find({ user: userId })
  .sort({ createdAt: -1 })
  .populate('user', 'name email');

// Orders pending
Order.find({ status: 'pending' })
  .populate('user');

// Thống kê doanh thu
Order.aggregate([
  { $match: { status: 'delivered', paymentStatus: 'paid' } },
  { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
]);

// Update status
Order.findByIdAndUpdate(
  orderId,
  {
    status: 'confirmed',
    $push: {
      statusHistory: {
        status: 'confirmed',
        note: 'Admin xác nhận',
        changedBy: adminId,
        changedAt: new Date()
      }
    }
  }
);
```

---

## 5. ⭐ REVIEWS (Đánh giá)

### 📌 Thông tin cơ bản
- **Collection Name**: `reviews`
- **Mục đích**: Quản lý đánh giá sản phẩm với media
- **Model File**: `src/backend/models/Review.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef4"),
  user: ObjectId("67a1b2c3d4e5f6789abcdef0"),
  product: ObjectId("67a1b2c3d4e5f6789abcdef1"),
  order: ObjectId("67a1b2c3d4e5f6789abcdef3"),
  
  rating: 5,
  comment: "Cây đẹp, giao hàng nhanh!",
  
  media: [
    {
      url: "/uploads/reviews/review123-1.jpg",
      type: "image"
    },
    {
      url: "/uploads/reviews/review123-2.mp4",
      type: "video"
    }
  ],
  
  isApproved: true,
  
  adminReply: {
    content: "Cảm ơn bạn đã tin tùng sử dụng!",
    repliedBy: ObjectId("67a1b2c3d4e5f6789admin"),
    repliedAt: ISODate("2025-01-21T10:00:00Z")
  },
  
  createdAt: ISODate("2025-01-20T15:00:00Z"),
  updatedAt: ISODate("2025-01-21T10:00:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------|--------------|----------|-------|
| `_id` | ObjectId | ✅ | Primary Key |
| `user` | ObjectId | ✅ | FK → Users |
| `product` | ObjectId | ✅ | FK → Products |
| `order` | ObjectId | ✅ | FK → Orders (xác thực đã mua) |
| `rating` | Number | ✅ | Điểm đánh giá (1-5 sao) |
| `comment` | String | ✅ | Nội dung đánh giá |
| `media` | Array\<Object\> | ❌ | Mảng ảnh/video |
| `isApproved` | Boolean | ✅ | Đã duyệt, default: true |
| `adminReply` | Object | ❌ | Phản hồi từ admin |
| `createdAt` | Date | ✅ | Timestamp tạo |
| `updatedAt` | Date | ✅ | Timestamp cập nhật |

### 📸 Media Schema

```javascript
{
  url: String,      // Đường dẫn file
  type: String      // 'image' hoặc 'video'
}
```

### 💬 AdminReply Schema

```javascript
{
  content: String,                    // Nội dung reply
  repliedBy: ObjectId,                // FK → Users (admin)
  repliedAt: Date                     // Timestamp reply
}
```

### 🔑 Indexes

```javascript
{ product: 1 }                     // Query reviews by product
{ user: 1 }                        // Query user reviews
{ rating: 1 }                      // Filter/sort by rating
{ isApproved: 1 }                  // Show approved only
{ createdAt: -1 }                  // Sort newest first
{ user: 1, product: 1 }            // Unique compound (1 review/user/product)
```

### ⚙️ Business Rules

1. **Review Eligibility**:
   - Chỉ review sau khi order delivered
   - 1 user chỉ review 1 lần/product
   - Phải có order chứa product đó

2. **Media Upload**:
   - Tối đa 10 files (ảnh + video)
   - Max file size: 50MB
   - Supported: jpg, png, mp4, webm

3. **Approval**:
   - Default: auto-approved (isApproved=true)
   - Admin có thể ẩn review vi phạm
   - Không xóa, chỉ ẩn

4. **Admin Reply**:
   - Admin/Collaborator có thể reply
   - 1 review chỉ 1 reply
   - Update được

### 📝 Sample Queries

```javascript
// Lấy reviews của product
Review.find({ 
  product: productId, 
  isApproved: true 
})
.populate('user', 'name avatar')
.sort({ createdAt: -1 });

// Tính rating trung bình
Review.aggregate([
  { $match: { product: productId, isApproved: true } },
  { $group: {
    _id: null,
    avgRating: { $avg: '$rating' },
    totalReviews: { $sum: 1 }
  }}
]);

// Check user đã review chưa
Review.findOne({
  user: userId,
  product: productId
});

// Admin reply
Review.findByIdAndUpdate(
  reviewId,
  {
    adminReply: {
      content: replyContent,
      repliedBy: adminId,
      repliedAt: new Date()
    }
  }
);
```

---

## 6. 💬 MESSAGES (Tin nhắn)

### 📌 Thông tin cơ bản
- **Collection Name**: `messages`
- **Mục đích**: Hệ thống tin nhắn hỗ trợ khách hàng
- **Model File**: `src/backend/models/Message.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef5"),
  user: ObjectId("67a1b2c3d4e5f6789abcdef0"),
  userName: "Nguyễn Văn A",
  userEmail: "user@example.com",
  
  content: "Cây tùng la hán có ship tỉnh không ạ?",
  isFromAdmin: false,
  
  status: "replied",
  
  adminReply: {
    content: "Shop có ship toàn quốc bạn nhé!",
    repliedBy: ObjectId("67a1b2c3d4e5f6789admin"),
    repliedAt: ISODate("2025-01-20T14:00:00Z")
  },
  
  createdAt: ISODate("2025-01-20T13:30:00Z"),
  updatedAt: ISODate("2025-01-20T14:00:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------|--------------|----------|-------|
| `_id` | ObjectId | ✅ | Primary Key |
| `user` | ObjectId | ✅ | FK → Users |
| `userName` | String | ✅ | Tên người gửi (snapshot) |
| `userEmail` | String | ✅ | Email người gửi (snapshot) |
| `content` | String | ✅ | Nội dung tin nhắn |
| `isFromAdmin` | Boolean | ✅ | Tin từ admin/system, default: false |
| `status` | String (Enum) | ✅ | Trạng thái tin nhắn |
| `adminReply` | Object | ❌ | Phản hồi từ admin |
| `createdAt` | Date | ✅ | Timestamp tạo |
| `updatedAt` | Date | ✅ | Timestamp cập nhật |

### 🔄 Status Flow

```
pending (Chờ phản hồi)
    ↓
replied (Đã trả lời)
    ↓
resolved (Đã giải quyết)
```

### 📝 AdminReply Schema

```javascript
{
  content: String,                    // Nội dung reply
  repliedBy: ObjectId,                // FK → Users (admin/ctv)
  repliedAt: Date                     // Timestamp reply
}
```

### 🔑 Indexes

```javascript
{ user: 1 }              // Query messages by user
{ status: 1 }            // Filter by status
{ createdAt: -1 }        // Sort by date
{ isFromAdmin: 1 }       // Separate system messages
```

### ⚙️ Business Rules

1. **Message Creation**:
   - User tự động (từ logged in user)
   - Snapshot userName và userEmail
   - Content không được rỗng

2. **Admin Reply**:
   - Chỉ admin/collaborator reply được
   - Auto-update status → `replied`
   - Gửi email notification (optional)

3. **System Messages**:
   - isFromAdmin = true
   - VD: Thông báo thanh toán, giao hàng
   - Không thể reply

4. **Deletion**:
   - Chỉ admin xóa
   - User không xóa được
   - Soft delete pattern

### 📝 Sample Queries

```javascript
// Lấy tin nhắn của user
Message.find({ user: userId })
  .sort({ createdAt: -1 });

// Tin nhắn pending
Message.find({ status: 'pending' })
  .populate('user', 'name email')
  .sort({ createdAt: 1 });

// Admin reply
Message.findByIdAndUpdate(
  messageId,
  {
    status: 'replied',
    adminReply: {
      content: replyContent,
      repliedBy: adminId,
      repliedAt: new Date()
    }
  }
);

// Đánh dấu resolved
Message.findByIdAndUpdate(messageId, { status: 'resolved' });
```

---

## 7. 🎟️ COUPONS (Mã giảm giá)

### 📌 Thông tin cơ bản
- **Collection Name**: `coupons`
- **Mục đích**: Quản lý mã giảm giá và khuyến mãi
- **Model File**: `src/backend/models/Coupon.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef6"),
  code: "SUMMER2025",
  type: "percentage",
  
  discountValue: 10,              // 10%
  minOrderValue: 200000,          // Đơn tối thiểu 200k
  maxDiscountValue: 100000,       // Giảm tối đa 100k
  
  expiresAt: ISODate("2025-12-31T23:59:59Z"),
  usageLimit: 100,                // Giới hạn 100 lượt
  usageCount: 25,                 // Đã dùng 25 lượt
  
  isActive: true,
  description: "Giảm 10% cho đơn hàng từ 200k",
  
  createdAt: ISODate("2025-01-01T00:00:00Z"),
  updatedAt: ISODate("2025-01-20T10:00:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Unique | Mô tả |
|------------|--------------|----------|--------|-------|
| `_id` | ObjectId | ✅ | ✅ | Primary Key |
| `code` | String | ✅ | ✅ | Mã code (uppercase, 6-20 ký tự) |
| `type` | String (Enum) | ✅ | ❌ | Loại giảm giá |
| `discountValue` | Number | ✅ | ❌ | Giá trị giảm (% hoặc VND) |
| `minOrderValue` | Number | ✅ | ❌ | Đơn tối thiểu, default: 0 |
| `maxDiscountValue` | Number | ❌ | ❌ | Giảm tối đa (cho %), default: null |
| `expiresAt` | Date | ✅ | ❌ | Ngày hết hạn |
| `usageLimit` | Number | ❌ | ❌ | Giới hạn số lượt, default: null (vô hạn) |
| `usageCount` | Number | ✅ | ❌ | Đã sử dụng, default: 0 |
| `isActive` | Boolean | ✅ | ❌ | Kích hoạt, default: true |
| `description` | String | ❌ | ❌ | Mô tả chi tiết |
| `createdAt` | Date | ✅ | ❌ | Timestamp tạo |
| `updatedAt` | Date | ✅ | ❌ | Timestamp cập nhật |

### 🎨 Coupon Types

| Type | Mô tả | discountValue | Ví dụ |
|------|-------|---------------|-------|
| `percentage` | Giảm theo % | 10, 20, 50 | Giảm 10% |
| `fixed` | Giảm cố định | 50000, 100000 | Giảm 50,000đ |
| `freeShip` | Miễn phí ship | 0 (ignored) | Free ship |

### 🔑 Indexes

```javascript
{ code: 1 }              // Unique, lookup by code
{ type: 1 }              // Filter by type
{ expiresAt: 1 }         // Check expiry
{ isActive: 1 }          // Filter active
{ usageLimit: 1 }        // Check availability
```

### ⚙️ Business Rules

1. **Code Generation**:
   - Tự động uppercase
   - 6-20 ký tự
   - Unique constraint
   - VD: SUMMER2025, WELCOME10

2. **Validation Logic**:
   ```javascript
   // Check valid
   - expiresAt > now
   - isActive === true
   - usageCount < usageLimit (nếu có limit)
   - orderTotal >= minOrderValue
   ```

3. **Discount Calculation**:
   ```javascript
   if (type === 'percentage') {
     discount = orderTotal * (discountValue / 100);
     if (maxDiscountValue) {
       discount = Math.min(discount, maxDiscountValue);
     }
   } else if (type === 'fixed') {
     discount = discountValue;
   } else if (type === 'freeShip') {
     discount = shippingFee;
   }
   ```

4. **Usage Tracking**:
   - Auto-increment usageCount khi apply
   - Transaction để tránh race condition
   - Snapshot trong order

### 📝 Sample Queries

```javascript
// Validate coupon
Coupon.findOne({
  code: 'SUMMER2025',
  isActive: true,
  expiresAt: { $gt: new Date() },
  $or: [
    { usageLimit: null },
    { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
  ]
});

// Apply coupon (transaction)
const session = await mongoose.startSession();
session.startTransaction();

await Coupon.findOneAndUpdate(
  { code: couponCode },
  { $inc: { usageCount: 1 } },
  { session }
);

// ... create order với session

await session.commitTransaction();

// Danh sách active coupons
Coupon.find({
  isActive: true,
  expiresAt: { $gt: new Date() }
}).select('code description type discountValue');
```

---

## 8. 🔖 USER_COUPONS (Mã đã lưu)

### 📌 Thông tin cơ bản
- **Collection Name**: `usercoupons`
- **Mục đích**: Bảng trung gian Many-to-Many (Users ↔ Coupons)
- **Model File**: `src/backend/models/UserCoupon.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef7"),
  user: ObjectId("67a1b2c3d4e5f6789abcdef0"),
  coupon: ObjectId("67a1b2c3d4e5f6789abcdef6"),
  
  savedAt: ISODate("2025-01-20T10:00:00Z"),
  usedAt: ISODate("2025-01-21T15:30:00Z"),
  isUsed: true
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|------------|--------------|----------|-------|
| `_id` | ObjectId | ✅ | Primary Key |
| `user` | ObjectId | ✅ | FK → Users |
| `coupon` | ObjectId | ✅ | FK → Coupons |
| `savedAt` | Date | ✅ | Ngày lưu mã, default: now |
| `usedAt` | Date | ❌ | Ngày sử dụng (null nếu chưa dùng) |
| `isUsed` | Boolean | ✅ | Đã sử dụng, default: false |

### 🔑 Indexes

```javascript
{ user: 1 }                       // Query by user
{ coupon: 1 }                     // Query by coupon
{ isUsed: 1 }                     // Filter unused
{ user: 1, coupon: 1 }            // Unique compound
```

### ⚙️ Business Rules

1. **Save Coupon**:
   - User phải đăng nhập
   - 1 user chỉ lưu 1 lần/coupon
   - Unique constraint: (user, coupon)

2. **Use Coupon**:
   - Đánh dấu isUsed = true
   - Ghi timestamp usedAt
   - Link với order (trong order.coupon)

3. **Deletion**:
   - User có thể bỏ lưu (delete record)
   - Cascade delete khi xóa user/coupon

### 📝 Sample Queries

```javascript
// Lấy mã đã lưu của user
UserCoupon.find({ user: userId, isUsed: false })
  .populate('coupon')
  .sort({ savedAt: -1 });

// Kiểm tra đã lưu chưa
UserCoupon.findOne({ user: userId, coupon: couponId });

// Lưu mã mới
UserCoupon.create({
  user: userId,
  coupon: couponId,
  savedAt: new Date()
});

// Đánh dấu đã dùng
UserCoupon.findOneAndUpdate(
  { user: userId, coupon: couponId },
  { isUsed: true, usedAt: new Date() }
);

// Thống kê mã phổ biến
UserCoupon.aggregate([
  { $group: { _id: '$coupon', savedCount: { $sum: 1 } } },
  { $sort: { savedCount: -1 } },
  { $limit: 10 }
]);
```

---

## 9. 📝 ARTICLES (Bài viết)

### 📌 Thông tin cơ bản
- **Collection Name**: `articles`
- **Mục đích**: Quản lý blog bài viết về cây cảnh
- **Model File**: `src/backend/models/Article.js`

### 📊 Cấu trúc dữ liệu

```javascript
{
  _id: ObjectId("67a1b2c3d4e5f6789abcdef8"),
  title: "Cách Chăm Sóc Cây Tùng La Hán",
  slug: "cach-cham-soc-cay-tung-la-han",
  
  content: "<p>Cây tùng la hán là loại cây...</p>",
  summary: "Hướng dẫn chi tiết cách chăm sóc cây tùng la hán...",
  image: "/uploads/articles/tung-la-han-guide.jpg",
  
  category: ObjectId("67a1b2c3d4e5f6789abcdef2"),
  author: ObjectId("67a1b2c3d4e5f6789admin"),
  
  views: 1523,
  isPublished: true,
  publishedAt: ISODate("2025-01-15T08:00:00Z"),
  
  createdAt: ISODate("2025-01-14T10:00:00Z"),
  updatedAt: ISODate("2025-01-20T14:00:00Z")
}
```

### 📋 Danh sách trường

| Tên trường | Kiểu dữ liệu | Bắt buộc | Unique | Mô tả |
|------------|--------------|----------|--------|-------|
| `_id` | ObjectId | ✅ | ✅ | Primary Key |
| `title` | String | ✅ | ❌ | Tiêu đề bài viết |
| `slug` | String | ✅ | ✅ | URL-friendly (auto-gen) |
| `content` | String | ✅ | ❌ | Nội dung HTML (rich text) |
| `summary` | String | ❌ | ❌ | Tóm tắt ngắn gọn |
| `image` | String | ❌ | ❌ | Ảnh bìa |
| `category` | ObjectId | ✅ | ❌ | FK → Categories |
| `author` | ObjectId | ✅ | ❌ | FK → Users (admin) |
| `views` | Number | ✅ | ❌ | Lượt xem, default: 0 |
| `isPublished` | Boolean | ✅ | ❌ | Đã xuất bản, default: false |
| `publishedAt` | Date | ❌ | ❌ | Ngày xuất bản |
| `createdAt` | Date | ✅ | ❌ | Timestamp tạo |
| `updatedAt` | Date | ✅ | ❌ | Timestamp cập nhật |

### 🔑 Indexes

```javascript
{ slug: 1 }                       // Unique, URL lookup
{ category: 1 }                   // Filter by category
{ author: 1 }                     // Filter by author
{ isPublished: 1 }                // Show published only
{ publishedAt: -1 }               // Sort by date
{ views: -1 }                     // Popular articles
{ title: 'text', content: 'text' }  // Full-text search
```

### ⚙️ Business Rules

1. **Slug Generation**:
   - Tự động từ title
   - Unique constraint
   - Lowercase, no special chars

2. **Publishing**:
   - Draft: isPublished = false
   - Published: isPublished = true, set publishedAt
   - Chỉ published mới hiện public

3. **Author**:
   - Chỉ admin tạo/sửa/xóa
   - Ghi nhận author (admin ID)
   - Không thể null

4. **Views Tracking**:
   - Tự động tăng khi view
   - Không đếm admin views
   - Use atomic $inc

### 📝 Sample Queries

```javascript
// Lấy bài viết published
Article.find({ isPublished: true })
  .populate('category', 'name slug')
  .populate('author', 'name')
  .sort({ publishedAt: -1 })
  .limit(10);

// Tìm theo slug
Article.findOne({ slug: 'cach-cham-soc-cay-tung-la-han' });

// Bài viết hot (nhiều views)
Article.find({ isPublished: true })
  .sort({ views: -1 })
  .limit(5);

// Tăng views
Article.findByIdAndUpdate(
  articleId,
  { $inc: { views: 1 } }
);

// Full-text search
Article.find({ 
  $text: { $search: 'chăm sóc cây' },
  isPublished: true
});

// Publish article
Article.findByIdAndUpdate(
  articleId,
  {
    isPublished: true,
    publishedAt: new Date()
  }
);
```

---

## 🔗 MỐI QUAN HỆ GIỮA CÁC THỰC THỂ

### Sơ đồ quan hệ tổng quan

```
               ┌─────────────┐
               │    USERS    │
               └──────┬──────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
   ┌────────┐   ┌─────────┐   ┌──────────┐   ┌──────────┐
   │ ORDERS │   │ REVIEWS │   │ MESSAGES │   │ ARTICLES │
   └────┬───┘   └────┬────┘   └──────────┘   └────┬─────┘
        │            │                              │
        │            ▼                              │
        │       ┌──────────┐                        │
        │       │ PRODUCTS │◄───────────────────────┘
        │       └────┬─────┘
        │            │
        │            ▼
        │       ┌────────────┐
        └──────►│ CATEGORIES │
                └────────────┘

   ┌───────────┐
   │  COUPONS  │◄──┐
   └─────┬─────┘   │
         │         │
         ▼         │
   ┌──────────────┐│
   │ USER_COUPONS ││
   └──────────────┘│
         │         │
         └─────────┘
```

### Chi tiết relationships

#### 1. Users → Orders (1:N)
```javascript
// 1 User có nhiều Orders
User: { _id: "user123" }
Orders: [
  { _id: "order1", user: "user123" },
  { _id: "order2", user: "user123" }
]

// Query
Order.find({ user: userId }).populate('user');
```

#### 2. Users → Reviews (1:N)
```javascript
// 1 User có nhiều Reviews
Review.find({ user: userId }).populate('product');
```

#### 3. Users → Messages (1:N)
```javascript
// 1 User có nhiều Messages
Message.find({ user: userId });
```

#### 4. Users → Articles (1:N as author)
```javascript
// 1 Admin tạo nhiều Articles
Article.find({ author: adminId });
```

#### 5. Users ↔ Coupons (M:N via UserCoupons)
```javascript
// Many-to-Many relationship
UserCoupon.find({ user: userId }).populate('coupon');
UserCoupon.find({ coupon: couponId }).populate('user');
```

#### 6. Products → Categories (N:1)
```javascript
// Nhiều Products thuộc 1 Category
Product.find({ category: 'cay-canh-noi-that' });
```

#### 7. Products → Reviews (1:N)
```javascript
// 1 Product có nhiều Reviews
Review.find({ product: productId }).populate('user');
```

#### 8. Orders → OrderItems (1:N Embedded)
```javascript
// OrderItems embedded trong Orders
Order.findById(orderId);
// { items: [{ product, name, price, quantity }, ...] }
```

#### 9. Orders → Coupons (N:1 Optional)
```javascript
// Orders có thể dùng 1 Coupon
Order.find({ 'coupon.code': 'SUMMER2025' });
```

#### 10. Reviews → Orders (N:1)
```javascript
// Review phải từ 1 Order delivered
Review.find({ order: orderId });
```

#### 11. Articles → Categories (N:1)
```javascript
// Nhiều Articles thuộc 1 Category
Article.find({ category: categoryId });
```

---

## 📊 BẢNG TỔNG HỢP

### Thống kê theo loại quan hệ

| Loại Relationship | Số lượng | Ví dụ |
|-------------------|----------|-------|
| **1:N** | 8 | Users → Orders, Products → Reviews |
| **N:1** | 6 | Orders → Users, Products → Categories |
| **M:N** | 1 | Users ↔ Coupons (via UserCoupons) |
| **1:N Embedded** | 1 | Orders → OrderItems |

### Thống kê indexes

| Collection | Số Indexes | Loại |
|------------|------------|------|
| Users | 4 | Unique (2), Regular (2) |
| Products | 7 | Text (1), Regular (6) |
| Categories | 4 | Unique (2), Regular (2) |
| Orders | 4 | Compound (1), Regular (3) |
| Reviews | 6 | Unique Compound (1), Regular (5) |
| Messages | 4 | Regular (4) |
| Coupons | 5 | Unique (1), Regular (4) |
| UserCoupons | 3 | Unique Compound (1), Regular (2) |
| Articles | 6 | Unique (1), Text (1), Regular (4) |

### Thống kê trường theo collection

| Collection | Required Fields | Optional Fields | Total |
|------------|----------------|-----------------|-------|
| Users | 7 | 6 | 13 |
| Products | 7 | 5 | 12 |
| Categories | 5 | 3 | 8 |
| Orders | 13 | 4 | 17 |
| Reviews | 6 | 4 | 10 |
| Messages | 7 | 2 | 9 |
| Coupons | 8 | 3 | 11 |
| UserCoupons | 4 | 1 | 5 |
| Articles | 8 | 3 | 11 |

---

## 📈 KẾT LUẬN

### Tổng quan hệ thống

```
╔════════════════════════════════════════════════╗
║          DATABASE OVERVIEW                     ║
╠════════════════════════════════════════════════╣
║ Total Collections:           9                 ║
║ Total Fields:                96                ║
║ Total Indexes:               43                ║
║ Total Relationships:         12                ║
║                                                ║
║ Core Entities:               4                 ║
║ Support Entities:            3                 ║
║ Business Entities:           2                 ║
║                                                ║
║ Embedded Documents:          2                 ║
║ Many-to-Many Relations:      1                 ║
╚════════════════════════════════════════════════╝
```

### Đặc điểm thiết kế

✅ **Ưu điểm**:
- Cấu trúc rõ ràng, dễ maintain
- Sử dụng embedded documents hợp lý (OrderItems)
- Indexes được tối ưu cho queries phổ biến
- Hỗ trợ full-text search
- Snapshot data để tránh inconsistency

✅ **Best Practices**:
- Timestamps tự động (createdAt, updatedAt)
- Soft delete pattern (isActive, isHidden)
- Validation ở tầng schema
- Transaction support cho critical operations
- Denormalization có chọn lọc

---

**Phiên bản**: 1.0.0  
**Ngày tạo**: 26/12/2025  
**Database**: MongoDB 6.0+  
**ORM**: Mongoose 7.0+  
**Tác giả**: The Sun Garden Development Team
