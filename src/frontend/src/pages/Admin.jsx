import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import api from '../api'
import './Admin.css'

export default function Admin() {
  const [stats, setStats] = useState({
    todayProducts: 0,
    todayOrders: 0,
    todayArticles: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    processingOrders: 0,
    shippingOrders: 0,
    confirmedOrders: 0,
    preparingOrders: 0,
    totalArticles: 0,
    totalProducts: 0,
    totalUsers: 0,
    productsByCategory: [],
    revenueChart: [],
    orderStatusChart: [],
    lowStockProducts: [],
    outOfStockProducts: [],
    topSellingProducts: [],
    recentOrders: [],
    recentProducts: [],
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    orderGrowth: 0,
    revenueGrowth: 0,
    unreadMessages: 0,
    pendingReviews: 0,
    newUsersToday: 0,
    avgOrderValue: 0,
    conversionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notifications, setNotifications] = useState([])

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    loadStats()
    // Refresh stats every 30 seconds for real-time feel
    const refreshTimer = setInterval(loadStats, 30000)
    return () => clearInterval(refreshTimer)
  }, [])

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes, articlesRes, categoriesRes, usersRes, messagesRes, reviewsRes] = await Promise.all([
        api.get('/products?includeHidden=true'),
        api.get('/orders'),
        api.get('/articles'),
        api.get('/categories?type=product'),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/messages').catch(() => ({ data: [] })),
        api.get('/reviews').catch(() => ({ data: [] }))
      ])

      const products = productsRes.data || []
      const orders = ordersRes.data || []
      const articles = Array.isArray(articlesRes.data?.articles) ? articlesRes.data.articles : Array.isArray(articlesRes.data) ? articlesRes.data : []
      const categories = categoriesRes.data || []
      const users = usersRes.data || []
      const messages = messagesRes.data || []
      const reviews = reviewsRes.data || []

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // === TODAY STATS ===
      const todayProducts = products.filter(p => {
        const createdDate = new Date(p.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      }).length

      const todayOrdersData = orders.filter(o => {
        const createdDate = new Date(o.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      })
      const todayOrders = todayOrdersData.length
      const todayRevenue = todayOrdersData.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)

      const todayArticles = articles.filter(a => {
        const createdDate = new Date(a.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      }).length

      const newUsersToday = users.filter(u => {
        const createdDate = new Date(u.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      }).length

      // === ORDER STATUS STATS ===
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const confirmedOrders = orders.filter(o => o.status === 'confirmed').length
      const preparingOrders = orders.filter(o => o.status === 'preparing').length
      const processingOrders = orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length
      const shippingOrders = orders.filter(o => o.status === 'shipping').length
      const completedOrders = orders.filter(o => o.status === 'delivered').length
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

      // === PRODUCT STOCK ANALYSIS ===
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 8)
      const outOfStockProducts = products.filter(p => p.stock === 0).slice(0, 8)

      // === TOP SELLING PRODUCTS ===
      const productSales = {}
      orders.filter(o => o.status === 'delivered').forEach(order => {
        (order.items || []).forEach(item => {
          const productId = item.product?._id || item.product
          if (productId) {
            productSales[productId] = (productSales[productId] || 0) + (item.quantity || 1)
          }
        })
      })

      const topSellingProducts = products
        .map(p => ({ ...p, soldCount: productSales[p._id] || 0 }))
        .filter(p => p.soldCount > 0)
        .sort((a, b) => b.soldCount - a.soldCount)
        .slice(0, 8)

      // === RECENT ORDERS ===
      const recentOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

      // === RECENT PRODUCTS ===
      const recentProducts = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

      // === CATEGORY STATS ===
      const mainCategories = categories.filter(c => !c.parentCategory)
      const productsByCategory = mainCategories.map(cat => {
        const count = products.filter(p => {
          const productCat = String(p.category || '').toLowerCase()
          const catSlug = String(cat.slug || '').toLowerCase()
          return productCat === catSlug || productCat === cat.name.toLowerCase()
        }).length
        return { name: cat.name, count, color: getCategoryColor(cat.slug) }
      })

      // === REVENUE CHART (7 DAYS) ===
      const last7Days = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const nextDate = new Date(date)
        nextDate.setDate(nextDate.getDate() + 1)
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt)
          return orderDate >= date && orderDate < nextDate && o.status === 'delivered'
        })
        const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
        last7Days.push({
          date: date.getDate() + '/' + (date.getMonth() + 1),
          dayName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()],
          revenue: revenue / 1000000,
          orders: dayOrders.length
        })
      }

      // === ORDER STATUS CHART ===
      const orderStatusChart = [
        { name: 'Chờ xác nhận', count: pendingOrders, color: '#f59e0b', icon: '⏳' },
        { name: 'Đã xác nhận', count: confirmedOrders, color: '#3b82f6', icon: '✓' },
        { name: 'Đang chuẩn bị', count: preparingOrders, color: '#8b5cf6', icon: '📦' },
        { name: 'Đang giao', count: shippingOrders, color: '#06b6d4', icon: '🚚' },
        { name: 'Hoàn thành', count: completedOrders, color: '#10b981', icon: '✅' },
        { name: 'Đã hủy', count: cancelledOrders, color: '#ef4444', icon: '❌' }
      ]

      // === REVENUE CALCULATIONS ===
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)

      const weeklyRevenue = orders.filter(o => new Date(o.createdAt) >= weekAgo && o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)
      const monthlyRevenue = orders.filter(o => new Date(o.createdAt) >= monthAgo && o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)

      // === GROWTH CALCULATIONS ===
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const lastWeekRevenue = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= twoWeeksAgo && d < weekAgo && o.status === 'delivered'
      }).reduce((sum, o) => sum + (o.total || 0), 0)

      const lastWeekOrders = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= twoWeeksAgo && d < weekAgo
      }).length

      const thisWeekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo).length
      const revenueGrowth = lastWeekRevenue > 0 ? ((weeklyRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0
      const orderGrowth = lastWeekOrders > 0 ? ((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100 : 0

      // === OTHER STATS ===
      const unreadMessages = messages.filter(m => !m.isRead).length
      const pendingReviews = reviews.filter(r => !r.isApproved).length
      const avgOrderValue = completedOrders > 0 ? monthlyRevenue / completedOrders : 0

      // === BUILD NOTIFICATIONS ===
      const newNotifications = []
      if (pendingOrders > 0) {
        newNotifications.push({ type: 'warning', icon: '📋', title: `${pendingOrders} đơn hàng chờ xác nhận`, desc: 'Cần xử lý ngay', link: '/admin/orders?filter=pending', priority: 1 })
      }
      if (outOfStockProducts.length > 0) {
        newNotifications.push({ type: 'danger', icon: '🚨', title: `${outOfStockProducts.length} sản phẩm hết hàng`, desc: 'Cần nhập thêm hàng', link: '/admin/products?stock=out', priority: 2 })
      }
      if (lowStockProducts.length > 0) {
        newNotifications.push({ type: 'alert', icon: '⚠️', title: `${lowStockProducts.length} sản phẩm sắp hết`, desc: 'Tồn kho dưới 5', link: '/admin/products?stock=low', priority: 3 })
      }
      if (shippingOrders > 0) {
        newNotifications.push({ type: 'info', icon: '🚚', title: `${shippingOrders} đơn đang giao`, desc: 'Theo dõi vận chuyển', link: '/admin/orders?filter=shipping', priority: 4 })
      }
      if (unreadMessages > 0) {
        newNotifications.push({ type: 'info', icon: '💬', title: `${unreadMessages} tin nhắn mới`, desc: 'Phản hồi khách hàng', link: '/admin/messages', priority: 5 })
      }
      if (pendingReviews > 0) {
        newNotifications.push({ type: 'info', icon: '⭐', title: `${pendingReviews} đánh giá chờ duyệt`, desc: 'Kiểm tra và duyệt', link: '/admin/reviews', priority: 6 })
      }
      if (todayOrders > 0) {
        newNotifications.push({ type: 'success', icon: '🎉', title: `${todayOrders} đơn hàng hôm nay`, desc: formatCurrency(todayRevenue) + ' doanh thu', link: '/admin/orders', priority: 7 })
      }
      if (newUsersToday > 0) {
        newNotifications.push({ type: 'success', icon: '👤', title: `${newUsersToday} người dùng mới`, desc: 'Đăng ký hôm nay', link: '/admin/users', priority: 8 })
      }
      setNotifications(newNotifications.sort((a, b) => a.priority - b.priority))

      setStats({
        todayProducts, todayOrders, todayArticles, todayRevenue,
        pendingOrders, processingOrders, shippingOrders, completedOrders, cancelledOrders,
        confirmedOrders, preparingOrders,
        totalArticles: articles.length, totalProducts: products.length, totalUsers: users.length,
        productsByCategory, revenueChart: last7Days, orderStatusChart,
        lowStockProducts, outOfStockProducts, topSellingProducts, recentOrders, recentProducts,
        monthlyRevenue, weeklyRevenue, revenueGrowth, orderGrowth,
        unreadMessages, pendingReviews, newUsersToday, avgOrderValue
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (slug) => {
    const colors = { 'chau-cay': '#8B4513', 'hoa-kieng': '#ec4899', 'cay-canh': '#10b981', 'phu-kien': '#8b5cf6' }
    return colors[slug] || '#6b7280'
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  const getStatusText = (status) => ({ 'pending': 'Chờ xác nhận', 'confirmed': 'Đã xác nhận', 'preparing': 'Đang chuẩn bị', 'shipping': 'Đang giao', 'delivered': 'Hoàn thành', 'cancelled': 'Đã hủy' }[status] || status)
  const getStatusClass = (status) => ({ 'pending': 'status-pending', 'confirmed': 'status-confirmed', 'preparing': 'status-preparing', 'shipping': 'status-shipping', 'delivered': 'status-delivered', 'cancelled': 'status-cancelled' }[status] || '')

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        {/* Dashboard Hero Header - Simplified */}
        <div className="dashboard-hero">
          <div className="hero-content">
            <div className="hero-greeting">
              <div>
                <h1>{getGreeting()}!</h1>
                <p className="hero-date">
                  {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
          <div className="hero-time-box">
            <span className="hero-time">{currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Todo Alerts - Việc cần làm */}
        {notifications.length > 0 && (
          <div className="dashboard-todo-alerts">
            <div className="todo-title">
              <span className="todo-icon">📋</span>
              <span>Việc cần làm hôm nay</span>
              <span className="todo-count">{notifications.filter(n => n.type === 'warning' || n.type === 'danger').length}</span>
            </div>
            <div className="todo-grid">
              {notifications.filter(n => n.type === 'warning' || n.type === 'danger').slice(0, 4).map((notif, idx) => (
                <Link to={notif.link} key={idx} className={`todo-item todo-${notif.type}`}>
                  <span className="todo-item-icon">{notif.icon}</span>
                  <div className="todo-item-content">
                    <strong>{notif.title}</strong>
                    <span>{notif.desc}</span>
                  </div>
                  <span className="todo-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Charts Grid - 2 Charts Only */}
        <div className="dashboard-charts-grid">
          {/* User Statistics Chart */}
          <div className="chart-card">
            <div className="card-header">
              <div className="header-left">
                <span className="header-icon">👥</span>
                <div>
                  <h3>Thống kê người dùng</h3>
                  <span className="header-subtitle">Tổng: {stats.totalUsers} người dùng</span>
                </div>
              </div>
            </div>
            <div className="chart-body">
              <div className="user-stats-grid">
                <div className="user-stat-item">
                  <div className="stat-icon-large">👤</div>
                  <div className="stat-value-large">{stats.totalUsers}</div>
                  <div className="stat-label-large">Tổng người dùng</div>
                </div>
                <div className="user-stat-item highlight">
                  <div className="stat-icon-large">✨</div>
                  <div className="stat-value-large">{stats.newUsersToday}</div>
                  <div className="stat-label-large">Đăng ký hôm nay</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics Chart */}
          <div className="chart-card">
            <div className="card-header">
              <div className="header-left">
                <span className="header-icon">📦</span>
                <div>
                  <h3>Thống kê đơn hàng</h3>
                  <span className="header-subtitle">Doanh thu tuần: {formatCurrency(stats.weeklyRevenue)}</span>
                </div>
              </div>
            </div>
            <div className="chart-body">
              <div className="order-stats-grid">
                {stats.orderStatusChart.map((item, idx) => (
                  <Link to="/admin/orders" key={idx} className="order-stat-item" style={{'--item-color': item.color}}>
                    <span className="order-stat-icon">{item.icon}</span>
                    <div className="order-stat-info">
                      <span className="order-stat-count">{item.count}</span>
                      <span className="order-stat-name">{item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Notifications - Other Alerts */}
        {notifications.filter(n => n.type === 'info' || n.type === 'success').length > 0 && (
          <div className="dashboard-info-section">
            <div className="section-title">
              <span className="title-icon">ℹ️</span>
              <span>Thông báo khác</span>
            </div>
            <div className="info-grid">
              {notifications.filter(n => n.type === 'info' || n.type === 'success').map((notif, idx) => (
                <Link to={notif.link} key={idx} className={`info-card info-${notif.type}`}>
                  <span className="info-icon">{notif.icon}</span>
                  <div className="info-content">
                    <span className="info-title">{notif.title}</span>
                    <span className="info-desc">{notif.desc}</span>
                  </div>
                  <span className="info-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
