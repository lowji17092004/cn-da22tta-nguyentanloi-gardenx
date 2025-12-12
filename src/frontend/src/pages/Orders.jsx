import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviews, setReviews] = useState({});
  const [reviewForms, setReviewForms] = useState({});
  const [submittingReview, setSubmittingReview] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  const statusConfig = {
    pending: { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fef3c7' },
    confirmed: { label: 'Đã xác nhận', color: '#3b82f6', bg: '#dbeafe' },
    preparing: { label: 'Đang chuẩn bị', color: '#8b5cf6', bg: '#ede9fe' },
    shipping: { label: 'Đang giao', color: '#06b6d4', bg: '#cffafe' },
    delivered: { label: 'Hoàn thành', color: '#10b981', bg: '#d1fae5' },
    cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' }
  };

  useEffect(() => {
    fetchOrders();
    fetchMyReviews();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/my-orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Lỗi khi tải đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reviews/my-reviews', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      const reviewMap = {};
      data.forEach(review => { reviewMap[review.orderItem] = review; });
      setReviews(reviewMap);
    } catch (error) {
      console.error('Lỗi khi tải đánh giá:', error);
    }
  };

  const handleReviewChange = (orderItemId, field, value) => {
    setReviewForms(prev => ({
      ...prev,
      [orderItemId]: { ...prev[orderItemId], [field]: value }
    }));
  };

  const handleMediaUpload = async (orderItemId, files) => {
    if (!files || files.length === 0) return;
    setUploadingMedia(orderItemId);
    
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('media', file));
    
    try {
      const response = await fetch('http://localhost:5000/api/reviews/upload-media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviewForms(prev => ({
          ...prev,
          [orderItemId]: {
            ...prev[orderItemId],
            images: [...(prev[orderItemId]?.images || []), ...data.images],
            videos: [...(prev[orderItemId]?.videos || []), ...data.videos]
          }
        }));
      } else {
        const error = await response.json();
        alert(error.message || 'Lỗi upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Có lỗi xảy ra khi upload');
    } finally {
      setUploadingMedia(null);
    }
  };

  const removeMedia = (orderItemId, type, index) => {
    setReviewForms(prev => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        [type]: prev[orderItemId]?.[type]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const submitReview = async (orderId, orderItemId, productId) => {
    const form = reviewForms[orderItemId];
    if (!form?.rating) {
      alert('Vui lòng chọn số sao đánh giá');
      return;
    }

    setSubmittingReview(orderItemId);
    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          product: productId,
          order: orderId,
          orderItem: orderItemId,
          rating: form.rating,
          comment: form.comment || '',
          images: form.images || [],
          videos: form.videos || []
        })
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews(prev => ({ ...prev, [orderItemId]: newReview }));
        setReviewForms(prev => {
          const updated = { ...prev };
          delete updated[orderItemId];
          return updated;
        });
        alert('Đánh giá đã được gửi thành công!');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmittingReview(null);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (response.ok) {
        alert('Đơn hàng đã được hủy thành công!');
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi hủy đơn hàng');
      }
    } catch (error) {
      console.error('Lỗi khi hủy đơn hàng:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  const getProductImage = (item) => {
    // Ưu tiên lấy từ item.image (đã lưu sẵn trong Order)
    if (item.image) return `http://localhost:5000${item.image}`;
    // Sau đó thử từ product populate
    if (item.product?.images?.[0]) return `http://localhost:5000${item.product.images[0]}`;
    if (item.product?.image) return `http://localhost:5000${item.product.image}`;
    // Fallback: placeholder hoặc ảnh mặc định
    return 'https://via.placeholder.com/150/10b981/ffffff?text=No+Image';
  };

  const getProductName = (item) => {
    // Ưu tiên lấy từ item.name (đã lưu sẵn trong Order)
    if (item.name) return item.name;
    // Sau đó thử từ product populate
    if (item.product?.name) return item.product.name;
    return 'Sản phẩm';
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + 'đ';
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered'];
    return steps.indexOf(status) + 1;
  };

  const renderStarRating = (rating, orderItemId, interactive = false) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && handleReviewChange(orderItemId, 'rating', star)}
        >
          ★
        </span>
      ))}
    </div>
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  if (loading) {
    return (
      <div className="orders-page-wrapper">
        <div className="orders-loading-screen">
          <div className="loader">
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
            <div className="loader-ring"></div>
          </div>
          <p>Đang tải đơn hàng của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      {/* Hero Banner */}
      <div className="orders-hero">
        <div className="hero-content">
          <h1>Đơn hàng của tôi</h1>
          <p>Theo dõi và quản lý tất cả đơn hàng của bạn tại đây</p>
        </div>
        <div className="hero-decoration">
          <div className="circle c1"></div>
          <div className="circle c2"></div>
          <div className="circle c3"></div>
        </div>
      </div>

      <div className="orders-main-container">
        {/* Stats Cards */}
        <div className="orders-stats-row">
          <div className="stat-card total" onClick={() => setFilter('all')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-text">Tổng đơn hàng</span>
            </div>
          </div>
          <div className="stat-card pending" onClick={() => setFilter('pending')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-text">Chờ xác nhận</span>
            </div>
          </div>
          <div className="stat-card shipping" onClick={() => setFilter('shipping')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.shipping}</span>
              <span className="stat-text">Đang giao</span>
            </div>
          </div>
          <div className="stat-card delivered" onClick={() => setFilter('delivered')}>
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.delivered}</span>
              <span className="stat-text">Hoàn thành</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filter-bar">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              <span className="tab-label">Tất cả</span>
              <span className="tab-count">{orders.length}</span>
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                className={`filter-tab ${filter === key ? 'active' : ''}`}
                onClick={() => setFilter(key)}
                style={{ '--tab-color': config.color }}
              >
                <span className="tab-label">{config.label}</span>
                <span className="tab-count">{orders.filter(o => o.status === key).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="orders-content-grid">
          {/* Orders List */}
          <div className="orders-list-section">
            {filteredOrders.length === 0 ? (
              <div className="empty-orders">
                <div className="empty-illustration">
                  <svg viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="80" fill="#f3f4f6"/>
                    <path d="M60 80h80v60a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V80z" fill="#e5e7eb"/>
                    <path d="M55 80h90l-10-25H65l-10 25z" fill="#d1d5db"/>
                    <circle cx="85" cy="110" r="8" fill="#9ca3af"/>
                    <circle cx="115" cy="110" r="8" fill="#9ca3af"/>
                    <path d="M85 130c0 0 7.5 10 15 10s15-10 15-10" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Chưa có đơn hàng nào</h3>
                <p>Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
                <Link to="/products" className="browse-products-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Khám phá ngay
                </Link>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map(order => {
                  const config = statusConfig[order.status];
                  return (
                    <div 
                      key={order._id} 
                      className={`order-card-modern ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedOrder(selectedOrder?._id === order._id ? null : order);
                        setActiveTab('info');
                      }}
                    >
                      {/* Status Ribbon */}
                      <div 
                        className="status-ribbon"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.label}
                      </div>

                      {/* Card Header */}
                      <div className="card-header-modern">
                        <div className="order-id-badge">
                          <span className="hash">#</span>
                          <span className="id-text">{order._id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="order-date-modern">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(order.createdAt)}
                        </div>
                      </div>

                      {/* Products Visual */}
                      <div className="products-visual">
                        <div className="products-stack">
                          {(order.items || []).slice(0, 4).map((item, idx) => (
                            <div 
                              key={idx} 
                              className="product-thumb"
                              style={{ zIndex: 4 - idx, transform: `translateX(${idx * 20}px)` }}
                            >
                              <img
                                src={getProductImage(item)}
                                alt=""
                                onError={(e) => { e.target.src = '/placeholder.png' }}
                              />
                            </div>
                          ))}
                          {(order.items?.length || 0) > 4 && (
                            <div className="products-more" style={{ transform: `translateX(${4 * 20}px)` }}>
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="products-count">{order.items?.length || 0} sản phẩm</span>
                      </div>

                      {/* Progress Visual */}
                      {order.status !== 'cancelled' && (
                        <div className="progress-visual">
                          <div className="progress-track-modern">
                            <div 
                              className="progress-fill-modern"
                              style={{ 
                                width: `${((getStatusStep(order.status) - 1) / 4) * 100}%`,
                                backgroundColor: config.color
                              }}
                            />
                          </div>
                          <div className="progress-dots">
                            {[1, 2, 3, 4, 5].map(step => (
                              <div 
                                key={step}
                                className={`progress-dot ${step <= getStatusStep(order.status) ? 'active' : ''}`}
                                style={{ '--dot-color': config.color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="cancelled-notice">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                          Đơn hàng đã bị hủy
                        </div>
                      )}

                      {/* Card Footer */}
                      <div className="card-footer-modern">
                        <span className="view-detail-hint">Nhấn để xem chi tiết</span>
                        <div className="order-total-modern">
                          {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedOrder && (
            <div className="detail-panel-modern">
              <div className="panel-header-modern">
                <div className="panel-title-group">
                  <h2>Chi tiết đơn hàng</h2>
                  <div className="order-badge-large">
                    #{selectedOrder._id.slice(-8).toUpperCase()}
                  </div>
                </div>
                <button 
                  className="close-panel-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              {/* Status Badge Large */}
              <div 
                className="status-display"
                style={{ 
                  backgroundColor: statusConfig[selectedOrder.status].bg,
                  color: statusConfig[selectedOrder.status].color
                }}
              >
                <div className="status-icon-large">
                  {selectedOrder.status === 'delivered' ? '✓' : 
                   selectedOrder.status === 'cancelled' ? '✕' : '●'}
                </div>
                <div className="status-text-large">
                  <span className="status-label">Trạng thái</span>
                  <span className="status-value">{statusConfig[selectedOrder.status].label}</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                <button 
                  className={`detail-tab ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  Thông tin
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  Sản phẩm
                </button>
                <button 
                  className={`detail-tab ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  Lịch sử
                </button>
                {selectedOrder.status === 'delivered' && (
                  <button 
                    className={`detail-tab ${activeTab === 'review' ? 'active' : ''}`}
                    onClick={() => setActiveTab('review')}
                  >
                    Đánh giá
                  </button>
                )}
              </div>

              <div className="panel-body-modern">
                {/* Info Tab */}
                {activeTab === 'info' && (
                  <div className="tab-content">
                    {/* Progress Stepper */}
                    {selectedOrder.status !== 'cancelled' && (
                      <div className="stepper-section">
                        <h4>Tiến trình đơn hàng</h4>
                        <div className="stepper-modern">
                          {['pending', 'confirmed', 'preparing', 'shipping', 'delivered'].map((step, idx) => {
                            const currentIdx = getStatusStep(selectedOrder.status) - 1;
                            const isCompleted = idx < currentIdx;
                            const isCurrent = idx === currentIdx;
                            return (
                              <div key={step} className={`step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                                <div className="step-connector" />
                                <div className="step-circle">
                                  {isCompleted ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  ) : (
                                    <span>{idx + 1}</span>
                                  )}
                                </div>
                                <span className="step-name">{statusConfig[step].label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Shipping Info */}
                    <div className="info-section">
                      <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Thông tin giao hàng
                      </h4>
                      <div className="info-card">
                        <div className="info-field">
                          <label>Người nhận</label>
                          <span>{selectedOrder.customerName || 'N/A'}</span>
                        </div>
                        <div className="info-field">
                          <label>Số điện thoại</label>
                          <span>{selectedOrder.phone || 'N/A'}</span>
                        </div>
                        <div className="info-field full">
                          <label>Địa chỉ</label>
                          <span>{selectedOrder.address || 'N/A'}</span>
                        </div>
                        {selectedOrder.notes && (
                          <div className="info-field full notes">
                            <label>Ghi chú</label>
                            <span>{selectedOrder.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="info-section">
                      <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        Thông tin thanh toán
                      </h4>
                      <div className="info-card">
                        <div className="info-field">
                          <label>Phương thức</label>
                          <span className="payment-badge">
                            {selectedOrder.paymentMethod === 'qr' ? '📱 QR Code' : '💵 COD'}
                          </span>
                        </div>
                        <div className="info-field">
                          <label>Trạng thái thanh toán</label>
                          <span className={`payment-status ${selectedOrder.paymentStatus || 'pending'}`}>
                            {selectedOrder.paymentStatus === 'paid' ? '✓ Đã thanh toán' : 
                             selectedOrder.paymentStatus === 'failed' ? '✕ Thất bại' : 
                             '⏳ Chưa thanh toán'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="summary-section">
                      <h4>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                          <line x1="1" y1="10" x2="23" y2="10"/>
                        </svg>
                        Tóm tắt đơn hàng
                      </h4>
                      <div className="summary-card">
                        <div className="summary-row">
                          <span>Số sản phẩm</span>
                          <span>{selectedOrder.items?.length || 0} sản phẩm</span>
                        </div>
                        <div className="summary-row">
                          <span>Ngày đặt</span>
                          <span>{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Tổng thanh toán</span>
                          <span>{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cancel Order Button - Only show for pending/confirmed */}
                    {(selectedOrder.status === 'pending' || selectedOrder.status === 'confirmed') && (
                      <div className="cancel-order-section">
                        <button 
                          className="btn-cancel-order"
                          onClick={() => cancelOrder(selectedOrder._id)}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                          Hủy đơn hàng
                        </button>
                        <p className="cancel-note">Bạn chỉ có thể hủy đơn hàng khi đơn chưa được giao cho đơn vị vận chuyển</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                  <div className="tab-content">
                    <div className="products-list-modern">
                      {(selectedOrder.items || []).map((item, idx) => (
                        <div key={idx} className="product-item-modern">
                          <div className="product-image-wrapper">
                            <img
                              src={getProductImage(item)}
                              alt={getProductName(item)}
                              onError={(e) => { e.target.src = '/placeholder.png' }}
                            />
                          </div>
                          <div className="product-details-modern">
                            <h5>{getProductName(item)}</h5>
                            <div className="product-meta">
                              <span className="unit-price">{formatPrice(item.price)}</span>
                              <span className="quantity">×{item.quantity}</span>
                            </div>
                          </div>
                          <div className="product-subtotal-modern">
                            {formatPrice((item.price || 0) * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="products-total-bar">
                      <span>Tổng cộng</span>
                      <span className="total-amount">{formatPrice(selectedOrder.total)}</span>
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div className="tab-content">
                    {selectedOrder.statusHistory?.length > 0 ? (
                      <div className="timeline-modern">
                        {selectedOrder.statusHistory.map((h, idx) => (
                          <div key={idx} className="timeline-item-modern">
                            <div 
                              className="timeline-marker"
                              style={{ backgroundColor: statusConfig[h.status]?.color || '#888' }}
                            />
                            <div className="timeline-card">
                              <div className="timeline-header">
                                <span 
                                  className="timeline-status"
                                  style={{ color: statusConfig[h.status]?.color || '#888' }}
                                >
                                  {statusConfig[h.status]?.label || h.status}
                                </span>
                                <span className="timeline-time">{formatDate(h.updatedAt)}</span>
                              </div>
                              {h.note && <p className="timeline-note">{h.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-history">
                        <p>Chưa có lịch sử cập nhật</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Review Tab */}
                {activeTab === 'review' && selectedOrder.status === 'delivered' && (
                  <div className="tab-content">
                    <div className="reviews-list-modern">
                      {(selectedOrder.items || []).map(item => {
                        const orderItemId = item._id;
                        const existingReview = reviews[orderItemId];
                        const reviewForm = reviewForms[orderItemId] || {};

                        return (
                          <div key={orderItemId} className="review-item-modern">
                            <div className="review-product-info">
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                onError={(e) => { e.target.src = '/placeholder.png' }}
                              />
                              <div>
                                <strong>{getProductName(item)}</strong>
                                <span>Số lượng: {item.quantity}</span>
                              </div>
                            </div>

                            {existingReview ? (
                              <div className="review-content-modern">
                                <div className="review-header-modern">
                                  {renderStarRating(existingReview.rating)}
                                  <span className="review-time">{formatDate(existingReview.createdAt)}</span>
                                </div>
                                {existingReview.comment && (
                                  <p className="review-comment-modern">{existingReview.comment}</p>
                                )}
                                
                                {existingReview.images?.length > 0 && (
                                  <div className="review-gallery">
                                    {existingReview.images.map((img, i) => (
                                      <img key={i} src={`http://localhost:5000${img}`} alt="" />
                                    ))}
                                  </div>
                                )}
                                
                                {existingReview.videos?.length > 0 && (
                                  <div className="review-gallery">
                                    {existingReview.videos.map((vid, i) => (
                                      <video key={i} controls>
                                        <source src={`http://localhost:5000${vid}`} />
                                      </video>
                                    ))}
                                  </div>
                                )}

                                {existingReview.reply?.content && (
                                  <div className="shop-reply-modern">
                                    <div className="reply-header-modern">
                                      <span className="reply-badge">Phản hồi từ shop</span>
                                      <span className="reply-time">{formatDate(existingReview.reply.repliedAt)}</span>
                                    </div>
                                    <p>{existingReview.reply.content}</p>
                                  </div>
                                )}

                                <div className="review-submitted-badge">
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                  </svg>
                                  Đã đánh giá
                                </div>
                              </div>
                            ) : (
                              <div className="review-form-modern">
                                <div className="rating-section">
                                  <span className="rating-prompt">Bạn đánh giá sản phẩm này thế nào?</span>
                                  <div className="rating-stars-large">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <button
                                        key={star}
                                        className={`star-btn ${star <= (reviewForm.rating || 0) ? 'active' : ''}`}
                                        onClick={() => handleReviewChange(orderItemId, 'rating', star)}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                  <span className="rating-text">
                                    {reviewForm.rating === 5 ? 'Tuyệt vời!' :
                                     reviewForm.rating === 4 ? 'Hài lòng' :
                                     reviewForm.rating === 3 ? 'Bình thường' :
                                     reviewForm.rating === 2 ? 'Không hài lòng' :
                                     reviewForm.rating === 1 ? 'Rất tệ' : 'Chọn số sao'}
                                  </span>
                                </div>
                                
                                <textarea
                                  className="review-textarea-modern"
                                  placeholder="Chia sẻ chi tiết trải nghiệm của bạn về sản phẩm này..."
                                  value={reviewForm.comment || ''}
                                  onChange={(e) => handleReviewChange(orderItemId, 'comment', e.target.value)}
                                  rows={4}
                                />
                                
                                <div className="upload-section">
                                  <label className="upload-area">
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*,video/*"
                                      onChange={(e) => handleMediaUpload(orderItemId, e.target.files)}
                                      disabled={uploadingMedia === orderItemId}
                                    />
                                    <div className="upload-content">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                      </svg>
                                      <span>{uploadingMedia === orderItemId ? 'Đang tải lên...' : 'Thêm hình ảnh hoặc video'}</span>
                                    </div>
                                  </label>
                                </div>

                                {((reviewForm.images?.length > 0) || (reviewForm.videos?.length > 0)) && (
                                  <div className="media-preview-grid">
                                    {reviewForm.images?.map((img, i) => (
                                      <div key={`img-${i}`} className="media-preview-item">
                                        <img src={`http://localhost:5000${img}`} alt="" />
                                        <button 
                                          className="remove-media"
                                          onClick={() => removeMedia(orderItemId, 'images', i)}
                                        >×</button>
                                      </div>
                                    ))}
                                    {reviewForm.videos?.map((vid, i) => (
                                      <div key={`vid-${i}`} className="media-preview-item video">
                                        <video><source src={`http://localhost:5000${vid}`} /></video>
                                        <div className="video-overlay">▶</div>
                                        <button 
                                          className="remove-media"
                                          onClick={() => removeMedia(orderItemId, 'videos', i)}
                                        >×</button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <button
                                  className="submit-review-btn"
                                  onClick={() => submitReview(selectedOrder._id, orderItemId, item.product?._id)}
                                  disabled={submittingReview === orderItemId || !reviewForm.rating}
                                >
                                  {submittingReview === orderItemId ? (
                                    <>
                                      <span className="btn-spinner"></span>
                                      Đang gửi...
                                    </>
                                  ) : (
                                    <>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13"/>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                      </svg>
                                      Gửi đánh giá
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
