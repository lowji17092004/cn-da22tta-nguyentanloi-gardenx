import React, { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import { useNavigate, Link } from 'react-router-dom'
import './Checkout.css'

// Success Modal Component
function SuccessModal({ isOpen, orderCode, onClose }) {
  if (!isOpen) return null
  
  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal" onClick={e => e.stopPropagation()}>
        <div className="success-modal-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" stroke="#10b981" strokeWidth="2"/>
            <path d="M7 12.5l3 3 7-7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>Đặt hàng thành công!</h2>
        <p className="success-order-code">Mã đơn hàng: <strong>#{orderCode}</strong></p>
        <p className="success-message">
          Cảm ơn bạn đã đặt hàng tại Florana! <br/>
          Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
        </p>
        <div className="success-actions">
          <Link to="/orders" className="success-btn primary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Xem đơn hàng
          </Link>
          <Link to="/" className="success-btn secondary">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Checkout(){
  const { items, clear, remove } = useCart()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [orderCreated, setOrderCreated] = useState(null)
  const [checkoutItems, setCheckoutItems] = useState([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successOrderCode, setSuccessOrderCode] = useState('')
  const navigate = useNavigate()

  const BANK_INFO = {
    bankId: '970422',
    accountNo: '0368920249',
    accountName: 'NGUYEN TAN LOI',
    template: 'compact'
  }

  // Get selected items from sessionStorage
  useEffect(() => {
    const selectedIds = sessionStorage.getItem('checkoutItems')
    if (selectedIds) {
      try {
        const ids = JSON.parse(selectedIds)
        const selectedItems = items.filter(item => ids.includes(item.product))
        setCheckoutItems(selectedItems)
      } catch (e) {
        // If error, use all items
        setCheckoutItems(items)
      }
    } else {
      // If no selection, use all items
      setCheckoutItems(items)
    }
    setIsInitialized(true)
  }, [items])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setAddress(user.address || '')
    }
  }, [user])

  useEffect(() => {
    // Only redirect after initialization is complete
    // Don't redirect if success modal is showing or QR page is showing
    if (!isInitialized || showQR || showSuccessModal) return
    
    if (items.length === 0 && !orderCreated) {
      navigate('/cart')
    } else if (checkoutItems.length === 0 && !orderCreated) {
      // Only redirect if no items selected after proper initialization
      navigate('/cart')
    }
  }, [checkoutItems, showQR, items, isInitialized, showSuccessModal, orderCreated])

  // Tính tổng tiền từ các items đã chọn
  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingFee = subtotal >= 500000 ? 0 : 30000
  const finalTotal = subtotal + shippingFee

  const generateQRContent = () => {
    const amount = finalTotal
    const description = `FLORANA ${orderCreated?._id?.slice(-6) || 'ORDER'}`
    return `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`
  }

  const handleSubmit = async e => {
    e.preventDefault()
    
    if (checkoutItems.length === 0) {
      return alert('Vui lòng chọn sản phẩm')
    }

    setLoading(true)
    try {
      const res = await api.post('/orders', { 
        customerName: name, 
        customerEmail: email, 
        phone: phone,
        address: address,
        items: checkoutItems, 
        total: finalTotal, 
        notes: note,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending'
      })
      
      setOrderCreated(res.data)
      
      if (paymentMethod === 'qr') {
        setShowQR(true)
      } else {
        // Remove only checkout items from cart
        checkoutItems.forEach(item => remove(item.product))
        sessionStorage.removeItem('checkoutItems')
        setSuccessOrderCode(res.data._id.slice(-8).toUpperCase())
        setShowSuccessModal(true)
      }
    } catch(e) { 
      alert('Đặt hàng thất bại: ' + (e.response?.data?.message || e.message)) 
    }
    setLoading(false)
  }

  const confirmPayment = () => {
    // Remove only checkout items from cart
    checkoutItems.forEach(item => remove(item.product))
    sessionStorage.removeItem('checkoutItems')
    setSuccessOrderCode(orderCreated._id.slice(-8).toUpperCase())
    setShowSuccessModal(true)
  }

  // QR Payment Page
  if (showQR && orderCreated) {
    return (
      <div className="checkout-page">
        <div className="cart-steps">
          <div className="step completed">GIỎ HÀNG</div>
          <span className="step-arrow">›</span>
          <div className="step active">THANH TOÁN</div>
          <span className="step-arrow">›</span>
          <div className="step">HOÀN THÀNH</div>
        </div>

        <div className="qr-payment">
          <div className="qr-card">
            <h2>Quét mã QR để thanh toán</h2>
            <p className="qr-subtitle">Sử dụng ứng dụng ngân hàng để quét</p>
            
            <div className="qr-amount">
              <span>Số tiền:</span>
              <strong>{finalTotal.toLocaleString('vi-VN')}₫</strong>
            </div>

            <div className="qr-image">
              <img src={generateQRContent()} alt="QR Code" />
            </div>

            <div className="bank-info">
              <div className="bank-row">
                <span>Ngân hàng:</span>
                <strong>MB Bank</strong>
              </div>
              <div className="bank-row">
                <span>Số tài khoản:</span>
                <strong>{BANK_INFO.accountNo}</strong>
              </div>
              <div className="bank-row">
                <span>Chủ tài khoản:</span>
                <strong>{BANK_INFO.accountName}</strong>
              </div>
              <div className="bank-row">
                <span>Nội dung CK:</span>
                <strong>FLORANA {orderCreated._id.slice(-6)}</strong>
              </div>
            </div>

            <div className="qr-notice">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
              <p>Sau khi chuyển khoản, vui lòng nhấn "Tôi đã thanh toán". Admin sẽ xác nhận trong vòng 24h.</p>
            </div>

            <div className="qr-actions">
              <button className="btn-confirm" onClick={confirmPayment}>
                Tôi đã thanh toán
              </button>
              <button className="btn-back" onClick={() => setShowQR(false)}>
                ← Quay lại
              </button>
            </div>
          </div>
        </div>

        {/* Success Modal for QR payment */}
        <SuccessModal 
          isOpen={showSuccessModal} 
          orderCode={successOrderCode}
          onClose={() => navigate('/orders')}
        />
      </div>
    )
  }

  return (
    <div className="checkout-page">
      {/* Steps */}
      <div className="cart-steps">
        <Link to="/cart" className="step completed">GIỎ HÀNG</Link>
        <span className="step-arrow">›</span>
        <div className="step active">THANH TOÁN</div>
        <span className="step-arrow">›</span>
        <div className="step">HOÀN THÀNH</div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-layout">
        {/* Left - Form */}
        <div className="checkout-form">
          <h2>Thông tin giao hàng</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Họ và tên <span className="required">*</span></label>
              <input 
                type="text"
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Nhập họ tên"
                required 
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại <span className="required">*</span></label>
              <input 
                type="tel"
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email <span className="required">*</span></label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Nhập email"
              required 
            />
          </div>

          <div className="form-group">
            <label>Địa chỉ giao hàng <span className="required">*</span></label>
            <textarea
              value={address} 
              onChange={e => setAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
              rows="3"
              required 
            />
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={note} 
              onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú về đơn hàng (tùy chọn)"
              rows="2"
            />
          </div>

          <h2>Phương thức thanh toán</h2>
          
          <div className="payment-options">
            <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
              <input 
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              <span className="radio-custom"></span>
              <div className="payment-text">
                <strong>Thanh toán khi nhận hàng (COD)</strong>
                <small>Thanh toán bằng tiền mặt khi nhận hàng</small>
              </div>
            </label>

            <label className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`}>
              <input 
                type="radio"
                name="payment"
                value="qr"
                checked={paymentMethod === 'qr'}
                onChange={e => setPaymentMethod(e.target.value)}
              />
              <span className="radio-custom"></span>
              <div className="payment-text">
                <strong>Chuyển khoản ngân hàng (QR Code)</strong>
                <small>Quét mã QR để thanh toán nhanh</small>
              </div>
            </label>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div className="order-summary">
          <h2>Đơn hàng của bạn ({checkoutItems.length} sản phẩm)</h2>
          
          <div className="order-items">
            {checkoutItems.map(item => (
              <div key={item.product} className="order-item">
                <div className="item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="placeholder">🌿</div>
                  )}
                  <span className="item-qty">{item.quantity}</span>
                </div>
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            ))}
          </div>

          <div className="order-totals">
            <div className="total-row">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="total-row">
              <span>Phí vận chuyển</span>
              <span className="shipping">{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span>
            </div>
            <div className="total-row final">
              <span>Tổng cộng</span>
              <span>{finalTotal.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-order"
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (paymentMethod === 'qr' ? 'TẠO MÃ QR THANH TOÁN' : 'ĐẶT HÀNG')}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal 
        isOpen={showSuccessModal} 
        orderCode={successOrderCode}
        onClose={() => navigate('/orders')}
      />
    </div>
  )
}
