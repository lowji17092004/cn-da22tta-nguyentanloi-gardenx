import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import CancelOrderModal from '../components/CancelOrderModal';
import Toast from '../components/Toast';
import './OrderDetailNew.css';

const OrderDetailNew = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Check if coming from successful order
    if (searchParams.get('success') === 'true') {
      setShowSuccessModal(true);
      // Remove query param from URL
      navigate(`/orders/${id}`, { replace: true });
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductImage = (item) => {
    const img = item.image || item.product?.images?.[0] || item.product?.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const statusConfig = {
    pending: { 
      text: 'Chờ xác nhận', 
      icon: '⏳', 
      color: '#f59e0b',
      bg: '#fef3c7',
      description: 'Đơn hàng đang chờ được xác nhận'
    },
    confirmed: { 
      text: 'Đã xác nhận', 
      icon: '✅', 
      color: '#3b82f6',
      bg: '#dbeafe',
      description: 'Đơn hàng đã được xác nhận và đang chuẩn bị'
    },
    preparing: { 
      text: 'Đang chuẩn bị', 
      icon: '📦', 
      color: '#8b5cf6',
      bg: '#ede9fe',
      description: 'Đang đóng gói sản phẩm'
    },
    shipping: { 
      text: 'Đang giao hàng', 
      icon: '🚚', 
      color: '#06b6d4',
      bg: '#cffafe',
      description: 'Đơn hàng đang trên đường giao đến bạn'
    },
    delivered: { 
      text: 'Đã giao hàng', 
      icon: '🎉', 
      color: '#22c55e',
      bg: '#d1fae5',
      description: 'Đơn hàng đã được giao thành công'
    },
    cancelled: { 
      text: 'Đã hủy', 
      icon: '❌', 
      color: '#ef4444',
      bg: '#fee2e2',
      description: 'Đơn hàng đã bị hủy'
    }
  };

  const timelineSteps = [
    { key: 'pending', icon: '📝', label: 'Đặt hàng', time: order?.createdAt },
    { key: 'confirmed', icon: '✅', label: 'Xác nhận', time: order?.confirmedAt },
    { key: 'preparing', icon: '📦', label: 'Chuẩn bị', time: order?.preparingAt },
    { key: 'shipping', icon: '🚚', label: 'Vận chuyển', time: order?.shippingAt },
    { key: 'delivered', icon: '🎉', label: 'Hoàn thành', time: order?.deliveredAt }
  ];

  const getStepState = (stepKey) => {
    if (order?.status === 'cancelled') return stepKey === 'pending' ? 'completed' : '';
    const statusOrder = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return '';
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      await api.put(`/orders/${id}/cancel`, { reason });
      
      setShowCancelModal(false);
      setToast({ type: 'success', message: 'Đơn hàng đã được hủy thành công!' });
      
      // Refresh order after short delay to show toast
      setTimeout(() => {
        fetchOrder();
      }, 500);
    } catch (err) {
      console.error('Cancel error:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại!' });
    }
  };

  const canCancel = order && order.status === 'pending';

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-error">
        <div className="error-icon">📦</div>
        <h2>Không tìm thấy đơn hàng</h2>
        <Link to="/orders" className="btn-back">← Quay lại danh sách</Link>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="order-detail-new">
      {/* Header */}
      <div className="order-header">
        <div className="order-header-left">
          <button onClick={() => navigate('/orders')} className="btn-back-arrow">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
          <div>
            <h1>Chi tiết đơn hàng</h1>
            <p className="order-id">Mã đơn: <span>#{order._id.slice(-8).toUpperCase()}</span></p>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="status-card" style={{ background: currentStatus.bg }}>
        <div className="status-icon" style={{ background: currentStatus.color }}>
          <span>{currentStatus.icon}</span>
        </div>
        <div className="status-info">
          <h3 style={{ color: currentStatus.color }}>{currentStatus.text}</h3>
          <p>{currentStatus.description}</p>
          <span className="status-date">{formatDate(order.createdAt)}</span>
        </div>
        {canCancel && (
          <button className="btn-cancel-order" onClick={() => setShowCancelModal(true)}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            Hủy đơn hàng
          </button>
        )}
      </div>

      {/* Timeline */}
      {order.status !== 'cancelled' && (
        <div className="order-timeline-card">
          <h3>Tiến trình đơn hàng</h3>
          <div className="timeline">
            {timelineSteps.map((step, index) => {
              const state = getStepState(step.key);
              return (
                <div key={step.key} className={`timeline-step ${state}`}>
                  <div className="timeline-icon">
                    <span>{step.icon}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-label">{step.label}</div>
                    {step.time && state === 'completed' && (
                      <div className="timeline-time">{formatDate(step.time)}</div>
                    )}
                  </div>
                  {index < timelineSteps.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="order-content-grid">
        {/* Products */}
        <div className="order-section products-section">
          <div className="section-header">
            <h3>Sản phẩm đã đặt ({order.items?.length || 0})</h3>
          </div>
          <div className="products-list">
            {order.items?.map((item, index) => (
              <div key={index} className="product-item-new">
                <div className="product-image-new">
                  {getProductImage(item) ? (
                    <img src={getProductImage(item)} alt={item.name} />
                  ) : (
                    <div className="image-placeholder">🌿</div>
                  )}
                </div>
                <div className="product-info-new">
                  <h4>{item.name}</h4>
                  <div className="product-meta">
                    <span className="product-price">{formatPrice(item.price)}</span>
                    <span className="product-qty">x{item.quantity}</span>
                  </div>
                </div>
                <div className="product-total-new">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="order-section summary-section">
          <div className="section-header">
            <h3>Tổng quan đơn hàng</h3>
          </div>
          
          <div className="summary-rows">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatPrice((order.total || 0) - 30000)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>{formatPrice(30000)}</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatPrice(order.total || 0)}</span>
            </div>
          </div>

          <div className="payment-info">
            <div className="payment-row">
              <span className="payment-label">Phương thức thanh toán:</span>
              <span className="payment-value">
                {order.paymentMethod === 'cod' ? '💵 COD' : '🏦 Chuyển khoản'}
              </span>
            </div>
            <div className="payment-row">
              <span className="payment-label">Trạng thái thanh toán:</span>
              <span className={`payment-status ${order.paymentStatus}`}>
                {order.paymentStatus === 'paid' ? '✅ Đã thanh toán' : 
                 order.paymentStatus === 'pending' ? '⏳ Chưa thanh toán' : 
                 '❌ Thất bại'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="order-section customer-section">
        <div className="section-header">
          <h3>Thông tin giao hàng</h3>
        </div>
        <div className="customer-info-grid">
          <div className="info-item">
            <div className="info-icon">👤</div>
            <div className="info-content">
              <span className="info-label">Người nhận</span>
              <span className="info-value">{order.customerName}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">📞</div>
            <div className="info-content">
              <span className="info-label">Số điện thoại</span>
              <span className="info-value">{order.phone}</span>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">✉️</div>
            <div className="info-content">
              <span className="info-label">Email</span>
              <span className="info-value">{order.customerEmail || 'Không có'}</span>
            </div>
          </div>
          <div className="info-item full-width">
            <div className="info-icon">📍</div>
            <div className="info-content">
              <span className="info-label">Địa chỉ giao hàng</span>
              <span className="info-value">{order.address}</span>
            </div>
          </div>
          {order.notes && (
            <div className="info-item full-width">
              <div className="info-icon">📝</div>
              <div className="info-content">
                <span className="info-label">Ghi chú</span>
                <span className="info-value">{order.notes}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        orderId={order._id}
      />

      {/* Success Modal - hiển thị khi đặt hàng thành công */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon-wrapper">
              <svg className="success-checkmark" viewBox="0 0 52 52">
                <circle className="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            <h2>🎉 Đặt hàng thành công!</h2>
            <p>Cảm ơn bạn đã mua sắm tại The Sun Garden</p>
            <p className="order-code-success">Mã đơn hàng: <strong>#{order?._id?.slice(-8).toUpperCase()}</strong></p>
            <div className="success-info">
              <p>📧 Chúng tôi sẽ gửi email xác nhận đơn hàng cho bạn</p>
              <p>📱 Bạn có thể theo dõi đơn hàng tại đây</p>
            </div>
            <button className="btn-success-close" onClick={() => setShowSuccessModal(false)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
              Xem chi tiết đơn hàng
            </button>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OrderDetailNew;
