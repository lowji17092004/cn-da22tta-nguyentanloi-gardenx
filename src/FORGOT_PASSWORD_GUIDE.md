# 🔐 Hướng dẫn Quên Mật khẩu với OTP

## Tính năng

Hệ thống quên mật khẩu với xác thực OTP qua **Email** hoặc **SMS**:

### ✨ Các tính năng chính:
- ✅ Chọn phương thức nhận OTP (Email/SMS)
- ✅ Mã OTP 6 số ngẫu nhiên
- ✅ Thời gian hiệu lực 10 phút với countdown timer
- ✅ Gửi lại mã OTP khi hết hạn
- ✅ Xác thực mật khẩu mạnh với progress bar
- ✅ Email template đẹp mắt với HTML
- ✅ UI/UX hiện đại với animations

---

## 📋 Cấu hình Email (Gmail)

### Bước 1: Bật xác thực 2 bước
1. Truy cập https://myaccount.google.com/security
2. Tìm mục "Signing in to Google"
3. Bật "2-Step Verification"

### Bước 2: Tạo App Password
1. Truy cập https://myaccount.google.com/apppasswords
2. Chọn "Select app" → "Mail"
3. Chọn "Select device" → "Other"
4. Nhập tên: "Flower Shop OTP"
5. Click "Generate"
6. **Copy mã 16 ký tự** (dạng: abcd efgh ijkl mnop)

### Bước 3: Cấu hình Backend
Mở file `backend/.env` và thêm:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Lưu ý:** Không có khoảng trắng trong EMAIL_PASSWORD!

---

## 🚀 Quy trình sử dụng

### 1️⃣ Trang Quên mật khẩu (`/forgot-password`)
- Chọn phương thức: Email hoặc SMS
- Nhập email/số điện thoại đã đăng ký
- Click "Gửi mã OTP"

### 2️⃣ Trang Xác thực OTP (`/verify-otp`)
- Nhập 6 số OTP nhận được
- Auto-focus ô tiếp theo khi nhập
- Paste toàn bộ OTP được hỗ trợ
- Timer đếm ngược 10 phút
- Gửi lại mã khi hết hạn

### 3️⃣ Trang Đặt lại mật khẩu (`/reset-password`)
- Nhập mật khẩu mới (tối thiểu 8 ký tự)
- Progress bar hiển thị độ mạnh mật khẩu
- Xác nhận mật khẩu phải khớp
- Click "Đặt lại mật khẩu"
- Chuyển về trang đăng nhập

---

## 🔧 API Endpoints

### POST `/api/auth/forgot-password`
Gửi mã OTP

**Request Body:**
```json
{
  "identifier": "user@email.com",
  "method": "email"
}
```

**Response:**
```json
{
  "message": "Mã OTP đã được gửi đến email của bạn",
  "method": "email"
}
```

### POST `/api/auth/verify-otp`
Xác thực mã OTP

**Request Body:**
```json
{
  "identifier": "user@email.com",
  "otp": "123456",
  "method": "email"
}
```

**Response:**
```json
{
  "message": "Xác thực OTP thành công",
  "userId": "64abc123..."
}
```

### POST `/api/auth/reset-password`
Đặt lại mật khẩu

**Request Body:**
```json
{
  "identifier": "user@email.com",
  "otp": "123456",
  "newPassword": "NewPass@123",
  "method": "email"
}
```

**Response:**
```json
{
  "message": "Đặt lại mật khẩu thành công"
}
```

---

## 📱 Tích hợp SMS (Tuỳ chọn)

Hiện tại SMS đang ở chế độ **simulation**. Để kích hoạt SMS thật:

### Sử dụng Twilio:

1. Đăng ký tài khoản tại https://www.twilio.com
2. Lấy **Account SID** và **Auth Token**
3. Cài đặt Twilio SDK:

```bash
cd backend
npm install twilio
```

4. Cập nhật `.env`:

```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

5. Sửa hàm `sendOTPSMS` trong `backend/routes/auth.js`:

```javascript
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendOTPSMS = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Mã OTP của bạn: ${otp}. Có hiệu lực trong 10 phút.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return { success: true };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};
```

---

## 🔒 Bảo mật

### Các biện pháp đã áp dụng:
- ✅ OTP hết hạn sau 10 phút
- ✅ OTP chỉ sử dụng 1 lần (xoá sau khi đặt lại mật khẩu)
- ✅ Mật khẩu được hash bằng bcrypt
- ✅ Validate mật khẩu mạnh (8+ ký tự)
- ✅ Không lưu OTP dưới dạng plain text

### Khuyến nghị thêm:
- Rate limiting: Giới hạn số lần gửi OTP
- CAPTCHA: Chống bot spam OTP
- IP tracking: Ghi log các lần reset mật khẩu
- Email thông báo khi mật khẩu được đổi

---

## 🎨 UI Components

### Styles CSS đã thêm:
- `.method-selector` - Chọn Email/SMS
- `.otp-input-group` - 6 ô nhập OTP
- `.timer-section` - Đếm ngược thời gian
- `.password-strength` - Progress bar độ mạnh mật khẩu
- `.success-animation` - Animation thành công

### Pages đã tạo:
- `ForgotPassword.jsx` - Yêu cầu OTP
- `VerifyOtp.jsx` - Nhập OTP
- `ResetPassword.jsx` - Đặt lại mật khẩu

---

## 🧪 Testing

### Test Email OTP:
1. Đăng nhập với tài khoản có email thật
2. Vào `/forgot-password`
3. Chọn "Email"
4. Nhập email
5. Kiểm tra hộp thư đến/spam
6. Nhập OTP nhận được

### Test SMS OTP (Simulated):
1. Vào `/forgot-password`
2. Chọn "SMS"
3. Nhập số điện thoại
4. Check console backend để xem OTP
5. Nhập OTP hiển thị trong log

---

## 🐛 Troubleshooting

### Email không nhận được:
- ✓ Kiểm tra App Password đúng chưa
- ✓ Xem folder Spam/Junk
- ✓ Verify EMAIL_USER và EMAIL_PASSWORD trong .env
- ✓ Check logs backend có lỗi không

### OTP không hợp lệ:
- ✓ Kiểm tra OTP chưa hết hạn (10 phút)
- ✓ Đảm bảo nhập đúng 6 số
- ✓ Không có khoảng trắng

### Cannot send email:
- ✓ Gmail: Bật "Less secure app access" hoặc dùng App Password
- ✓ Firewall: Cho phép port 587/465
- ✓ Check network connection

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Backend logs: `npm run dev` trong terminal backend
2. Frontend console: F12 → Console tab
3. Network tab: Xem API responses

---

## ✅ Checklist hoàn thành

- [x] User model có resetPasswordOtp và resetPasswordExpires
- [x] Backend endpoints: forgot-password, verify-otp, reset-password
- [x] Nodemailer setup với HTML template
- [x] ForgotPassword page với Email/SMS selector
- [x] VerifyOtp page với OTP input và timer
- [x] ResetPassword page với password strength
- [x] Login page có link "Quên mật khẩu?"
- [x] Routes trong App.jsx
- [x] CSS styles cho tất cả components
- [x] Documentation đầy đủ

🎉 **Tính năng quên mật khẩu đã hoàn thành!**
