import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import './AdminStats.css'

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

// Bar Chart Component with Enhanced Design
function BarChart({ data, height = 200 }) {
  if (!data || data.length === 0) return null
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  const creamGradients = [
    'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
  ]
  
  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '20px 0' }}>
      <div style={{ 
        minWidth: `${data.length * 100}px`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: height,
        gap: '20px',
        padding: '0 20px'
      }}>
        {data.map((item, index) => {
          const fullName = item.fullLabel || item.label
          return (
            <div 
              key={index} 
              style={{
                flex: '0 0 auto',
                width: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              title={`${fullName}: ${item.value} sản phẩm`}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'flex-end',
                minHeight: '100px'
              }}>
                <div 
                  style={{ 
                    width: '100%',
                    height: `${(item.value / maxValue) * 100}%`,
                    background: item.color || creamGradients[index % creamGradients.length],
                    borderRadius: '12px 12px 0 0',
                    boxShadow: '0 4px 16px rgba(212, 165, 116, 0.3)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '12px',
                    minHeight: '50px',
                    transformOrigin: 'bottom',
                    animation: 'barGrowth 0.6s ease-out'
                  }}
                >
                  <div className="bar-shimmer"></div>
                  <span style={{
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '15px',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    position: 'relative',
                    zIndex: 1
                  }}>{item.value}</span>
                </div>
              </div>
              <span style={{
                color: '#475569',
                fontSize: '12px',
                fontWeight: '600',
                marginTop: '12px',
                display: 'block',
                textAlign: 'center',
                lineHeight: '1.4',
                wordBreak: 'break-word',
                maxWidth: '80px'
              }}>{item.label}</span>
            </div>
          )
        })}
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
  const [timePeriod, setTimePeriod] = useState('month') // day, week, month, year
  const [revenueChartData, setRevenueChartData] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [recentArticles, setRecentArticles] = useState([])
  const [todayStats, setTodayStats] = useState({
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    articles: 0
  })

  // Calculate revenue by time period
  const calculateRevenueByPeriod = (orders, period) => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered')
    const now = new Date()
    let data = []

    if (period === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
        
        const dayRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.toDateString() === date.toDateString()
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        
        data.push({ label: dateStr, value: dayRevenue })
      }
    } else if (period === 'week') {
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        const weekLabel = `T${8 - i}`
        
        const weekRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate >= weekStart && orderDate <= weekEnd
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        
        data.push({ label: weekLabel, value: weekRevenue })
      }
    } else if (period === 'month') {
      const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        const monthIndex = date.getMonth()
        const year = date.getFullYear()
        
        const monthRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        
        data.push({ label: monthNames[monthIndex], value: monthRevenue })
      }
    } else if (period === 'year') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i
        
        const yearRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        
        data.push({ label: year.toString(), value: yearRevenue })
      }
    }

    setRevenueChartData(data)
  }

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
        
        // Chỉ tính doanh thu từ đơn hàng đã hoàn thành (delivered)
        const totalRevenue = orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + (o.total || 0), 0)

        const pendingOrders = orders.filter(o => o.status === 'pending').length
        const completedOrders = orders.filter(o => o.status === 'delivered').length
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

        // Store all orders for time-based filtering
        setAllOrders(orders)

        // Generate monthly revenue data (last 6 months)
        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
        const monthlyRevenue = months.map((label) => ({
          label,
          value: Math.floor(totalRevenue * (0.3 + Math.random() * 0.7) / 6)
        }))
        setMonthlyData(monthlyRevenue)

        // Calculate initial revenue chart data - will be done after allOrders is set
        const deliveredOrders = orders.filter(o => o.status === 'delivered')
        const now = new Date()
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
        let initialData = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          const monthIndex = date.getMonth()
          const year = date.getFullYear()
          
          const monthRevenue = deliveredOrders
            .filter(o => {
              const orderDate = new Date(o.createdAt)
              return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year
            })
            .reduce((sum, o) => sum + (o.total || 0), 0)
          
          initialData.push({ label: monthNames[monthIndex], value: monthRevenue })
        }
        setRevenueChartData(initialData)

        // Category data for products - Get MAIN categories only from API
        let mainCategories = []
        try {
          const categoriesRes = await api.get('/categories?type=product')
          mainCategories = categoriesRes.data || []
        } catch (error) {
          console.error('Error loading categories:', error)
        }
        
        // Count products by MAIN category only (not subcategories)
        const categories = {}
        products.forEach(p => {
          // Find the main category that matches this product's category
          const mainCat = mainCategories.find(cat => 
            cat.slug === p.category || 
            cat._id === p.category ||
            cat.subcategories?.some(sub => sub.slug === p.category || sub._id === p.category)
          )
          const catName = mainCat?.name || 'Khác'
          categories[catName] = (categories[catName] || 0) + 1
        })
        
        const colors = [
          'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)',
          'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
          'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
          'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'
        ]
        
        const catData = Object.entries(categories)
          .sort((a, b) => b[1] - a[1]) // Sort by count descending
          .slice(0, 8) // Get top 8 categories
          .map(([name, count], i) => ({
            label: name.length > 15 ? name.substring(0, 15) + '...' : name,
            fullLabel: name,
            value: count,
            color: colors[i % colors.length]
          }))
        setCategoryData(catData)

        // Get 5 most recent orders
        const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentOrders(sorted.slice(0, 5))

        // Get top selling products (based on featured/bestseller or just first 5)
        const topProds = products
          .filter(p => p.isBestseller || p.isFeatured)
          .slice(0, 5)
        if (topProds.length < 5) {
          const remaining = products.filter(p => !topProds.includes(p)).slice(0, 5 - topProds.length)
          topProds.push(...remaining)
        }
        setTopProducts(topProds.slice(0, 5))

        // Get recent articles
        const sortedArticles = articlesRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentArticles(sortedArticles.slice(0, 3))

        // Calculate today's stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayOrders = orders.filter(o => new Date(o.createdAt) >= today)
        const todayPending = todayOrders.filter(o => o.status === 'pending').length
        const todayCompleted = todayOrders.filter(o => o.status === 'delivered').length
        const todayCancelled = todayOrders.filter(o => o.status === 'cancelled').length
        const todayArticles = articlesRes.data.filter(a => new Date(a.createdAt) >= today).length
        
        setTodayStats({
          pendingOrders: todayPending,
          completedOrders: todayCompleted,
          cancelledOrders: todayCancelled,
          articles: todayArticles
        })
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }

    fetchStats()
    
    // Real-time polling for today's stats every 30 seconds
    const pollInterval = setInterval(fetchStats, 30000)
    
    return () => clearInterval(pollInterval)
  }, [])

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period)
    calculateRevenueByPeriod(allOrders, period)
  }

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case 'day': return '7 ngày qua'
      case 'week': return '8 tuần qua'
      case 'month': return '6 tháng qua'
      case 'year': return '5 năm qua'
      default: return ''
    }
  }

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
            {/* Stats Cards - Row 1: Main Stats */}
            <div className="stats-overview-cards">
              <div className="stats-overview-card revenue">
                <div className="stats-card-top">
                  <div className="stats-overview-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                    </svg>
                  </div>
                  <a href="/admin/orders" className="stats-card-link">Chi tiết →</a>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Tổng doanh thu</span>
                  <span className="stats-overview-value">{stats.totalRevenue.toLocaleString()}đ</span>
                </div>
                <div className="stats-card-footer">
                  <div className="stats-mini-info">
                    <span className="mini-dot success"></span>
                    <span>{stats.completedOrders} đơn hoàn thành</span>
                  </div>
                </div>
              </div>

              <div className="stats-overview-card orders">
                <div className="stats-card-top">
                  <div className="stats-overview-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
                    </svg>
                  </div>
                  <a href="/admin/orders" className="stats-card-link">Chi tiết →</a>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Tổng đơn hàng</span>
                  <span className="stats-overview-value">{stats.totalOrders}</span>
                </div>
                <div className="stats-card-footer">
                  <div className="stats-mini-bar">
                    <div className="mini-bar-segment pending" style={{width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders * 100) : 0}%`}}></div>
                    <div className="mini-bar-segment success" style={{width: `${stats.totalOrders > 0 ? (stats.completedOrders / stats.totalOrders * 100) : 0}%`}}></div>
                    <div className="mini-bar-segment danger" style={{width: `${stats.totalOrders > 0 ? (stats.cancelledOrders / stats.totalOrders * 100) : 0}%`}}></div>
                  </div>
                  <div className="stats-mini-legend">
                    <span><span className="mini-dot pending"></span>{stats.pendingOrders} chờ</span>
                    <span><span className="mini-dot success"></span>{stats.completedOrders} xong</span>
                    <span><span className="mini-dot danger"></span>{stats.cancelledOrders} hủy</span>
                  </div>
                </div>
              </div>

              <div className="stats-overview-card products">
                <div className="stats-card-top">
                  <div className="stats-overview-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                    </svg>
                  </div>
                  <a href="/admin/products" className="stats-card-link">Chi tiết →</a>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Sản phẩm</span>
                  <span className="stats-overview-value">{stats.totalProducts}</span>
                </div>
                <div className="stats-card-footer">
                  <div className="stats-mini-info">
                    <span className="mini-dot info"></span>
                    <span>Đang kinh doanh</span>
                  </div>
                </div>
              </div>

              <div className="stats-overview-card users">
                <div className="stats-card-top">
                  <div className="stats-overview-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                  </div>
                  <a href="/admin/users" className="stats-card-link">Chi tiết →</a>
                </div>
                <div className="stats-overview-content">
                  <span className="stats-overview-label">Khách hàng</span>
                  <span className="stats-overview-value">{stats.totalUsers}</span>
                </div>
                <div className="stats-card-footer">
                  <div className="stats-mini-info">
                    <span className="mini-dot info"></span>
                    <span>Tài khoản đã đăng ký</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="stats-quick-actions">
              <a href="/admin/orders" className="quick-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
                Quản lý đơn hàng
                {stats.pendingOrders > 0 && <span className="action-badge">{stats.pendingOrders}</span>}
              </a>
              <a href="/admin/products" className="quick-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
                Quản lý sản phẩm
              </a>
              <a href="/admin/users" className="quick-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                Quản lý khách hàng
              </a>
              <a href="/admin/articles" className="quick-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
                Quản lý bài viết
                <span className="action-count">{stats.totalArticles}</span>
              </a>
              <a href="/admin/categories" className="quick-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                </svg>
                Quản lý danh mục
              </a>
              <a href="/admin/reviews" className="quick-action-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Quản lý đánh giá
              </a>
            </div>

            {/* Charts Row */}
            <div className="stats-charts-row">
              <div className="stats-chart-card">
                <div className="stats-chart-header">
                  <div className="chart-title-section">
                    <h3>Doanh thu theo thời gian</h3>
                    <span className="chart-info">{getTimePeriodLabel()} - Chỉ tính đơn đã hoàn thành</span>
                  </div>
                  <div className="time-period-selector">
                    <button 
                      className={`period-btn ${timePeriod === 'day' ? 'active' : ''}`}
                      onClick={() => handleTimePeriodChange('day')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Ngày
                    </button>
                    <button 
                      className={`period-btn ${timePeriod === 'week' ? 'active' : ''}`}
                      onClick={() => handleTimePeriodChange('week')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                        <line x1="9" y1="4" x2="9" y2="22"/>
                      </svg>
                      Tuần
                    </button>
                    <button 
                      className={`period-btn ${timePeriod === 'month' ? 'active' : ''}`}
                      onClick={() => handleTimePeriodChange('month')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
                      </svg>
                      Tháng
                    </button>
                    <button 
                      className={`period-btn ${timePeriod === 'year' ? 'active' : ''}`}
                      onClick={() => handleTimePeriodChange('year')}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Năm
                    </button>
                  </div>
                </div>
                <LineChart data={revenueChartData.length > 0 ? revenueChartData : monthlyData} height={200} />
                <div className="chart-summary">
                  <div className="chart-summary-item">
                    <span className="summary-label">Tổng doanh thu kỳ này:</span>
                    <span className="summary-value">
                      {(revenueChartData.reduce((sum, d) => sum + d.value, 0) || 0).toLocaleString()}đ
                    </span>
                  </div>
                </div>
              </div>

              <div className="stats-chart-card">
                <div className="stats-chart-header">
                  <h3>Trạng thái đơn hàng</h3>
                  <span className="chart-info">Phân bổ theo trạng thái</span>
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
                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                    Sản phẩm theo danh mục
                  </h3>
                  <a href="/admin/categories" className="stats-view-all">Quản lý danh mục →</a>
                </div>
                {categoryData && categoryData.length > 0 ? (
                  <BarChart data={categoryData} height={200} />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                    <p>Chưa có dữ liệu danh mục</p>
                  </div>
                )}
              </div>

              <div className="stats-chart-card">
                <div className="stats-chart-header">
                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    Hoạt động hôm nay
                  </h3>
                  <span className="today-live-badge">
                    <span className="live-dot"></span>
                    Cập nhật tự động
                  </span>
                </div>
                <div className="today-activity-grid">
                  <div className="today-activity-item">
                    <div className="activity-icon pending">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div className="activity-info">
                      <span className="activity-value">{todayStats.pendingOrders}</span>
                      <span className="activity-label">Đơn chờ xử lý</span>
                    </div>
                    <a href="/admin/orders?status=pending" className="activity-action">Xem →</a>
                  </div>
                  <div className="today-activity-item">
                    <div className="activity-icon success">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                      </svg>
                    </div>
                    <div className="activity-info">
                      <span className="activity-value">{todayStats.completedOrders}</span>
                      <span className="activity-label">Đơn hoàn thành</span>
                    </div>
                    <a href="/admin/orders?status=delivered" className="activity-action">Xem →</a>
                  </div>
                  <div className="today-activity-item">
                    <div className="activity-icon danger">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                    </div>
                    <div className="activity-info">
                      <span className="activity-value">{todayStats.cancelledOrders}</span>
                      <span className="activity-label">Đơn đã hủy</span>
                    </div>
                    <a href="/admin/orders?status=cancelled" className="activity-action">Xem →</a>
                  </div>
                  <div className="today-activity-item">
                    <div className="activity-icon info">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <path d="M14 2v6h6"/>
                      </svg>
                    </div>
                    <div className="activity-info">
                      <span className="activity-value">{todayStats.articles}</span>
                      <span className="activity-label">Bài viết</span>
                    </div>
                    <a href="/admin/articles" className="activity-action">Xem →</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            {recentOrders.length > 0 && (
              <div className="stats-recent-section">
                <div className="stats-section-header">
                  <h3>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                    </svg>
                    Đơn hàng mới nhất
                  </h3>
                  <a href="/admin/orders" className="stats-view-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Quản lý đơn hàng
                  </a>
                </div>
                <div className="stats-orders-grid">
                  {recentOrders.map(order => {
                    const badge = getStatusBadge(order.status)
                    return (
                      <div key={order._id} className="stats-order-card">
                        <div className="order-card-header">
                          <span className="order-card-id">#{order._id.slice(-6).toUpperCase()}</span>
                          <span className={`order-card-status ${badge.class}`}>{badge.label}</span>
                        </div>
                        <div className="order-card-body">
                          <div className="order-card-customer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                              <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {order.customerName || 'Khách hàng'}
                          </div>
                          <div className="order-card-date">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="order-card-footer">
                          <span className="order-card-total">{(order.total || 0).toLocaleString()}đ</span>
                          <a href={`/admin/orders`} className="order-card-view">Xem chi tiết</a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}
