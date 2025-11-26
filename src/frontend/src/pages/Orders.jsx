import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [user])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/orders/my-orders')
      setOrders(res.data)
    } catch (err) {
      setError('Không thể tải danh sách đơn hàng')
      console.error('Load orders error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    const iconMap = {
      pending: '⏳',
      confirmed: '✓',
      shipping: '🚚',
      delivered: '✓',
      cancelled: '✗'
    }
    return iconMap[status] || '📦'
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      delivered: 'Đã giao',
      cancelled: 'Đã hủy'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      shipping: 'status-shipping',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    }
    return classMap[status] || ''
  }

  const getOrderStats = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipping: orders.filter(o => o.status === 'shipping').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    }
  }

  const getFilteredOrders = () => {
    if (filterStatus === 'all') return orders
    return orders.filter(o => o.status === filterStatus)
  }

  const getOrderProgress = (status) => {
    const progressMap = {
      pending: 25,
      confirmed: 50,
      shipping: 75,
      delivered: 100,
      cancelled: 0
    }
    return progressMap[status] || 0
  }

  if (loading) {
    return (
      <div className="container">
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải đơn hàng...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  const stats = getOrderStats()
  const filteredOrders = getFilteredOrders()

  return (
    <div className="container">
      <div className="page-header">
        <h1>Đơn hàng của tôi</h1>
        <p>Theo dõi trạng thái đơn hàng của bạn</p>
      </div>

      {orders.length > 0 && (
        <div className="order-stats-grid">
          <div className="stat-card" onClick={() => setFilterStatus('all')} data-active={filterStatus === 'all'}>
            <div className="stat-icon">📦</div>
            <div className="stat-value">{stats.all}</div>
            <div className="stat-label">Tất cả</div>
          </div>
          <div className="stat-card" onClick={() => setFilterStatus('pending')} data-active={filterStatus === 'pending'}>
            <div className="stat-icon">⏳</div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Chờ xác nhận</div>
          </div>
          <div className="stat-card" onClick={() => setFilterStatus('confirmed')} data-active={filterStatus === 'confirmed'}>
            <div className="stat-icon">✓</div>
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">Đã xác nhận</div>
          </div>
          <div className="stat-card" onClick={() => setFilterStatus('shipping')} data-active={filterStatus === 'shipping'}>
            <div className="stat-icon">🚚</div>
            <div className="stat-value">{stats.shipping}</div>
            <div className="stat-label">Đang giao</div>
          </div>
          <div className="stat-card" onClick={() => setFilterStatus('delivered')} data-active={filterStatus === 'delivered'}>
            <div className="stat-icon">✓</div>
            <div className="stat-value">{stats.delivered}</div>
            <div className="stat-label">Đã giao</div>
          </div>
          <div className="stat-card" onClick={() => setFilterStatus('cancelled')} data-active={filterStatus === 'cancelled'}>
            <div className="stat-icon">✗</div>
            <div className="stat-value">{stats.cancelled}</div>
            <div className="stat-label">Đã hủy</div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📦</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa đặt đơn hàng nào. Hãy bắt đầu mua sắm!</p>
          <a href="/shop" className="btn-primary">Mua sắm ngay</a>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">🔍</div>
              <h3>Không tìm thấy đơn hàng</h3>
              <p>Không có đơn hàng nào với trạng thái này</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <div className="order-id">
                      <span className="order-icon">{getStatusIcon(order.status)}</span>
                      Đơn hàng #{order._id.slice(-8)}
                    </div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="order-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getOrderProgress(order.status)}%` }}
                      data-status={order.status}
                    ></div>
                  </div>
                  <div className="progress-steps">
                    <div className={`progress-step ${['pending', 'confirmed', 'shipping', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                      <div className="step-dot">⏳</div>
                      <div className="step-label">Chờ xác nhận</div>
                    </div>
                    <div className={`progress-step ${['confirmed', 'shipping', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                      <div className="step-dot">✓</div>
                      <div className="step-label">Đã xác nhận</div>
                    </div>
                    <div className={`progress-step ${['shipping', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                      <div className="step-dot">🚚</div>
                      <div className="step-label">Đang giao</div>
                    </div>
                    <div className={`progress-step ${order.status === 'delivered' ? 'active' : ''}`}>
                      <div className="step-dot">✓</div>
                      <div className="step-label">Đã giao</div>
                    </div>
                  </div>
                </div>

              <div className="order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-image">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} />
                      ) : (
                        <div className="placeholder">🌸</div>
                      )}
                    </div>
                    <div className="order-item-info">
                      <div className="order-item-name">{item.product?.name || 'Sản phẩm đã xóa'}</div>
                      <div className="order-item-quantity">Số lượng: {item.quantity}</div>
                    </div>
                    <div className="order-item-price">
                      {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="order-address">
                  <strong>Địa chỉ giao hàng:</strong>
                  <div>{order.address}</div>
                  <div>SĐT: {order.phone}</div>
                </div>
                <div className="order-total">
                  <span>Tổng tiền:</span>
                  <strong>{order.total.toLocaleString('vi-VN')} ₫</strong>
                </div>
              </div>

              {order.notes && (
                <div className="order-notes">
                  <strong>Ghi chú:</strong> {order.notes}
                </div>
              )}
            </div>
          ))
          )}
        </div>
      )}
    </div>
  )
}
