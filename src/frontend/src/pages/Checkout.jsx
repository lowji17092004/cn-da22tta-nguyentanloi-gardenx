import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Notification from '../components/Notification';
import api from '../api';
import './Checkout.css';

const Checkout = () => {
  const { items: cartItems, clear: clearCart, remove } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get selected items from sessionStorage (from Cart page)
  const checkoutItems = useMemo(() => {
    const selectedIds = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
    // If no selected items, use all cart items
    if (selectedIds.length === 0) return cartItems;
    // Filter cart items to only include selected ones
    return cartItems.filter(item => selectedIds.includes(item.product || item._id));
  }, [cartItems]);
  
  // Calculate total for selected items only
  const checkoutTotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
  }, [checkoutItems]);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    note: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('zalopay'); // 'cod' or 'zalopay'
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 phút
  const [notification, setNotification] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const countdownRef = useRef(null);
  const pollingRef = useRef(null);

  // Bank transfer info for QR generation
  const BANK_INFO = {
    bankId: '970422', // MB Bank
    accountNo: '0368920249',
    accountName: 'NGUYEN TAN LOI',
    template: 'compact2'
  };

  // Load user info
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (showPayment && countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showPayment]);

  // Polling for payment status
  useEffect(() => {
    if (showPayment && orderId) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/orders/${orderId}`);
          if (res.data.paymentStatus === 'paid') {
            clearInterval(pollingRef.current);
            clearInterval(countdownRef.current);
            handlePaymentSuccess();
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [showPayment, orderId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get product image
  const getProductImage = (item) => {
    const img = item.images?.[0] || item.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode.toUpperCase(),
        orderTotal: checkoutTotal
      });
      
      setAppliedCoupon(res.data);
      setNotification({ message: `Đã áp dụng mã giảm giá: ${res.data.code}`, type: 'success' });
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Calculate final total with coupon
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = checkoutTotal + 30000 - discountAmount;

  // Submit order
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.phone || !formData.address) {
      setNotification({ message: 'Vui lòng điền đầy đủ thông tin bắt buộc', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        phone: formData.phone,
        address: formData.address,
        items: checkoutItems.map(item => ({
          product: item.product || item._id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity,
          image: item.images?.[0] || item.image || item.imageUrl
        })),
        total: finalTotal,
        notes: formData.note,
        paymentMethod: paymentMethod,
        coupon: appliedCoupon ? {
          code: appliedCoupon.code,
          discountAmount: appliedCoupon.discountAmount,
          userCouponId: appliedCoupon.userCouponId
        } : null
      };

      const res = await api.post('/orders', orderData);
      const newOrderId = res.data._id;
      setOrderId(newOrderId);
      
      // Remove only ordered items from cart (keep unselected items)
      const selectedIds = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
      if (selectedIds.length > 0) {
        selectedIds.forEach(id => remove(id));
        sessionStorage.removeItem('checkoutItems');
      } else {
        clearCart();
      }
      
      // If COD, skip payment screen
      if (paymentMethod === 'cod') {
        setNotification({ 
          message: '✅ Đặt hàng thành công! Vui lòng chuẩn bị tiền mặt khi nhận hàng.', 
          type: 'success' 
        });
        setTimeout(() => navigate('/orders'), 2000);
        return;
      }
      
      // Generate QR code for bank transfer
      const orderCode = newOrderId.slice(-8).toUpperCase();
      const amount = finalTotal;
      const description = `TSG ${orderCode}`;
      
      const qrUrl = `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
      setQrCodeUrl(qrUrl);
      
      // Show payment screen
      setShowPayment(true);
      setCountdown(300);

      // Send system notification
      await api.post('/messages', {
        name: 'Hệ thống',
        email: 'system@thesungarden.vn',
        phone: '',
        subject: '🛒 Đơn hàng mới',
        message: `Đơn hàng #${orderCode} từ ${formData.fullName}\n` +
                 `📞 SĐT: ${formData.phone}\n` +
                 `💰 Tổng: ${formatPrice(checkoutTotal + 30000)}\n` +
                 `📍 Địa chỉ: ${formData.address}\n` +
                 `💳 Thanh toán: ${paymentMethod === 'cod' ? 'Tiền mặt (COD)' : 'Chuyển khoản'}`
      });

    } catch (err) {
      console.error('Order error:', err);
      setNotification({ message: 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    try {
      // Simulate payment confirmation for testing
      await api.post(`/orders/payment/zalopay/simulate/${orderId}`);
      
      setNotification({ 
        message: '✅ Đã gửi xác nhận! Hệ thống đang tự động xác nhận thanh toán...', 
        type: 'info' 
      });
      
      // Wait for polling to detect payment
      // The polling effect will automatically detect and redirect
    } catch (err) {
      console.error('Error:', err);
      setNotification({ message: '❌ Có lỗi xảy ra khi xác nhận thanh toán', type: 'error' });
    }
  };

  const handlePaymentSuccess = () => {
    setNotification({ message: '🎉 Thanh toán thành công!', type: 'success' });
    setTimeout(() => navigate(`/orders/${orderId}`), 2000);
  };

  const handleTimeout = async () => {
    try {
      await api.put(`/orders/${orderId}`, { status: 'cancelled' });
      setNotification({ message: '⏰ Hết thời gian thanh toán. Đơn hàng đã bị hủy.', type: 'warning' });
      setShowPayment(false);
    } catch (err) {
      console.error('Timeout error:', err);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Bạn có chắc muốn hủy đơn hàng?')) {
      try {
        await api.put(`/orders/${orderId}`, { status: 'cancelled' });
        setShowPayment(false);
      } catch (err) {
        console.error('Cancel error:', err);
      }
    }
  };

  // Empty cart
  if (cartItems.length === 0 && !showPayment) {
    return (
      <div className="checkout-page">
        <div className="empty-cart">
          <div className="icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm sản phẩm vào giỏ hàng để thanh toán</p>
          <Link to="/products" className="shop-link">
            🌸 Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Header */}
      <div className="checkout-header">
        <h1>💳 Thanh toán đơn hàng</h1>
        <p>Thanh toán qua ZaloPay - Nhanh chóng & An toàn</p>
      </div>

      <div className="checkout-container">
        {/* Left - Form */}
        <div className="checkout-form">
          {/* Shipping Info */}
          <div className="checkout-section">
            <h2 className="section-title">
              <span className="icon">📍</span>
              Thông tin giao hàng
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email (không bắt buộc)"
                />
              </div>
              
              <div className="form-group">
                <label>Địa chỉ giao hàng *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ghi chú thêm về đơn hàng (không bắt buộc)"
                />
              </div>
            </form>
          </div>

          {/* Payment Method Selection */}
          <div className="checkout-section payment-method-section">
            <h2 className="section-title">
              <span className="icon">💳</span>
              Phương thức thanh toán
            </h2>
            
            <div className="payment-options">
              <div 
                className={`payment-option ${paymentMethod === 'zalopay' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('zalopay')}
              >
                <div className="radio-circle">
                  {paymentMethod === 'zalopay' && <div className="radio-dot"></div>}
                </div>
                <div className="payment-content">
                  <div className="zalopay-logo-small">Zalo<br/>Pay</div>
                  <div className="payment-text">
                    <h4>Thanh toán ZaloPay</h4>
                    <p>Quét mã QR để thanh toán nhanh chóng</p>
                  </div>
                </div>
              </div>

              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="radio-circle">
                  {paymentMethod === 'cod' && <div className="radio-dot"></div>}
                </div>
                <div className="payment-content">
                  <div className="cod-icon">💵</div>
                  <div className="payment-text">
                    <h4>Thanh toán khi nhận hàng (COD)</h4>
                    <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="processing-spinner" style={{width: '20px', height: '20px', margin: 0}}></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  {paymentMethod === 'cod' ? '✓ Đặt hàng ngay' : '💳 Thanh toán ZaloPay'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right - Summary */}
        <div className="checkout-section order-summary">
          <h2 className="section-title">
            <span className="icon">🛍️</span>
            Đơn hàng của bạn ({checkoutItems.length} sản phẩm)
          </h2>

          <div className="summary-items">
            {checkoutItems.map(item => (
              <div className="summary-item" key={item.product || item._id}>
                <div className="item-image">
                  {getProductImage(item) ? (
                    <img 
                      src={getProductImage(item)} 
                      alt={item.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="emoji">🌸</span>
                  )}
                </div>
                <div className="item-details">
                  <div className="name">{item.name}</div>
                  <div className="meta">SL: {item.quantity}</div>
                </div>
                <div className="item-price">
                  {formatPrice((item.salePrice || item.price) * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(checkoutTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(30000)}</span>
            </div>
            {appliedCoupon && (
              <div className="summary-row discount">
                <span>Giảm giá ({appliedCoupon.code}):</span>
                <span className="discount-value">-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            <h3>🎟️ Mã giảm giá</h3>
            {appliedCoupon ? (
              <div className="applied-coupon">
                <div className="coupon-badge">
                  <span className="coupon-code">{appliedCoupon.code}</span>
                  <span className="coupon-desc">-{formatPrice(discountAmount)}</span>
                </div>
                <button className="remove-coupon-btn" onClick={handleRemoveCoupon}>
                  ✕
                </button>
              </div>
            ) : (
              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="coupon-input"
                  disabled={couponLoading}
                />
                <button 
                  className="apply-coupon-btn"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  {couponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                </button>
              </div>
            )}
            {couponError && <div className="coupon-error">{couponError}</div>}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="modal-header">
              <h2>💳 Chuyển khoản ngân hàng</h2>
              <p>Quét mã QR để thanh toán nhanh chóng</p>
            </div>

            <div className="qr-container">
              <div className="qr-frame">
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code Chuyển khoản" />}
              </div>
              <div className="bank-info">
                <div className="bank-name">🏦 MB Bank (MBBank)</div>
                <div className="account-holder">{BANK_INFO.accountName}</div>
                <div className="account-number">STK: {BANK_INFO.accountNo}</div>
                <div className="payment-amount">
                  Số tiền: <strong>{formatPrice(checkoutTotal + 30000)}</strong>
                </div>
                <div className="payment-note">
                  <span className="note-icon">⚡</span>
                  <span className="note-text">
                    Nội dung CK: <strong>TSG {orderId?.slice(-8).toUpperCase()}</strong>
                  </span>
                </div>
                <div className="payment-note">
                  <span className="note-icon">✨</span>
                  <span className="note-text">
                    Sau khi chuyển khoản và nhấn "Đã thanh toán", hệ thống sẽ TỰ ĐỘNG xác nhận ngay lập tức
                  </span>
                </div>
              </div>
            </div>

            <div className="timer-section">
              <div className="timer-circle">
                <span className="time">{formatTime(countdown)}</span>
                <span className="label">còn lại</span>
              </div>
              <p className="timer-text">Đơn hàng sẽ tự hủy khi hết thời gian</p>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                Hủy đơn
              </button>
              <button className="confirm-btn" onClick={handlePaymentConfirm}>
                ✓ Đã thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <>
          <div className="notification-overlay" onClick={() => setNotification(null)}></div>
          <Notification 
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            duration={3000}
          />
        </>
      )}
    </div>
  );
};

export default Checkout;
