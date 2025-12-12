

import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import { matchesSearchTerm } from '../utils/searchUtils'
import './AdminOrders.css'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')
  const [expandedRow, setExpandedRow] = useState(null)
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

  const updateStatus = async (id, status) => {
    setUpdatingStatus(id + '-' + status)
    try {
      await api.put('/orders/' + id + '/status', { status })
      load()
    } catch (e) {
      alert('Cập nhật lỗi')
    }
    setUpdatingStatus(null)
  }

  const deleteOrder = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      await api.delete('/orders/' + id)
      setExpandedRow(null)
      load()
    } catch (e) {
      alert('Xóa đơn hàng thất bại')
    }
  }

  const getProductImage = (item) => {
    if (item.image) return `http://localhost:5000${item.image}`
    if (item.product?.image) return `http://localhost:5000${item.product.image}`
    if (item.product?.images && item.product.images.length > 0) {
      return `http://localhost:5000${item.product.images[0]}`
    }
    return '/placeholder.png'
  }

  const filteredOrders = orders
    .filter(o => {
      const matchSearch = !searchTerm ||
        matchesSearchTerm(o._id, searchTerm) ||
        matchesSearchTerm(o.customerName, searchTerm) ||
        matchesSearchTerm(o.phone, searchTerm) ||
        matchesSearchTerm(o.address, searchTerm) ||
        matchesSearchTerm(o.user?.name, searchTerm) ||
        o.items?.some(item => matchesSearchTerm(item.product?.name || item.name, searchTerm))
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

  const formatPrice = (p) => new Intl.NumberFormat('vi-VN').format(p || 0) + '₫'
  const formatDate = (d) => new Date(d).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <AdminLayout>
      <div className="admin-orders-page">
        {/* Hero Header */}
        <div className="ao-hero">
          <div className="ao-hero-content">
            <div className="ao-hero-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1>Quản lý Đơn hàng</h1>
              <p>Xử lý và theo dõi tất cả đơn hàng từ khách hàng</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="ao-stats">
          <div className="ao-stat-card">
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ao-stat-content">
              <div className="ao-stat-value">{stats.total}</div>
              <div className="ao-stat-label">Tổng đơn hàng</div>
            </div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ao-stat-content">
              <div className="ao-stat-value">{stats.pending}</div>
              <div className="ao-stat-label">Chờ xử lý</div>
            </div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="ao-stat-content">
              <div className="ao-stat-value">{stats.processing}</div>
              <div className="ao-stat-label">Đang xử lý</div>
            </div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ao-stat-content">
              <div className="ao-stat-value">{stats.delivered}</div>
              <div className="ao-stat-label">Hoàn thành</div>
            </div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ao-stat-content">
              <div className="ao-stat-value">{stats.cancelled}</div>
              <div className="ao-stat-label">Đã hủy</div>
            </div>
          </div>
          <div className="ao-stat-card">
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ao-stat-content">
              <div className="ao-stat-value">{(stats.revenue / 1000000).toFixed(1)}M</div>
              <div className="ao-stat-label">Doanh thu</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="ao-filters">
          <div className="ao-search">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
              <option value="">Tất cả trạng thái ({stats.total})</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({orders.filter(o => o.status === key).length})
                </option>
              ))}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="ao-select"
            >
              <option value="date-desc">Mới nhất trước</option>
              <option value="date-asc">Cũ nhất trước</option>
              <option value="total-desc">Giá cao → thấp</option>
              <option value="total-asc">Giá thấp → cao</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="ao-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="ao-empty">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>Không tìm thấy đơn hàng</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="ao-table-wrapper">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <React.Fragment key={order._id}>
                    <tr className={expandedRow === order._id ? 'expanded' : ''}>
                      <td>
                        <div className="order-code">#{order._id.slice(-8).toUpperCase()}</div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar">
                            {order.user?.avatar ? (
                              <img 
                                src={order.user.avatar.startsWith('http') ? order.user.avatar : `http://localhost:5000${order.user.avatar}`} 
                                alt="" 
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <span className="avatar-fallback" style={{ display: order.user?.avatar ? 'none' : 'flex' }}>
                              {(order.customerName || order.user?.name || 'K').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="customer-details">
                            <div className="customer-name">{order.customerName || order.user?.name || 'Khách hàng'}</div>
                            <div className="customer-phone">{order.phone || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="order-items">
                          <div className="item-images">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={getProductImage(item)}
                                alt=""
                                onError={(e) => { e.target.src = '/placeholder.png' }}
                              />
                            ))}
                          </div>
                          <span className="item-count">{order.items?.length || 0} sản phẩm</span>
                        </div>
                      </td>
                      <td>
                        <div className="order-total">{formatPrice(order.total)}</div>
                      </td>
                      <td>
                        <span className={`payment-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                          {order.isPaid ? (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Đã thanh toán
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Chưa thanh toán
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${order.status}`}
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          disabled={updatingStatus === order._id + '-' + order.status || order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="order-date">{formatDate(order.createdAt)}</div>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn view"
                            onClick={() => setExpandedRow(expandedRow === order._id ? null : order._id)}
                            title={expandedRow === order._id ? 'Thu gọn' : 'Xem chi tiết'}
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => setExpandedRow(expandedRow === order._id ? null : order._id)}
                            title="Chỉnh sửa"
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn delete"
                            onClick={() => deleteOrder(order._id)}
                            title="Xóa"
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === order._id && (
                      <tr className="expanded-row">
                        <td colSpan="8">
                          <div className="expanded-content">
                            <div className="expanded-section">
                              <h4>Chi tiết đơn hàng</h4>
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <label>Email:</label>
                                  <span>{order.customerEmail || order.user?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-item full-width">
                                  <label>Địa chỉ:</label>
                                  <span>{order.address || 'N/A'}</span>
                                </div>
                                {order.notes && (
                                  <div className="detail-item full-width">
                                    <label>Ghi chú:</label>
                                    <span className="note-text">{order.notes}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="expanded-section">
                              <h4>Danh sách sản phẩm</h4>
                              <div className="products-list">
                                {(order.items || []).map((item, idx) => (
                                  <div key={idx} className="product-row">
                                    <img
                                      src={getProductImage(item)}
                                      alt=""
                                      onError={(e) => { e.target.src = '/placeholder.png' }}
                                    />
                                    <div className="product-info">
                                      <div className="product-name">{item.product?.name || item.name || 'Sản phẩm'}</div>
                                      <div className="product-price">
                                        {formatPrice(item.product?.price || item.price)} × {item.quantity}
                                      </div>
                                    </div>
                                    <div className="product-subtotal">
                                      {formatPrice((item.product?.price || item.price || 0) * item.quantity)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="products-total">
                                <span>Tổng cộng:</span>
                                <strong>{formatPrice(order.total)}</strong>
                              </div>
                            </div>

                            {order.statusHistory?.length > 0 && (
                              <div className="expanded-section">
                                <h4>Lịch sử trạng thái</h4>
                                <div className="status-timeline">
                                  {order.statusHistory.map((h, idx) => (
                                    <div key={idx} className={`timeline-item status-${h.status}`}>
                                      <div className="timeline-dot"></div>
                                      <div className="timeline-content">
                                        <strong>{statusLabels[h.status]}</strong>
                                        <span>{formatDate(h.updatedAt)}</span>
                                        {h.note && <p>{h.note}</p>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
