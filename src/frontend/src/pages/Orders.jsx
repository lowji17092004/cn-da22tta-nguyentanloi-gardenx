import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import CancelOrderModal from '../components/CancelOrderModal';
import Toast from '../components/Toast';
import PageBanner from '../components/PageBanner';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      await api.put(`/orders/${orderId}/cancel`, { reason });
      
      // Update order status in state immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      setShowCancelModal(false);
      setToast({ type: 'success', message: 'Đơn hàng đã được hủy thành công!' });
    } catch (err) {
      console.error('Error cancelling order:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại!' });
    }
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const statusLabels = {
    pending: { text: 'Chờ xác nhận', icon: '⏳' },
    confirmed: { text: 'Đã xác nhận', icon: '✅' },
    preparing: { text: 'Đang chuẩn bị', icon: '📦' },
    shipping: { text: 'Đang giao', icon: '🚚' },
    delivered: { text: 'Đã giao', icon: '🎉' },
    cancelled: { text: 'Đã hủy', icon: '❌' }
  };

  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' }
  ];

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(o => o.status === filter);

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    delivered: orders.filter(o => o.status === 'delivered').length
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

  // Fix product image - kiểm tra đúng cách
  const getProductImage = (item) => {
    // Lấy image từ item hoặc product
    const img = item.image || item.product?.images?.[0] || item.product?.image;
    
    if (!img) return null;
    
    // Nếu là URL đầy đủ
    if (img.startsWith('http')) return img;
    
    // Nếu là path từ server
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-loading">
          <div className="spinner"></div>
          <span>Đang tải đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      {/* Banner */}
      <PageBanner page="orders" />
      
      {/* Header */}
      <div className="orders-header">
        <h1>🛍️ Đơn hàng của tôi</h1>
        <p>Theo dõi và quản lý đơn hàng</p>
      </div>

      {/* Stats */}
      <div className="orders-stats">
        <div 
          className={`stat-box ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span className="icon">📋</span>
          <div className="info">
            <h3>{stats.all}</h3>
            <span>Tất cả</span>
          </div>
        </div>
        <div 
          className={`stat-box ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <span className="icon">⏳</span>
          <div className="info">
            <h3>{stats.pending}</h3>
            <span>Chờ xác nhận</span>
          </div>
        </div>
        <div 
          className={`stat-box ${filter === 'shipping' ? 'active' : ''}`}
          onClick={() => setFilter('shipping')}
        >
          <span className="icon">🚚</span>
          <div className="info">
            <h3>{stats.shipping}</h3>
            <span>Đang giao</span>
          </div>
        </div>
        <div 
          className={`stat-box ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          <span className="icon">🎉</span>
          <div className="info">
            <h3>{stats.delivered}</h3>
            <span>Đã giao</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="orders-content">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          {filters.map(f => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="count">
                ({f.key === 'all' ? orders.length : orders.filter(o => o.status === f.key).length})
              </span>
            </button>
          ))}
        </div>

        {/* Orders Grid */}
        <div className="orders-grid">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div className="order-card-wrapper" key={order._id}>
                <Link to={`/orders/${order._id}`} className="order-card">
                  {/* Status Ribbon */}
                  <div className={`status-ribbon ${order.status}`}>
                    {statusLabels[order.status]?.icon} {statusLabels[order.status]?.text}
                  </div>

                  <div className="order-card-body">
                    {/* Order Info */}
                    <div className="order-code">
                      Mã: <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                    </div>
                    <div className="order-date">
                      {formatDate(order.createdAt)}
                    </div>

                    {/* Product Preview */}
                    <div className="product-preview">
                      {order.items && order.items.length > 0 && (
                        <div className="product-single-preview">
                          <div className="product-thumb-main">
                            {getProductImage(order.items[0]) ? (
                              <img 
                                src={getProductImage(order.items[0])} 
                                alt={order.items[0].name}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="emoji">🌸</span>
                            )}
                          </div>
                          <div className="product-info-preview">
                            <div className="product-name-preview">{order.items[0].name}</div>
                            {order.items.length > 1 && (
                              <div className="more-products">+{order.items.length - 1} sản phẩm khác</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="order-card-footer">
                      <div className="footer-left">
                        <span className={`payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                          {order.paymentStatus === 'paid' ? '✓ Đã thanh toán' : '○ Chưa thanh toán'}
                        </span>
                        <span className="order-total">{formatPrice(order.total)}</span>
                      </div>
                      
                      {/* Cancel Button - Inside card */}
                      {(order.status === 'pending' || order.status === 'confirmed') && (
                        <button 
                          className="cancel-order-btn-inline"
                          onClick={(e) => {
                            e.preventDefault();
                            openCancelModal(order);
                          }}
                          title="Hủy đơn hàng"
                        >
                          <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-orders">
              <div className="icon">🛒</div>
              <h3>Chưa có đơn hàng nào</h3>
              <p>Hãy khám phá và đặt hàng những bó hoa tươi đẹp!</p>
              <Link to="/products" className="shop-btn">
                🌸 Mua sắm ngay
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        orderId={selectedOrder?._id}
      />

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

export default Orders;
