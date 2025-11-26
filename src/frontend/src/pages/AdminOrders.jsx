import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'

export default function AdminOrders(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')

  const load = async ()=>{
    setLoading(true)
    try{ const res = await api.get('/orders'); setOrders(res.data) }catch(e){ }
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  const updateStatus = async (id, status) => {
    try{ await api.put('/orders/'+id+'/status', { status }); load() }catch(e){ alert('Cập nhật lỗi') }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Chờ xử lý', class: 'status-pending' },
      processing: { label: 'Đang xử lý', class: 'status-processing' },
      completed: { label: 'Hoàn thành', class: 'status-completed' },
      cancelled: { label: 'Đã hủy', class: 'status-cancelled' }
    }
    const badge = badges[status] || badges.pending
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>
  }

  // Filter and sort orders
  const filteredOrders = orders
    .filter(o => {
      const matchSearch = o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o._id?.includes(searchTerm)
      const matchStatus = !filterStatus || o.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt)
        case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt)
        case 'total-desc': return (b.total || 0) - (a.total || 0)
        case 'total-asc': return (a.total || 0) - (b.total || 0)
        default: return 0
      }
    })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🛒 Quản lý Đơn hàng</h1>
          <p className="admin-page-desc">Theo dõi và xử lý các đơn hàng từ khách hàng</p>
        </div>
      </div>

      {!loading && orders.length > 0 && (
        <>
          {/* Stats Row */}
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Tổng đơn</div>
                <div className="stat-value">{orders.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <div className="stat-label">Chờ xử lý</div>
                <div className="stat-value">{statusCounts.pending}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-label">Hoàn thành</div>
                <div className="stat-value">{statusCounts.completed}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Doanh thu</div>
                <div className="stat-value">{(totalRevenue / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="filter-search">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Tìm theo tên, email, hoặc mã đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label-inline">Trạng thái:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                <option value="">Tất cả ({statusCounts.all})</option>
                <option value="pending">Chờ xử lý ({statusCounts.pending})</option>
                <option value="processing">Đang xử lý ({statusCounts.processing})</option>
                <option value="completed">Hoàn thành ({statusCounts.completed})</option>
                <option value="cancelled">Đã hủy ({statusCounts.cancelled})</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label-inline">Sắp xếp:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="date-desc">Mới nhất</option>
                <option value="date-asc">Cũ nhất</option>
                <option value="total-desc">Giá trị: Cao → Thấp</option>
                <option value="total-asc">Giá trị: Thấp → Cao</option>
              </select>
            </div>
          </div>

          <div className="admin-results-info">
            <span>Hiển thị <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng</span>
          </div>
        </>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải đơn hàng...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">🛒</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Các đơn hàng từ khách sẽ hiển thị ở đây</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">🔍</div>
          <h3>Không tìm thấy đơn hàng</h3>
          <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map(o => (
            <div key={o._id} className="admin-order-card">
              <div className="admin-order-header">
                <div>
                  <div className="admin-order-id">#{o._id.slice(-8)}</div>
                  <div className="admin-order-date">{new Date(o.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                {getStatusBadge(o.status)}
              </div>

              <div className="admin-order-customer">
                <div className="customer-icon">👤</div>
                <div>
                  <div className="customer-name">{o.customerName}</div>
                  <div className="customer-email">{o.customerEmail}</div>
                  <div className="customer-phone">{o.customerPhone || 'N/A'}</div>
                </div>
              </div>

              <div className="admin-order-items">
                <div className="order-items-title">Sản phẩm:</div>
                <ul className="order-items-list">
                  {(o.items||[]).map(it=> (
                    <li key={it._id}>
                      <span className="item-name">{it.name}</span>
                      <span className="item-qty">x{it.quantity}</span>
                      <span className="item-price">{(it.price * it.quantity).toLocaleString()} đ</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="admin-order-footer">
                <div className="admin-order-total">
                  Tổng cộng: <strong>{o.total?.toLocaleString()} đ</strong>
                </div>
                <div className="admin-order-actions">
                  {o.status === 'pending' && (
                    <>
                      <button onClick={()=>updateStatus(o._id,'processing')} className="btn btn-secondary">
                        ⚙️ Xử lý
                      </button>
                      <button onClick={()=>updateStatus(o._id,'completed')} className="btn btn-primary">
                        ✅ Hoàn thành
                      </button>
                    </>
                  )}
                  {o.status === 'processing' && (
                    <button onClick={()=>updateStatus(o._id,'completed')} className="btn btn-primary">
                      ✅ Hoàn thành
                    </button>
                  )}
                  {o.status !== 'cancelled' && (
                    <button onClick={()=>updateStatus(o._id,'cancelled')} className="btn btn-danger">
                      ❌ Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
