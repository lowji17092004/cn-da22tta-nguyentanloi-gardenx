import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import './AdminOrders.css'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusNote, setStatusNote] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(null)

  const statusLabels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    shipping: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }

  const statusFlow = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered']

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders')
      setOrders(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status, note = '') => {
    setUpdatingStatus(id + '-' + status)
    try {
      await api.put('/orders/' + id + '/status', { status, note })
      setStatusNote('')
      const res = await api.get('/orders')
      setOrders(res.data)
      const updated = res.data.find(o => o._id === id)
      if (updated) setSelectedOrder(updated)
    } catch (e) {
      alert('Cập nhật lỗi')
    }
    setUpdatingStatus(null)
  }

  const deleteOrder = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      await api.delete('/orders/' + id)
      setSelectedOrder(null)
      load()
    } catch (e) {
      alert('Xóa đơn hàng thất bại')
    }
  }

  const getNextStatus = (currentStatus) => {
    const idx = statusFlow.indexOf(currentStatus)
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null
  }

  const getProductImage = (item) => {
    // Ưu tiên lấy ảnh đã lưu trực tiếp trong item
    if (item.image) return `http://localhost:5000${item.image}`
    // Fallback: lấy từ product nếu có
    if (item.product?.image) return `http://localhost:5000${item.product.image}`
    if (item.product?.images && item.product.images.length > 0) {
      return `http://localhost:5000${item.product.images[0]}`
    }
    return '/placeholder.png'
  }

  const filteredOrders = orders
    .filter(o => {
      const search = searchTerm.toLowerCase()
      const matchSearch = !search ||
        o._id?.toLowerCase().includes(search) ||
        o.customerName?.toLowerCase().includes(search) ||
        o.phone?.includes(searchTerm) ||
        o.address?.toLowerCase().includes(search) ||
        o.user?.name?.toLowerCase().includes(search) ||
        o.items?.some(item => (item.product?.name || item.name)?.toLowerCase().includes(search))
      return matchSearch && (!filterStatus || o.status === filterStatus)
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt)
        case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt)
        case 'total-desc': return (b.total || 0) - (a.total || 0)
        case 'total-asc': return (a.total || 0) - (b.total || 0)
        default: return 0
      }
    })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => ['confirmed', 'preparing', 'shipping'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0)
  }

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0) + 'đ'
  const formatDate = (d) => new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <AdminLayout>
      <div className="admin-orders-page">
        {/* Header */}
        <div className="ao-header">
          <h1>Quản lý Đơn hàng</h1>
          <p>Xử lý và theo dõi tất cả đơn hàng từ khách hàng</p>
        </div>

        {/* Stats Cards */}
        <div className="ao-stats">
          <div className="ao-stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Tổng đơn hàng</div>
          </div>
          <div className="ao-stat-card">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Chờ xử lý</div>
          </div>
          <div className="ao-stat-card">
            <div className="stat-number">{stats.processing}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
          <div className="ao-stat-card">
            <div className="stat-number">{stats.delivered}</div>
            <div className="stat-label">Hoàn thành</div>
          </div>
          <div className="ao-stat-card">
            <div className="stat-number">{stats.cancelled}</div>
            <div className="stat-label">Đã hủy</div>
          </div>
          <div className="ao-stat-card revenue">
            <div className="stat-number">{(stats.revenue / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Doanh thu</div>
          </div>
        </div>

        {/* Filters */}
        <div className="ao-filters">
          <div className="ao-search">
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên khách, SĐT, sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ao-filter-group">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="ao-select"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="ao-select"
            >
              <option value="date-desc">Mới nhất trước</option>
              <option value="date-asc">Cũ nhất trước</option>
              <option value="total-desc">Giá cao - thấp</option>
              <option value="total-asc">Giá thấp - cao</option>
            </select>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="ao-tabs">
          <button 
            className={`ao-tab ${!filterStatus ? 'active' : ''}`} 
            onClick={() => setFilterStatus('')}
          >
            Tất cả <span className="tab-count">{orders.length}</span>
          </button>
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              className={`ao-tab ${filterStatus === key ? 'active' : ''} status-${key}`}
              onClick={() => setFilterStatus(key)}
            >
              {label} <span className="tab-count">{orders.filter(o => o.status === key).length}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="ao-main">
          {/* Orders List */}
          <div className="ao-list-section">
            {loading ? (
              <div className="ao-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="ao-empty">
                <div className="empty-icon">!</div>
                <h3>Không tìm thấy đơn hàng</h3>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              <div className="ao-orders-list">
                {filteredOrders.map(order => (
                  <div
                    key={order._id}
                    className={`ao-order-card ${selectedOrder?._id === order._id ? 'selected' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="order-card-header">
                      <span className="order-code">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className={`order-status status-${order.status}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    
                    <div className="order-card-customer">
                      <strong>{order.customerName || order.user?.name || 'Khách hàng'}</strong>
                      <span>{order.phone || 'Chưa có SĐT'}</span>
                    </div>

                    <div className="order-card-products">
                      <div className="product-images">
                        {(order.items || []).slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={getProductImage(item)}
                            alt=""
                            onError={(e) => { e.target.src = '/placeholder.png' }}
                          />
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <span className="more-count">+{order.items.length - 3}</span>
                        )}
                      </div>
                      <span className="item-count">{order.items?.length || 0} sản phẩm</span>
                    </div>

                    <div className="order-card-footer">
                      <span className="order-total">{formatPrice(order.total)}</span>
                      <span className="order-date">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selectedOrder && (
            <div className="ao-detail-panel">
              <div className="detail-header">
                <div>
                  <h2>#{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                  <span className={`detail-status status-${selectedOrder.status}`}>
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}>×</button>
              </div>

              <div className="detail-content">
                {/* Customer Info */}
                <div className="detail-section">
                  <h3>Thông tin khách hàng</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Họ tên</label>
                      <span>{selectedOrder.customerName || selectedOrder.user?.name || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Số điện thoại</label>
                      <span>{selectedOrder.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <span>{selectedOrder.customerEmail || selectedOrder.user?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item full-width">
                      <label>Địa chỉ giao hàng</label>
                      <span>{selectedOrder.address || 'N/A'}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="info-item full-width">
                        <label>Ghi chú</label>
                        <span className="note-text">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="detail-section">
                  <h3>Danh sách sản phẩm ({selectedOrder.items?.length || 0})</h3>
                  <div className="products-list">
                    {(selectedOrder.items || []).map((item, idx) => (
                      <div key={idx} className="product-item">
                        <img
                          src={getProductImage(item)}
                          alt=""
                          onError={(e) => { e.target.src = '/placeholder.png' }}
                        />
                        <div className="product-details">
                          <strong>{item.product?.name || item.name || 'Sản phẩm'}</strong>
                          <span className="product-price">
                            {formatPrice(item.product?.price || item.price)} × {item.quantity}
                          </span>
                        </div>
                        <div className="product-subtotal">
                          {formatPrice((item.product?.price || item.price || 0) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-total-summary">
                    <span>Tổng cộng</span>
                    <strong>{formatPrice(selectedOrder.total)}</strong>
                  </div>
                </div>

                {/* Status History */}
                {selectedOrder.statusHistory?.length > 0 && (
                  <div className="detail-section">
                    <h3>Lịch sử trạng thái</h3>
                    <div className="status-timeline">
                      {selectedOrder.statusHistory.map((h, idx) => (
                        <div key={idx} className={`timeline-item status-${h.status}`}>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <strong>{statusLabels[h.status]}</strong>
                            <span className="timeline-date">{formatDate(h.updatedAt)}</span>
                            {h.note && <p className="timeline-note">{h.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <div className="detail-section actions-section">
                    <h3>Cập nhật trạng thái</h3>
                    <div className="action-form">
                      <input
                        type="text"
                        placeholder="Ghi chú cập nhật (không bắt buộc)..."
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                      />
                      <div className="action-buttons">
                        {getNextStatus(selectedOrder.status) && (
                          <button
                            className="btn-primary"
                            onClick={() => updateStatus(selectedOrder._id, getNextStatus(selectedOrder.status), statusNote)}
                            disabled={updatingStatus}
                          >
                            {updatingStatus ? 'Đang xử lý...' : `Chuyển sang: ${statusLabels[getNextStatus(selectedOrder.status)]}`}
                          </button>
                        )}
                        <button
                          className="btn-danger"
                          onClick={() => updateStatus(selectedOrder._id, 'cancelled', statusNote || 'Hủy bởi admin')}
                          disabled={updatingStatus}
                        >
                          Hủy đơn hàng
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete */}
                <div className="detail-section delete-section">
                  <button 
                    className="btn-delete-order"
                    onClick={() => deleteOrder(selectedOrder._id)}
                  >
                    Xóa đơn hàng này
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
