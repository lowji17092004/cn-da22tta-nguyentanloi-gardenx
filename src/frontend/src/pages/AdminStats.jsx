import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalArticles: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [ordersRes, productsRes, articlesRes, usersRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/articles'),
          api.get('/users')
        ])

        const orders = ordersRes.data
        const totalRevenue = orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.total || 0), 0)

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: productsRes.data.length,
          totalArticles: articlesRes.data.length,
          totalUsers: usersRes.data.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          completedOrders: orders.filter(o => o.status === 'completed').length
        })

        // Get 5 most recent orders
        const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentOrders(sorted.slice(0, 5))
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Chờ xử lý', class: 'badge-warning' },
      processing: { label: 'Đang xử lý', class: 'badge-info' },
      completed: { label: 'Hoàn thành', class: 'badge-success' },
      cancelled: { label: 'Đã hủy', class: 'badge-danger' }
    }
    return badges[status] || { label: status, class: 'badge-default' }
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Thống kê tổng quan</h1>
          <p className="admin-page-desc">Báo cáo doanh thu và hoạt động kinh doanh</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải thống kê...</span>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-header">
                <span className="stat-label">Tổng doanh thu</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalRevenue.toLocaleString()} đ</div>
              <div className="stat-footer">
                <span className="stat-trend positive">+12.5%</span>
                <span className="stat-period">so với tháng trước</span>
              </div>
            </div>

            <div className="stat-card stat-success">
              <div className="stat-header">
                <span className="stat-label">Tổng đơn hàng</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalOrders}</div>
              <div className="stat-footer">
                <span className="stat-trend positive">+8.2%</span>
                <span className="stat-period">so với tháng trước</span>
              </div>
            </div>

            <div className="stat-card stat-info">
              <div className="stat-header">
                <span className="stat-label">Sản phẩm</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-footer">
                <span className="stat-info-text">Đang kinh doanh</span>
              </div>
            </div>

            <div className="stat-card stat-warning">
              <div className="stat-header">
                <span className="stat-label">Bài viết</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalArticles}</div>
              <div className="stat-footer">
                <span className="stat-info-text">Đã xuất bản</span>
              </div>
            </div>

            <div className="stat-card stat-secondary">
              <div className="stat-header">
                <span className="stat-label">Người dùng</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-footer">
                <span className="stat-info-text">Đã đăng ký</span>
              </div>
            </div>
          </div>

          <div className="stats-row-section">
            <h3 className="section-title">Trạng thái đơn hàng</h3>
            <div className="stats-row-cards">
              <div className="status-card pending">
                <div className="status-content">
                  <div className="status-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  </div>
                  <div className="status-details">
                    <div className="status-value">{stats.pendingOrders}</div>
                    <div className="status-label">Chờ xử lý</div>
                  </div>
                </div>
                <div className="status-footer">Cần xử lý ngay</div>
              </div>

              <div className="status-card completed">
                <div className="status-content">
                  <div className="status-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                      <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                  </div>
                  <div className="status-details">
                    <div className="status-value">{stats.completedOrders}</div>
                    <div className="status-label">Hoàn thành</div>
                  </div>
                </div>
                <div className="status-footer">Đã giao hàng</div>
              </div>

              <div className="status-card cancelled">
                <div className="status-content">
                  <div className="status-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M15 9l-6 6M9 9l6 6"/>
                    </svg>
                  </div>
                  <div className="status-details">
                    <div className="status-value">{stats.totalOrders - stats.pendingOrders - stats.completedOrders}</div>
                    <div className="status-label">Đã hủy</div>
                  </div>
                </div>
                <div className="status-footer">Hoặc khác</div>
              </div>
            </div>
          </div>

          {recentOrders.length > 0 && (
            <div className="recent-orders-section">
              <h3 className="section-title">Đơn hàng gần đây</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Ngày đặt</th>
                      <th className="text-right">Tổng tiền</th>
                      <th className="text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => {
                      const badge = getStatusBadge(order.status)
                      return (
                        <tr key={order._id}>
                          <td className="order-id">#{order._id.slice(-6).toUpperCase()}</td>
                          <td>{order.customerName || 'Khách hàng'}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td className="text-right font-semibold">{(order.total || 0).toLocaleString()} đ</td>
                          <td className="text-center">
                            <span className={`badge ${badge.class}`}>{badge.label}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="stats-info-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <div className="info-content">
              <h4>Gợi ý cải thiện</h4>
              <ul>
                <li>Tăng cường marketing để tăng số lượng đơn hàng</li>
                <li>Cập nhật thêm sản phẩm mới để thu hút khách hàng</li>
                <li>Viết thêm bài viết hữu ích về chăm sóc hoa</li>
                <li>Theo dõi đơn hàng chờ xử lý để phục vụ nhanh chóng</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
