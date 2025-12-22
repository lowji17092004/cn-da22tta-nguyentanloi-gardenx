# Hướng dẫn sử dụng Payment QR Code

## Tổng quan
Hệ thống thanh toán QR Code hỗ trợ 2 phương thức:
1. **VietQR** - Chuyển khoản ngân hàng (hỗ trợ 9 ngân hàng phổ biến)
2. **ZaloPay** - Thanh toán qua ví điện tử ZaloPay

## Cấu hình Backend

### 1. Environment Variables (.env)
Thêm các biến sau vào file `.env` trong thư mục `backend/`:

```env
# ==================== ZaloPay ENV ====================
ZALO_APP_ID=2554
ZALO_KEY1=sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn
ZALO_KEY2=trMrHtvjo6myautxDUiAcYsVtaeQ8nhf
ZALO_API_ENDPOINT=https://sb-openapi.zalopay.vn/v2/create
ZALO_CALLBACK_URL=http://localhost:5000/api/payments/zalopay/callback

# ==================== Bank Account (VietQR) ====================
BANK_ACCOUNT_NO=1234567890
BANK_ACCOUNT_NAME=FLORANA SHOP
BANK_CODE=VCB
```

### 2. Danh sách ngân hàng hỗ trợ
- **VCB** - Vietcombank (BIN: 970436)
- **TCB** - Techcombank (BIN: 970407)
- **MB** - MB Bank (BIN: 970422)
- **VTB** - Vietinbank (BIN: 970415)
- **ACB** - ACB (BIN: 970416)
- **BIDV** - BIDV (BIN: 970418)
- **AGR** - Agribank (BIN: 970405)
- **SCB** - Sacombank (BIN: 970403)
- **VPB** - VPBank (BIN: 970432)

## API Endpoints

### 1. Tạo QR ZaloPay
```
POST /api/payments/zalopay/create
Authorization: Bearer <token>

Request Body:
{
  "amount": 100000,
  "orderId": "60f3a1b2c3d4e5f6g7h8i9j0",
  "items": [
    {
      "itemid": "product_id",
      "itemname": "Hoa hồng đỏ",
      "itemprice": 100000,
      "itemquantity": 1
    }
  ]
}

Response:
{
  "success": true,
  "return_code": 1,
  "order_url": "https://sbgateway.zalopay.vn/...",
  "zp_trans_token": "...",
  "app_trans_id": "231222_123456789",
  "qr_code": null
}
```

### 2. ZaloPay Callback (Webhook)
```
POST /api/payments/zalopay/callback

Request Body (từ ZaloPay):
{
  "data": "...",
  "mac": "..."
}

Response:
{
  "return_code": 1,
  "return_message": "Thanh toán thành công"
}
```

### 3. Tạo VietQR
```
POST /api/payments/vietqr/create
Authorization: Bearer <token>

Request Body:
{
  "amount": 100000,
  "orderId": "60f3a1b2c3d4e5f6g7h8i9j0",
  "orderCode": "ABC12345"
}

Response:
{
  "success": true,
  "qr_url": "https://img.vietqr.io/image/...",
  "bank_info": {
    "bank_name": "Vietcombank",
    "bank_code": "VCB",
    "account_no": "1234567890",
    "account_name": "FLORANA SHOP"
  },
  "amount": 100000,
  "description": "FLORANA ABC12345",
  "note": "Vui lòng chuyển khoản đúng nội dung..."
}
```

### 4. Lấy danh sách ngân hàng
```
GET /api/payments/banks

Response:
{
  "success": true,
  "banks": [
    {
      "code": "VCB",
      "name": "Vietcombank",
      "bin": "970436"
    },
    ...
  ],
  "current_bank": {
    "code": "VCB",
    "name": "Vietcombank",
    "account_no": "1234567890",
    "account_name": "FLORANA SHOP"
  }
}
```

## Frontend Component Usage

### PaymentQR Component
```jsx
import PaymentQR from '../components/PaymentQR';

<PaymentQR
  amount={250000}
  orderId="60f3a1b2c3d4e5f6g7h8i9j0"
  orderCode="ABC12345"
  onPaymentComplete={() => {
    console.log('Payment completed');
    navigate('/order-success');
  }}
/>
```

### Props
- **amount** (number, required): Số tiền thanh toán
- **orderId** (string, required): ID đơn hàng từ database
- **orderCode** (string, required): Mã đơn hàng hiển thị cho user
- **onPaymentComplete** (function, optional): Callback khi user xác nhận đã thanh toán

## User Flow

