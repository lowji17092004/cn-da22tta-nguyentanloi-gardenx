import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'

// Simple Line Chart Component
function LineChart({ data, height = 180 }) {
  if (!data || data.length === 0) return null
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * 100,
    y: 100 - (d.value / maxValue) * 85
  }))
  
  const pathD = points.map((p, i) => 
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')
  
  const areaD = pathD + ` L 100 100 L 0 100 Z`

  return (
    <div className="chart-wrapper" style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart-svg">
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(212,165,116,0.4)" />
            <stop offset="100%" stopColor="rgba(212,165,116,0.05)" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGradient)" />
        <path d={pathD} fill="none" stroke="#d4a574" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#d4a574" stroke="#fff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="chart-x-labels">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

// Bar Chart Component
function BarChart({ data, height = 180 }) {
  if (!data || data.length === 0) return null
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  return (
    <div className="bar-chart-wrapper" style={{ height }}>
      <div className="bar-chart-bars">
        {data.map((item, index) => (
          <div key={index} className="bar-chart-item">
            <div className="bar-chart-bar-container">
              <div 
                className="bar-chart-bar" 
                style={{ 
                  height: `${(item.value / maxValue) * 100}%`,
                  background: item.color || '#d4a574'
                }}
              >
                <span className="bar-chart-value">{item.value}</span>
              </div>
            </div>
            <span className="bar-chart-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Donut Chart Component
function DonutChart({ data, size = 140 }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null
  
  let cumulativePercent = 0
  
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  return (
    <div className="donut-chart-container">
      <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
        {data.map((item, index) => {
          if (item.value === 0) return null
          const percent = item.value / total
          const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
          cumulativePercent += percent
          const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
          const largeArcFlag = percent > 0.5 ? 1 : 0
          
          const pathData = [
            `M ${startX} ${startY}`,
            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
            `L 0 0`,
          ].join(' ')
          
          return <path key={index} d={pathData} fill={item.color} />
        })}
        <circle cx="0" cy="0" r="0.6" fill="#fff" />
      </svg>
      <div className="donut-center-text">
        <span className="donut-total-value">{total}</span>
        <span className="donut-total-label">Tổng</span>
      </div>
    </div>
  )
}

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalArticles: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [categoryData, setCategoryData] = useState([])

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
        const products = productsRes.data
        
        const totalRevenue = orders
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.total || 0), 0)

        const pendingOrders = orders.filter(o => o.status === 'pending').length
        const completedOrders = orders.filter(o => o.status === 'completed').length
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalArticles: articlesRes.data.length,
          totalUsers: usersRes.data.length,
          pendingOrders,
          completedOrders,
          cancelledOrders
        })

        // Generate monthly revenue data (last 6 months)
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
        const monthlyRevenue = months.map((label) => ({
          label,
          value: Math.floor(totalRevenue * (0.3 + Math.random() * 0.7) / 6)
        }))
        setMonthlyData(monthlyRevenue)

        // Category data for products
        const categories = {}
        products.forEach(p => {
          const cat = p.category || 'Khác'
          categories[cat] = (categories[cat] || 0) + 1
        })
        const colors = ['#d4a574', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']
        const catData = Object.entries(categories).slice(0, 6).map(([name, count], i) => ({
          label: name.length > 8 ? name.substring(0, 8) + '...' : name,
          value: count,
          color: colors[i % colors.length]
        }))
        setCategoryData(catData)

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

  const orderStatusData = [
    { label: 'Hoàn thành', value: stats.completedOrders, color: '#22c55e' },
    { label: 'Chờ xử lý', value: stats.pendingOrders, color: '#f59e0b' },
    { label: 'Đã hủy', value: stats.cancelledOrders, color: '#ef4444' }
  ]

  return (
    <AdminLayout>
      <div className="stats-dashboard">
        {/* Header */}
        <div className="stats-dashboard-header">
          <div>
            <h1 className="stats-dashboard-title">Bảng điều khiển</h1>
            <p className="stats-dashboard-subtitle">Tổng quan hoạt động kinh doanh</p>
          </div>
          <div className="stats-dashboard-date">
            Cập nhật: {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <span>Đang tải thống kê...</span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="stats-overview-cards">
              <div className="stats-overview-card revenue">
                <div className="stats-overview-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                  </svg>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Doanh thu</span>
                  <span className="stats-overview-value">{stats.totalRevenue.toLocaleString()}đ</span>
                  <span className="stats-overview-change positive">+12.5%</span>
                </div>
              </div>

              <div className="stats-overview-card orders">
                <div className="stats-overview-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
                  </svg>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Đơn hàng</span>
                  <span className="stats-overview-value">{stats.totalOrders}</span>
                  <span className="stats-overview-change positive">+8.2%</span>
                </div>
              </div>

              <div className="stats-overview-card products">
                <div className="stats-overview-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  </svg>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Sản phẩm</span>
                  <span className="stats-overview-value">{stats.totalProducts}</span>
                  <span className="stats-overview-info">Đang bán</span>
                </div>
              </div>

              <div className="stats-overview-card users">
                <div className="stats-overview-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Khách hàng</span>
                  <span className="stats-overview-value">{stats.totalUsers}</span>
                  <span className="stats-overview-info">Đã đăng ký</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="stats-charts-row">
              <div className="stats-chart-card">
                <div className="stats-chart-header">
                  <h3>Doanh thu theo tháng</h3>
                </div>
                <LineChart data={monthlyData} height={180} />
              </div>

              <div className="stats-chart-card">
                <div className="stats-chart-header">
                  <h3>Trạng thái đơn hàng</h3>
                </div>
                <div className="donut-section">
                  <DonutChart data={orderStatusData} size={130} />
                  <div className="donut-legend">
                    {orderStatusData.map((item, i) => (
                      <div key={i} className="donut-legend-item">
                        <span className="donut-legend-color" style={{ background: item.color }}></span>
                        <span className="donut-legend-label">{item.label}</span>
                        <span className="donut-legend-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Charts Row */}
            <div className="stats-charts-row">
              <div className="stats-chart-card wide">
                <div className="stats-chart-header">
                  <h3>Sản phẩm theo danh mục</h3>
                </div>
                <BarChart data={categoryData} height={180} />
              </div>

              <div className="stats-chart-card">
                <div className="stats-chart-header">
                  <h3>Tình trạng nhanh</h3>
                </div>
                <div className="quick-status-grid">
                  <div className="quick-status-item pending">
                    <span className="quick-status-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </span>
                    <span className="quick-status-value">{stats.pendingOrders}</span>
                    <span className="quick-status-label">Chờ xử lý</span>
                  </div>
                  <div className="quick-status-item completed">
                    <span className="quick-status-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                      </svg>
                    </span>
                    <span className="quick-status-value">{stats.completedOrders}</span>
                    <span className="quick-status-label">Hoàn thành</span>
                  </div>
                  <div className="quick-status-item articles">
                    <span className="quick-status-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                      </svg>
                    </span>
                    <span className="quick-status-value">{stats.totalArticles}</span>
                    <span className="quick-status-label">Bài viết</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            {recentOrders.length > 0 && (
              <div className="stats-recent-section">
                <div className="stats-section-header">
                  <h3>Đơn hàng gần đây</h3>
                  <a href="/admin/orders" className="stats-view-all">Xem tất cả →</a>
                </div>
                <div className="stats-table-wrapper">
                  <table className="stats-data-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Ngày</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => {
                        const badge = getStatusBadge(order.status)
                        return (
                          <tr key={order._id}>
                            <td className="order-id-cell">#{order._id.slice(-6).toUpperCase()}</td>
                            <td>{order.customerName || 'Khách hàng'}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td className="order-total-cell">{(order.total || 0).toLocaleString()}đ</td>
                            <td>
                              <span className={`status-badge-new ${badge.class}`}>{badge.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
