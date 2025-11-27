import React, { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Checkout(){
  const { items, total, clear, selectedItems, selectedTotal } = useCart()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod') // 'cod' or 'qr'
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const selectedCartItems = items.filter(item => selectedItems.includes(item.product))
  const shippingFee = selectedTotal >= 500000 ? 0 : 30000
  const finalTotal = selectedTotal + shippingFee

  const submit = async e => {
    e.preventDefault()
    if (selectedCartItems.length === 0) return alert('Vui lòng chọn sản phẩm để thanh toán')
    
    // Nếu chọn QR code, hiển thị QR trước
    if (paymentMethod === 'qr') {
      setShowQR(true)
      return
    }
    
    // Xử lý đặt hàng COD
    await processOrder()
  }

  const processOrder = async () => {
    setLoading(true)
    try{
      const res = await api.post('/orders', { 
        customerName: name, 
        customerEmail: email, 
        phone: phone,
        address: address,
        items: selectedCartItems, 
        total: finalTotal, 
        notes: note,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
      })
      // Xóa các items đã checkout khỏi giỏ hàng
      selectedItems.forEach(id => {
        const itemToRemove = items.find(i => i.product === id)
        if (itemToRemove) clear() // Simplified, ideally remove only selected items
      })
      navigate('/orders')
      alert('Đặt hàng thành công! Mã đơn hàng: #' + res.data._id.slice(-8))
    }catch(e){ 
      alert('Đặt hàng thất bại: ' + (e.response?.data?.message || e.message)) 
    }
    setLoading(false)
  }

  return (
    <div className="container checkout-container">
      <div className="page-header">
        <h1>💳 Thanh toán đơn hàng</h1>
        <p>Hoàn tất thông tin để đặt hàng</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form">
          <h2>Thông tin người nhận</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <label>Họ và tên *</label>
              <input 
                type="text"
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Nguyễn Văn A"
                required 
              />
            </div>
            <div className="form-row">
              <label>Email *</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="email@example.com"
                required 
              />
            </div>
            <div className="form-row">
              <label>Số điện thoại *</label>
              <input 
                type="tel"
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                placeholder="0912345678"
                required 
              />
            </div>
            <div className="form-row">
              <label>Địa chỉ giao hàng *</label>
              <textarea 
                value={address} 
                onChange={e=>setAddress(e.target.value)} 
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                rows="3"
                required 
              />
            </div>
            <div className="form-row">
              <label>Ghi chú đơn hàng</label>
              <textarea 
                value={note} 
                onChange={e=>setNote(e.target.value)} 
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                rows="3"
              />
            </div>

            <div className="form-row payment-method-section">
              <label>Phương thức thanh toán *</label>
              <div className="payment-methods">
                <div 
                  className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-radio">
                    {paymentMethod === 'cod' && <div className="radio-dot"></div>}
                  </div>
                  <div className="payment-info">
                    <div className="payment-icon">💵</div>
                    <div className="payment-details">
                      <h4>Tiền mặt khi nhận hàng (COD)</h4>
                      <p>Thanh toán khi nhận được hàng</p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('qr')}
                >
                  <div className="payment-radio">
                    {paymentMethod === 'qr' && <div className="radio-dot"></div>}
                  </div>
                  <div className="payment-info">
                    <div className="payment-icon">📱</div>
                    <div className="payment-details">
                      <h4>Chuyển khoản QR Code</h4>
                      <p>Quét mã QR để thanh toán</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-lg btn-block"
              disabled={loading || selectedCartItems.length === 0}
            >
              {loading ? '⏳ Đang xử lý...' : 
               paymentMethod === 'qr' ? `📱 Xem QR thanh toán` : 
               `🛒 Đặt hàng (${selectedCartItems.length} sản phẩm)`}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Đơn hàng của bạn</h2>
          
          <div className="checkout-items">
            {selectedCartItems.map(item => (
              <div key={item.product} className="checkout-item">
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">x{item.quantity}</span>
                </div>
                <div className="checkout-item-price">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{selectedTotal?.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className={shippingFee === 0 ? 'free-shipping' : ''}>
                {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + ' ₫'}
              </span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Tổng cộng:</span>
              <span className="total-amount">{finalTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <div className="checkout-notes">
            <p>🚚 Giao hàng trong 2-3 ngày</p>
            <p>✅ Miễn phí ship cho đơn từ 500,000₫</p>
            <p>🔒 Thông tin được bảo mật</p>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal" onClick={e => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)}>×</button>
            <h2>Quét mã QR để thanh toán</h2>
            <p className="qr-amount">Số tiền: <strong>{finalTotal.toLocaleString('vi-VN')} ₫</strong></p>
            
            <div className="qr-code-container">
              <img 
                src={`https://img.vietqr.io/image/MB-0372782368-compact2.png?amount=${finalTotal}&addInfo=DH${Date.now().toString().slice(-6)}&accountName=NGUYEN%20TAN%20LOI`}
                alt="QR Code thanh toán"
                className="qr-code-image"
              />
            </div>

            <div className="qr-instructions">
              <h3>Hướng dẫn thanh toán:</h3>
              <ol>
                <li>Mở app Ngân hàng hoặc ví điện tử</li>
                <li>Quét mã QR phía trên</li>
                <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                <li>Nhấn "Đã thanh toán" bên dưới</li>
              </ol>
            </div>

            <div className="qr-bank-info">
              <p><strong>Ngân hàng:</strong> MB Bank</p>
              <p><strong>Số tài khoản:</strong> 0372782368</p>
              <p><strong>Chủ tài khoản:</strong> NGUYEN TAN LOI</p>
              <p><strong>Nội dung:</strong> DH{Date.now().toString().slice(-6)}</p>
            </div>

            <div className="qr-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowQR(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                onClick={processOrder}
                disabled={loading}
              >
                {loading ? '⏳ Đang xử lý...' : '✅ Đã thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