### VietQR Flow
1. User chọn phương thức "Chuyển khoản ngân hàng"
2. Đặt hàng thành công → Hiển thị modal QR
3. Component tự động gọi API `/payments/vietqr/create`
4. Hiển thị:
   - QR Code (auto-generated với amount + nội dung)
   - Thông tin ngân hàng (tên, STK, chủ TK)
   - Số tiền cần chuyển
   - Nội dung chuyển khoản (FLORANA + mã đơn)
5. User quét QR hoặc nhập thông tin thủ công
6. User chuyển khoản → Nhấn "Tôi đã thanh toán"
7. Admin xác nhận trong panel

### ZaloPay Flow
1. User chọn phương thức "ZaloPay"
2. Đặt hàng thành công → Hiển thị modal QR
3. Component tự động gọi API `/payments/zalopay/create`
4. Hiển thị:
   - Logo ZaloPay
   - Số tiền
   - Button "Mở ZaloPay để thanh toán"
   - Mã giao dịch
5. User nhấn button → Mở app ZaloPay
6. User xác nhận thanh toán trong app
7. ZaloPay gọi callback → Backend cập nhật status
8. User quay lại web → Nhấn "Tôi đã thanh toán"

## Tính năng

### PaymentQR Component
✅ **Responsive Design** - Tự động adapt mobile/desktop
✅ **Method Switcher** - Chuyển đổi giữa VietQR và ZaloPay
✅ **Auto QR Generation** - Tự động tạo QR khi component mount
✅ **Copy to Clipboard** - Copy thông tin bank (STK, số tiền, nội dung)
✅ **Error Handling** - Hiển thị lỗi + nút retry
✅ **Loading States** - Spinner khi đang generate QR
✅ **Instructions** - Hướng dẫn step-by-step cho user

### VietQR Features
- QR Code tự động embed amount + nội dung
- Hỗ trợ 9 ngân hàng phổ biến
- Copy thông tin nhanh
- Hiển thị đầy đủ bank info

### ZaloPay Features
- Deep link mở trực tiếp app ZaloPay
- Tracking transaction ID
- Webhook callback tự động
- MAC signature verification

## Security

### ZaloPay MAC Verification
```javascript
// Tạo MAC cho request
const data = `${app_id}|${app_trans_id}|${app_user}|${amount}|${app_time}|${embed_data}|${item}`;
const mac = crypto.createHmac('sha256', key1).update(data).digest('hex');

// Verify MAC từ callback
const mac = crypto.createHmac('sha256', key2).update(dataStr).digest('hex');
if (reqMac !== mac) {
  return { return_code: -1, return_message: 'MAC không hợp lệ' };
}
```

## Testing

### Test VietQR
1. Chọn sản phẩm → Checkout
2. Chọn "Chuyển khoản ngân hàng"
3. Đặt hàng
4. Kiểm tra QR code hiển thị
5. Scan QR bằng app ngân hàng
6. Verify thông tin (amount, nội dung)

### Test ZaloPay
1. Chọn sản phẩm → Checkout
2. Chọn "ZaloPay"
3. Đặt hàng
4. Nhấn "Mở ZaloPay"
5. Xác nhận trong app (sandbox mode)
6. Verify callback được gọi

## Troubleshooting

### QR không hiển thị
- Kiểm tra API endpoint có hoạt động
- Check console log errors
- Verify environment variables

### ZaloPay callback không hoạt động
- Kiểm tra ZALO_CALLBACK_URL đúng
- Verify ngrok/public URL nếu dev local
- Check MAC signature keys

### VietQR amount không đúng
- Verify amount được pass đúng format (integer)
- Check encoding của description
- Verify bank BIN code đúng

## Production Deployment

### ZaloPay Production
1. Đổi endpoint sang production:
   ```env
   ZALO_API_ENDPOINT=https://openapi.zalopay.vn/v2/create
   ```
2. Update app_id, key1, key2 từ ZaloPay production credentials
3. Config callback URL với domain thật
4. Enable HTTPS cho callback endpoint

### VietQR Production
1. Update bank account info thật:
   ```env
   BANK_ACCOUNT_NO=<số_tài_khoản_thật>
   BANK_ACCOUNT_NAME=<tên_chủ_tài_khoản>
   BANK_CODE=<mã_ngân_hàng>
   ```
2. Test với số tiền nhỏ trước
3. Verify QR scan được bằng app banking

## Support
- ZaloPay Docs: https://docs.zalopay.vn
- VietQR Docs: https://www.vietqr.io
