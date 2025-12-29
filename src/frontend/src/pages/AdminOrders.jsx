

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import Toast from '../components/Toast'
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
  const [updatingPayment, setUpdatingPayment] = useState(null)
  const [expandedProducts, setExpandedProducts] = useState({})
  const [expandedProductsInTable, setExpandedProductsInTable] = useState({})
  const [toast, setToast] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const paymentStatusLabels = {
    pending: 'Chưa thanh toán',
    paid: 'Đã thanh toán',
    failed: 'Thất bại'
  }

  const paymentMethodLabels = {
    cod: 'COD',
    qr: 'QR',
    zalopay: 'ZaloPay'
  }

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
      // Tự động cập nhật trạng thái thanh toán thành 'đã thanh toán' khi đơn hàng hoàn thành
      if (status === 'delivered') {
        await api.put('/orders/' + id + '/payment-status', { paymentStatus: 'paid' })
      }
      load()
      showToast('Cập nhật trạng thái thành công', 'success')
    } catch (e) {
      showToast('Cập nhật trạng thái thất bại', 'error')
    }
    setUpdatingStatus(null)
  }

  const updatePaymentStatus = async (id, paymentStatus) => {
    setUpdatingPayment(id)
    try {
      await api.put('/orders/' + id + '/payment-status', { paymentStatus })
      load()
      showToast('Cập nhật thanh toán thành công', 'success')
    } catch (e) {
      showToast('Cập nhật thanh toán thất bại', 'error')
    }
    setUpdatingPayment(null)
  }

  const deleteOrder = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return
    try {
      await api.delete('/orders/' + id)
      setExpandedRow(null)
      load()
      showToast('Xóa đơn hàng thành công', 'success')
    } catch (e) {
      showToast('Xóa đơn hàng thất bại', 'error')
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

  const getProductName = (item) => {
    if (item.name) return item.name
    if (item.product?.name) return item.product.name
    return 'Sản phẩm'
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

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, sortBy])

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
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #6b8e23 0%, #556b2f 100%)'}}>
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
            <div className="ao-stat-icon" style={{background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)'}}>
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

        {/* Todo Alerts - Việc cần làm */}
        {(stats.pending > 0 || stats.processing > 0) && (
          <div className="ao-todo-alerts">
            <div className="ao-todo-title">
              <span className="ao-todo-icon">📋</span>
              <span>Việc cần làm hôm nay</span>
              <span className="ao-todo-count">{stats.pending + stats.processing}</span>
            </div>
            <div className="ao-todo-grid">
              {stats.pending > 0 && (
                <div className="ao-todo-item ao-todo-urgent" onClick={() => setFilterStatus('pending')}>
                  <span className="ao-todo-item-icon">⏰</span>
                  <div className="ao-todo-item-content">
                    <strong>{stats.pending} đơn chờ xác nhận</strong>
                    <span>Cần xác nhận ngay để khách không chờ lâu</span>
                  </div>
                  <span className="ao-todo-arrow">→</span>
                </div>
              )}
              {orders.filter(o => o.status === 'confirmed').length > 0 && (
                <div className="ao-todo-item ao-todo-warning" onClick={() => setFilterStatus('confirmed')}>
                  <span className="ao-todo-item-icon">📦</span>
                  <div className="ao-todo-item-content">
                    <strong>{orders.filter(o => o.status === 'confirmed').length} đơn cần chuẩn bị</strong>
                    <span>Đã xác nhận, cần đóng gói hàng</span>
                  </div>
                  <span className="ao-todo-arrow">→</span>
                </div>
              )}
              {orders.filter(o => o.status === 'preparing').length > 0 && (
                <div className="ao-todo-item ao-todo-info" onClick={() => setFilterStatus('preparing')}>
                  <span className="ao-todo-item-icon">🚚</span>
                  <div className="ao-todo-item-content">
                    <strong>{orders.filter(o => o.status === 'preparing').length} đơn sẵn sàng giao</strong>
                    <span>Đã đóng gói, chờ giao cho shipper</span>
                  </div>
                  <span className="ao-todo-arrow">→</span>
                </div>
              )}
              {orders.filter(o => o.status === 'shipping').length > 0 && (
                <div className="ao-todo-item ao-todo-shipping" onClick={() => setFilterStatus('shipping')}>
                  <span className="ao-todo-item-icon">📍</span>
                  <div className="ao-todo-item-content">
                    <strong>{orders.filter(o => o.status === 'shipping').length} đơn đang giao</strong>
                    <span>Theo dõi và cập nhật khi giao thành công</span>
                  </div>
                  <span className="ao-todo-arrow">→</span>
                </div>
              )}
            </div>
          </div>
        )}

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
          <>
          <div className="ao-table-info">
            <span>Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} / {filteredOrders.length} đơn hàng</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="ao-select ao-select-small"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
          <div className="ao-table-wrapper">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khách hàng</th>
                  <th>Thời gian</th>
                  <th>Tổng tiền</th>
                  <th>TT Đơn hàng</th>
                  <th>TT Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <React.Fragment key={order._id}>
                    <tr className={expandedRow === order._id ? 'expanded' : ''}>
                      <td>
                        <div className="order-code">#{order._id.slice(-8).toUpperCase()}</div>
                      </td>
                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar">
                            {order.user?.avatar ? (
                              <img src={`http://localhost:5000${order.user.avatar}`} alt={order.customerName || order.user?.name} />
                            ) : (
                              <div className="avatar-fallback">
                                {(order.customerName || order.user?.name || 'K')?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="customer-details">
                            <div className="customer-name">{order.customerName || order.user?.name || 'Khách hàng'}</div>
                            <div className="customer-phone">{order.phone || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="order-date">{formatDate(order.createdAt)}</div>
                      </td>
                      <td>
                        <div className="order-total">{formatPrice(order.total)}</div>
                      </td>
                      <td>
                        <select
                          className={`status-select status-${order.status}`}
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          disabled={updatingStatus?.startsWith(order._id) || order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          {Object.entries(statusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className={`payment-select payment-${order.paymentStatus || 'pending'}`}
                          value={order.paymentStatus || 'pending'}
                          onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                          disabled={updatingPayment === order._id}
                        >
                          {Object.entries(paymentStatusLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
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
                        <td colSpan="7">
                          <div className="expanded-content">
                            <div className="expanded-section">
                              <h4>Thông tin đơn hàng</h4>
                              <div className="detail-grid">
                                <div className="detail-item">
                                  <label>Email:</label>
                                  <span>{order.customerEmail || order.user?.email || 'N/A'}</span>
                                </div>
                                <div className="detail-item">
                                  <label>Phương thức thanh toán:</label>
                                  <span>{paymentMethodLabels[order.paymentMethod] || 'COD'}</span>
                                </div>
                                <div className="detail-item full-width">
                                  <label>Địa chỉ giao hàng:</label>
                                  <span>{order.address || 'N/A'}</span>
                                </div>
                                {order.notes && (
                                  <div className="detail-item full-width">
                                    <label>Ghi chú:</label>
                                    <span className="note-text">{order.notes}</span>
                                  </div>
                                )}
                                {order.status === 'cancelled' && order.cancelReason && (
                                  <div className="detail-item full-width cancel-reason-item">
                                    <label>❌ Lý do hủy:</label>
                                    <span className="cancel-reason-text">{order.cancelReason}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="expanded-section">
                              <h4>Danh sách sản phẩm</h4>
                              <div className="products-list">
                                {(order.items || [])
                                  .slice(0, expandedProducts[order._id] ? order.items.length : 3)
                                  .map((item, idx) => (
                                  <div key={idx} className="product-row">
                                    <a 
                                      href={`/product/${item.product?.slug || item.product?._id || item.product}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{textDecoration: 'none'}}
                                    >
                                      <img
                                        src={getProductImage(item)}
                                        alt={getProductName(item)}
                                        onError={(e) => { e.target.src = '/placeholder.png' }}
                                      />
                                    </a>
                                    <div className="product-info">
                                      <a 
                                        href={`/product/${item.product?.slug || item.product?._id || item.product}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="product-name"
                                        style={{textDecoration: 'none', color: 'inherit'}}
                                      >
                                        {getProductName(item)}
                                      </a>
                                      <div className="product-price">
                                        {formatPrice(item.price || item.product?.price)} × {item.quantity}
                                      </div>
                                    </div>
                                    <div className="product-subtotal">
                                      {formatPrice((item.price || item.product?.price || 0) * item.quantity)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {(order.items?.length || 0) > 3 && (
                                <button
                                  className="toggle-products-btn-admin"
                                  onClick={() => setExpandedProducts(prev => ({
                                    ...prev,
                                    [order._id]: !prev[order._id]
                                  }))}
                                >
                                  {expandedProducts[order._id] ? (
                                    <>
                                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="18 15 12 9 6 15"/>
                                      </svg>
                                      Thu gọn
                                    </>
                                  ) : (
                                    <>
                                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="6 9 12 15 18 9"/>
                                      </svg>
                                      Xem thêm {(order.items?.length || 0) - 3} sản phẩm
                                    </>
                                  )}
                                </button>
                              )}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="ao-pagination">
              <button 
                className="ao-page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              
              <div className="ao-page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="ao-page-dots">...</span>}
                      <button
                        className={`ao-page-num ${currentPage === p ? 'active' : ''}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              
              <button 
                className="ao-page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
          </>
        )}
      </div>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AdminLayout>
  )
}
