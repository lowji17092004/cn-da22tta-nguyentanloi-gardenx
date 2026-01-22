# Cấu trúc Backend MVC

## Tổng quan

Backend được tổ chức theo mô hình MVC (Model-View-Controller) chuẩn để dễ bảo trì và mở rộng.

## Cấu trúc thư mục

```
backend/
├── controllers/          # Controllers - Xử lý logic nghiệp vụ
│   ├── productController.js
│   ├── orderController.js
│   ├── userController.js
│   ├── categoryController.js
│   └── articleController.js
│
├── models/               # Models - Định nghĩa schema MongoDB
│   ├── Product.js
│   ├── Order.js
│   ├── User.js
│   ├── Category.js
│   ├── Article.js
│   ├── Review.js
│   ├── Message.js
│   ├── Coupon.js
│   └── UserCoupon.js
│
├── routes/               # Routes - Định nghĩa API endpoints
│   ├── products.js
│   ├── orders.js
│   ├── users.js
│   ├── categories.js
│   ├── articles.js
│   ├── auth.js
│   ├── reviews.js
│   ├── messages.js
│   ├── coupons.js
│   ├── payments.js
│   ├── profile.js
│   └── upload.js
│
├── services/             # Services - Logic nghiệp vụ phức tạp
│   ├── emailService.js   # Gửi email, OTP
│   ├── paymentService.js # Xử lý thanh toán
│   └── fileService.js    # Quản lý files
│
├── middleware/           # Middleware - Xác thực, phân quyền
│   └── auth.js
│
├── uploads/              # Uploaded files
│   ├── avatars/
│   └── reviews/
│
├── scripts/              # Utility scripts
│
└── server.js             # Entry point
```

## Quy tắc đặt tên

### Controllers
- Tên file: `[tên]Controller.js` (camelCase)
- Export các functions xử lý request
- Mỗi function tương ứng với một action

### Models
- Tên file: `[TênModel].js` (PascalCase)
- Định nghĩa schema và methods cho MongoDB

### Routes
- Tên file: `[tên].js` (lowercase)
- Chỉ định nghĩa routes, không chứa logic
- Import controller tương ứng

### Services
- Tên file: `[tên]Service.js` (camelCase)
- Chứa business logic có thể tái sử dụng
- Không phụ thuộc vào request/response

## Ví dụ sử dụng

### Route
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

module.exports = router;
```

### Controller
```javascript
const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts };
```

### Service
```javascript
const sendEmail = async (to, subject, body) => {
  // Logic gửi email
};

module.exports = { sendEmail };
```

## Lợi ích của cấu trúc MVC

1. **Tách biệt concerns**: Mỗi layer có trách nhiệm riêng
2. **Dễ test**: Controller và Service có thể test độc lập
3. **Tái sử dụng code**: Services có thể dùng ở nhiều controllers
4. **Dễ bảo trì**: Dễ tìm và sửa lỗi
5. **Scalable**: Dễ mở rộng khi project lớn dần
