import React, { useEffect, useState } from 'react'
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
    totalArticles: 0,
    productsByCategory: [],
    revenueChart: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes, articlesRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/articles'),
        api.get('/categories?type=product')
      ])

      const products = productsRes.data || []
      const orders = ordersRes.data || []
      const articles = Array.isArray(articlesRes.data?.articles) ? articlesRes.data.articles : Array.isArray(articlesRes.data) ? articlesRes.data : []
      const categories = categoriesRes.data || []

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Thống kê hôm nay - chỉ lấy admin thêm và đơn hàng đã bán
      const todayProducts = products.filter(p => {
        const createdDate = new Date(p.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      }).length

      const todayOrdersData = orders.filter(o => {
        const createdDate = new Date(o.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime() && o.status === 'delivered'
      })
      const todayOrders = todayOrdersData.length
      const todayRevenue = todayOrdersData.reduce((sum, o) => sum + (o.total || 0), 0)

      const todayArticles = articles.filter(a => {
        const createdDate = new Date(a.createdAt)
        createdDate.setHours(0, 0, 0, 0)
        return createdDate.getTime() === today.getTime()
      }).length

      // Thống kê đơn hàng theo trạng thái
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const completedOrders = orders.filter(o => o.status === 'delivered').length
      const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

      // Thống kê sản phẩm theo danh mục lớn
      const mainCategories = categories.filter(c => !c.parentCategory)
      const productsByCategory = mainCategories.map(cat => {
        const count = products.filter(p => {
          const productCat = String(p.category || '').toLowerCase()
          const catSlug = String(cat.slug || '').toLowerCase()
          return productCat === catSlug || productCat === cat.name.toLowerCase()
        }).length
        return {
          name: cat.name,
          count,
          color: getCategoryColor(cat.slug)
        }
      })

      // Biểu đồ doanh thu 7 ngày gần nhất
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
          revenue: revenue / 1000000, // Chuyển sang triệu
          orders: dayOrders.length
        })
      }

      setStats({
        todayProducts,
        todayOrders,
        todayArticles,
        todayRevenue,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalArticles: articles.length,
        productsByCategory,
        revenueChart: last7Days
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (slug) => {
    const colors = {
      'hoa-kieng': '#ec4899',
      'cay-canh': '#10b981',
      'cay-thuy-canh': '#3b82f6',
      'sen-da': '#f59e0b'
    }
    return colors[slug] || '#6b7280'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
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
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-date">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            Hôm nay: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="activity-section">
          <h2 className="section-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Hoạt động hôm nay
          </h2>
          <div className="stats-grid">
            <Link to="/admin/orders?filter=pending" className="stat-card stat-pending">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.pendingOrders}</div>
                <div className="stat-label">Đơn chờ xử lý</div>
              </div>
              <div className="stat-link">Xem →</div>
            </Link>

            <Link to="/admin/orders?filter=delivered" className="stat-card stat-completed">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.completedOrders}</div>
                <div className="stat-label">Đơn hoàn thành</div>
              </div>
              <div className="stat-link">Xem →</div>
            </Link>

            <Link to="/admin/orders?filter=cancelled" className="stat-card stat-cancelled">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.cancelledOrders}</div>
                <div className="stat-label">Đơn đã hủy</div>
              </div>
              <div className="stat-link">Xem →</div>
            </Link>

            <Link to="/admin/articles" className="stat-card stat-articles">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{stats.totalArticles}</div>
                <div className="stat-label">Bài viết</div>
              </div>
              <div className="stat-link">Xem →</div>
            </Link>
          </div>

          <div className="today-stats">
            <div className="today-stat">
              <div className="today-icon">📦</div>
              <div>
                <div className="today-value">{stats.todayProducts}</div>
                <div className="today-label">Sản phẩm thêm hôm nay</div>
              </div>
            </div>
            <div className="today-stat">
              <div className="today-icon">🛒</div>
              <div>
                <div className="today-value">{stats.todayOrders}</div>
                <div className="today-label">Đơn hàng hôm nay</div>
              </div>
            </div>
            <div className="today-stat">
              <div className="today-icon">📝</div>
              <div>
                <div className="today-value">{stats.todayArticles}</div>
                <div className="today-label">Bài viết hôm nay</div>
              </div>
            </div>
            <div className="today-stat">
              <div className="today-icon">💰</div>
              <div>
                <div className="today-value">{formatCurrency(stats.todayRevenue)}</div>
                <div className="today-label">Doanh thu hôm nay</div>
              </div>
            </div>
          </div>
        </div>

        <div className="category-section">
          <h2 className="section-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
            </svg>
            Sản phẩm theo danh mục
          </h2>
          <div className="category-grid">
            {stats.productsByCategory.map((cat, idx) => (
              <div key={idx} className="category-card" style={{ borderColor: cat.color }}>
                <div className="category-bar" style={{ backgroundColor: cat.color }}></div>
                <h3>{cat.name}</h3>
                <div className="category-count" style={{ color: cat.color }}>{cat.count}</div>
                <p>sản phẩm</p>
              </div>
            ))}
          </div>
        </div>

        <div className="revenue-section">
          <h2 className="section-title">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h2v8H3v-8zm4-4h2v12H7V9zm4-6h2v18h-2V3zm4 10h2v8h-2v-8zm4-4h2v12h-2V9z"/>
            </svg>
            Doanh thu 7 ngày gần nhất
          </h2>
          <div className="revenue-chart">
            <div className="chart-container">
              {stats.revenueChart.map((day, idx) => {
                const maxRevenue = Math.max(...stats.revenueChart.map(d => d.revenue), 1)
                const height = (day.revenue / maxRevenue) * 100
                return (
                  <div key={idx} className="chart-bar-wrapper">
                    <div className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ 
                          height: `${height}%`,
                          background: 'linear-gradient(180deg, #d4a574 0%, #c9965f 100%)'
                        }}
                      >
                        <div className="chart-value">{day.revenue.toFixed(1)}M</div>
                      </div>
                    </div>
                    <div className="chart-label">{day.date}</div>
                    <div className="chart-orders">{day.orders} đơn</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
