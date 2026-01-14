import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  
  const orderId = searchParams.get('orderId');
  const orderCode = searchParams.get('orderCode');
  const amount = searchParams.get('amount');
  const paymentMethod = searchParams.get('method');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getPaymentMethodText = () => {
    if (paymentMethod === 'bank') return 'Chuyển khoản ngân hàng';
    if (paymentMethod === 'zalopay') return 'Ví ZaloPay';
    return 'Thanh toán khi nhận hàng';
  };

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon-wrapper">
          <div className="success-checkmark">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" fill="none"/>
              <path d="M8 12l2 2 4-4" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="success-ripple"></div>
        </div>

        <h1 className="success-title">🎉 Đặt hàng thành công!</h1>
        <p className="success-message">
          Cảm ơn bạn đã tin tưởng và mua hàng tại Floréa
        </p>

        <div className="order-details-card">
          <div className="detail-item">
            <span className="detail-label">Mã đơn hàng</span>
            <strong className="detail-value order-code">#{orderCode}</strong>
          </div>
          
          {amount && (
            <div className="detail-item">
              <span className="detail-label">Tổng tiền</span>
              <strong className="detail-value amount">{formatPrice(Number(amount))}</strong>
            </div>
          )}
          
          <div className="detail-item">
            <span className="detail-label">Phương thức thanh toán</span>
            <strong className="detail-value">{getPaymentMethodText()}</strong>
          </div>
        </div>

        {paymentMethod !== 'cod' && (
          <div className="payment-notice">
            <div className="notice-icon">💡</div>
            <p>
              Đơn hàng của bạn đang chờ xác nhận thanh toán. 
              Admin sẽ kiểm tra và xác nhận đơn hàng trong thời gian sớm nhất.
            </p>
          </div>
        )}

        {paymentMethod === 'cod' && (
          <div className="payment-notice cod">
            <div className="notice-icon">📦</div>
            <p>
              Đơn hàng của bạn đang được chuẩn bị. 
              Vui lòng chuẩn bị tiền mặt khi nhận hàng.
            </p>
          </div>
        )}

        <div className="action-buttons">
          {orderId && (
            <Link to={`/orders/${orderId}`} className="btn-view-order">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Xem chi tiết đơn hàng
            </Link>
          )}
          
          <Link to="/" className="btn-back-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Về trang chủ {countdown > 0 && `(${countdown}s)`}
          </Link>
        </div>

        <div className="continue-shopping">
          <p>Tiếp tục khám phá sản phẩm</p>
          <Link to="/shop" className="link-shop">
            Mua sắm ngay →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
