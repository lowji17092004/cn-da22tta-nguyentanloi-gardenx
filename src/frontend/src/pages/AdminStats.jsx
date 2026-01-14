import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import './AdminStats.css'

// ================== CHART COMPONENTS ==================

// Line Chart Component
function LineChart({ data, height = 200, color = '#4A90E2', simplified = false, maxYValue = null }) {
  if (!data || data.length === 0) return <div className="chart-empty">📉 Không có dữ liệu</div>
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const minValue = 0
  const range = maxValue || 1
  
  // Calculate nice Y-axis scale
  const getYAxisValues = () => {
    let max = maxYValue || maxValue
    // For simplified format (customer chart), use cleaner steps
    if (simplified) {
      max = Math.max(max, 500000) // Minimum 500k
      const step = Math.ceil(max / 5 / 100000) * 100000
      return Array.from({ length: 6 }, (_, i) => i * step)
    }
    const step = Math.ceil(max / 5 / 100000) * 100000
    return Array.from({ length: 6 }, (_, i) => i * step)
  }
  const yAxisValues = getYAxisValues()
  const yMax = yAxisValues[yAxisValues.length - 1]
  
  const points = data.map((d, i) => ({
    x: 15 + (i / (data.length - 1 || 1)) * 80,
    y: 90 - ((d.value / yMax) * 75),
    value: d.value
  }))
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN') + 'đ'
  }

  return (
    <div className="professional-chart-container">
      <div className="chart-canvas" style={{ height }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="line-chart-svg">
          {/* Horizontal grid lines */}
          {yAxisValues.map((val, i) => {
            const y = 90 - (i / (yAxisValues.length - 1)) * 75
            return (
              <line 
                key={i} 
                x1="15" 
                y1={y} 
                x2="95" 
                y2={y} 
                stroke="#d0d0d0" 
                strokeWidth="0.15" 
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
          {/* Main line */}
          <path 
            d={pathD} 
            fill="none" 
            stroke={color} 
            strokeWidth="2" 
            vectorEffect="non-scaling-stroke" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="chart-line"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="y-axis-labels">
          {yAxisValues.slice().reverse().map((val, i) => (
            <div key={i} className="y-axis-label">{formatCurrency(val)}</div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="x-axis-labels">
          {data.map((d, i) => {
            const xPercent = 15 + (i / (data.length - 1 || 1)) * 80
            // Chỉ hiển thị labels có khoảng cách hợp lý để tránh chồng chéo
            const shouldShow = data.length <= 15 || 
                              i === 0 || 
                              i === data.length - 1 || 
                              (data.length <= 31 && i % 2 === 0) || 
                              (data.length > 31 && i % 3 === 0)
            return shouldShow ? (
              <span key={i} className="x-axis-label" style={{ left: `${xPercent}%` }}>{d.label}</span>
            ) : null
          })}
        </div>
      </div>
    </div>
  )
}

// Bar Chart Component
function BarChart({ data, height = 220 }) {
  if (!data || data.length === 0) return <div className="chart-empty">📊 Không có dữ liệu</div>
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const colors = ['#1a472a', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444']
  
  return (
    <div className="bar-chart-wrapper" style={{ height }}>
      <div className="bar-chart-container">
        {data.map((item, i) => {
          const barColor = item.color || colors[i % colors.length]
          const barHeight = (item.value / maxValue) * 70
          return (
            <div key={i} className="bar-column">
              <div className="bar-value-top" style={{ color: barColor }}>{item.value}</div>
              <div className="bar-track">
                <div 
                  className="bar-fill" 
                  style={{ 
                    height: `${barHeight}%`,
                    background: `linear-gradient(180deg, ${barColor} 0%, ${barColor}dd 100%)`,
                    boxShadow: `0 -2px 8px ${barColor}40`
                  }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <div className="bar-label" title={item.fullLabel || item.label}>{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Horizontal Bar Chart
function HorizontalBarChart({ data, height = 250 }) {
  if (!data || data.length === 0) return <div className="chart-empty">Không có dữ liệu</div>
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const colors = ['#1a472a', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']
  
  return (
    <div className="h-bar-chart" style={{ maxHeight: height }}>
      {data.map((item, i) => (
        <div key={i} className="h-bar-row">
          <div className="h-bar-label">{item.label}</div>
          <div className="h-bar-track">
            <div 
              className="h-bar-fill" 
              style={{ 
                width: `${(item.value / maxValue) * 100}%`,
                background: item.color || colors[i % colors.length]
              }}
            />
          </div>
          <div className="h-bar-value">{item.value.toLocaleString()}</div>
        </div>
      ))}
    </div>
  )
}

// Donut Chart Component
function DonutChart({ data, size = 160 }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <div className="chart-empty">Không có dữ liệu</div>
  
  let cumulativePercent = 0
  const getCoords = (percent) => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  return (
    <div className="donut-chart-container">
      <svg width={size} height={size} viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
        {data.map((item, i) => {
          if (item.value === 0) return null
          const percent = item.value / total
          const [startX, startY] = getCoords(cumulativePercent)
          cumulativePercent += percent
          const [endX, endY] = getCoords(cumulativePercent)
          const largeArc = percent > 0.5 ? 1 : 0
          const pathD = `M ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} L 0 0`
          return <path key={i} d={pathD} fill={item.color} className="donut-segment" />
        })}
        <circle cx="0" cy="0" r="0.65" fill="#fff" />
      </svg>
      <div className="donut-center">
        <span className="donut-total-value">{total}</span>
        <span className="donut-total-label">Tổng</span>
      </div>
    </div>
  )
}

// Semi-Circle Gauge Chart
function GaugeChart({ value, max, label, color = '#1a472a' }) {
  const percent = Math.min(value / max, 1)
  
  return (
    <div className="gauge-chart">
      <svg viewBox="0 0 200 100" className="gauge-svg">
        <path d="M 10 100 A 90 90 0 0 1 190 100" fill="none" stroke="#e5e7eb" strokeWidth="15" strokeLinecap="round" />
        <path 
          d="M 10 100 A 90 90 0 0 1 190 100" 
          fill="none" 
          stroke={color} 
          strokeWidth="15" 
          strokeLinecap="round"
          strokeDasharray={`${percent * 282.7} 282.7`}
          className="gauge-fill"
        />
      </svg>
      <div className="gauge-value">{value.toLocaleString()}</div>
      <div className="gauge-label">{label}</div>
    </div>
  )
}

// Progress Bar Component
function ProgressBar({ label, value, max, color = '#1a472a' }) {
  const percent = Math.min((value / max) * 100, 100)
  return (
    <div className="progress-item">
      <div className="progress-header">
        <span className="progress-label">{label}</span>
        <span className="progress-value">{value} / {max}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  )
}

// Radar Chart Component
function RadarChart({ data, size = 200 }) {
  if (!data || data.length === 0) return <div className="chart-empty">Không có dữ liệu</div>
  const maxValue = Math.max(...data.map(d => d.value), 1)
  const numPoints = data.length
  const angleStep = (2 * Math.PI) / numPoints
  
  const getPoint = (value, index) => {
    const angle = index * angleStep - Math.PI / 2
    const radius = (value / maxValue) * 40
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    }
  }
  
  const points = data.map((d, i) => getPoint(d.value, i))
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
  
  return (
    <div className="radar-chart" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100">
        {/* Grid circles */}
        {[20, 40, 60, 80, 100].map(r => (
          <circle key={r} cx="50" cy="50" r={r * 0.4} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
        ))}
        {/* Axis lines */}
        {data.map((_, i) => {
          const p = getPoint(maxValue, i)
          return <line key={i} x1="50" y1="50" x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="0.5" />
        })}
        {/* Data polygon */}
        <path d={pathD} fill="rgba(26, 71, 42, 0.2)" stroke="#1a472a" strokeWidth="2" />
        {/* Data points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#1a472a" />
        ))}
      </svg>
      <div className="radar-labels">
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2
          const labelRadius = 52
          const x = 50 + labelRadius * Math.cos(angle)
          const y = 50 + labelRadius * Math.sin(angle)
          return (
            <span 
              key={i} 
              className="radar-label" 
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {d.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// Sparkline Component
function Sparkline({ data, width = 100, height = 30, color = '#1a472a' }) {
  if (!data || data.length === 0) return null
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(' ')
  return (
    <svg width={width} height={height} className="sparkline">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

// ================== MAIN COMPONENT ==================

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalArticles: 0,
    totalUsers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    processingOrders: 0,
    shippingOrders: 0,
    allUsers: []
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [timePeriod, setTimePeriod] = useState('month')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [revenueChartData, setRevenueChartData] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [orderTrend, setOrderTrend] = useState([])
  const [userGrowth, setUserGrowth] = useState([])
  const [hourlyData, setHourlyData] = useState([])
  const [weekdayData, setWeekdayData] = useState([])
  const [performanceData, setPerformanceData] = useState([])

  // Calculate revenue by time period
  const calculateRevenueByPeriod = (orders, period, month = null, year = null, week = null) => {
    const deliveredOrders = orders.filter(o => o.status === 'delivered')
    const now = new Date()
    let data = []

    if (period === 'specific-week' && week && month && year) {
      // Hiển thị doanh thu 7 ngày trong tuần của tháng được chọn
      const startDay = (week - 1) * 7 + 1
      const endDay = Math.min(week * 7, new Date(year, month, 0).getDate())
      
      for (let day = startDay; day <= endDay; day++) {
        const currentDay = new Date(year, month - 1, day)
        const dayRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getDate() === day && orderDate.getMonth() === month - 1 && orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        const dayLabel = currentDay.toLocaleDateString('vi-VN', { weekday: 'short' })
        data.push({ label: dayLabel, value: dayRevenue })
      }
    } else if (period === 'specific-month' && month && year) {
      // Hiển thị doanh thu từng ngày trong tháng được chọn
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const dayRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getDate() === day && 
                   orderDate.getMonth() === month - 1 && 
                   orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: `${day}`, value: dayRevenue })
      }
    } else if (period === 'specific-year' && year) {
      // Hiển thị doanh thu 12 tháng trong năm được chọn
      for (let m = 1; m <= 12; m++) {
        const monthRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getMonth() === m - 1 && orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: `T${m}`, value: monthRevenue })
      }
    } else if (period === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const shortLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' })
        const dayRevenue = deliveredOrders
          .filter(o => new Date(o.createdAt).toDateString() === date.toDateString())
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: shortLabel, value: dayRevenue })
      }
    } else if (period === 'week') {
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const weekLabel = `T${8-i}`
        const weekRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate >= weekStart && orderDate <= weekEnd
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: weekLabel, value: weekRevenue })
      }
    } else if (period === 'month') {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        const monthIndex = date.getMonth()
        const year = date.getFullYear()
        const shortLabel = `T${monthIndex + 1}`
        const monthRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: shortLabel, value: monthRevenue })
      }
    } else if (period === 'year') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i
        const yearRevenue = deliveredOrders
          .filter(o => new Date(o.createdAt).getFullYear() === year)
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: year.toString(), value: yearRevenue })
      }
    } else if (period === 'specific-month' && month && year) {
      // Hiển thị doanh thu từng ngày trong tháng được chọn
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day)
        const dayRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getDate() === day && 
                   orderDate.getMonth() === month - 1 && 
                   orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: `${day}`, value: dayRevenue })
      }
    } else if (period === 'specific-year' && year) {
      // Hiển thị doanh thu từng tháng trong năm được chọn
      for (let m = 1; m <= 12; m++) {
        const monthRevenue = deliveredOrders
          .filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getMonth() === m - 1 && orderDate.getFullYear() === year
          })
          .reduce((sum, o) => sum + (o.total || 0), 0)
        data.push({ label: `T${m}`, value: monthRevenue })
      }
    }
    setRevenueChartData(data)
  }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const [ordersRes, productsRes, articlesRes, usersRes, categoriesRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products'),
          api.get('/articles'),
          api.get('/users'),
          api.get('/categories?type=product')
        ])

        const orders = ordersRes.data
        const products = productsRes.data
        const users = usersRes.data
        const categories = categoriesRes.data || []
        
        const totalRevenue = orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + (o.total || 0), 0)

        const pendingOrders = orders.filter(o => o.status === 'pending').length
        const processingOrders = orders.filter(o => o.status === 'processing').length
        const shippingOrders = orders.filter(o => o.status === 'shipping').length
        const completedOrders = orders.filter(o => o.status === 'delivered').length
        const cancelledOrders = orders.filter(o => o.status === 'cancelled').length

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          totalProducts: products.length,
          totalArticles: articlesRes.data.length,
          totalUsers: users.length,
          pendingOrders,
          processingOrders,
          shippingOrders,
          completedOrders,
          cancelledOrders,
          allUsers: users
        })

        setAllOrders(orders)

        // Revenue by period
        const deliveredOrders = orders.filter(o => o.status === 'delivered')
        const now = new Date()
        let initialData = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          const monthIndex = date.getMonth()
          const year = date.getFullYear()
          const shortLabel = `T${monthIndex + 1}`
          const monthRevenue = deliveredOrders
            .filter(o => {
              const orderDate = new Date(o.createdAt)
              return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year
            })
            .reduce((sum, o) => sum + (o.total || 0), 0)
          initialData.push({ label: shortLabel, value: monthRevenue })
        }
        setRevenueChartData(initialData)

        // Order trend (same period)
        let orderTrendData = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          const monthIndex = date.getMonth()
          const year = date.getFullYear()
          const monthOrders = orders.filter(o => {
            const orderDate = new Date(o.createdAt)
            return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year
          }).length
          orderTrendData.push({ label: `T${monthIndex + 1}`, value: monthOrders })
        }
        setOrderTrend(orderTrendData)

        // User growth
        let userGrowthData = []
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now)
          date.setMonth(date.getMonth() - i)
          const monthIndex = date.getMonth()
          const year = date.getFullYear()
          const monthUsers = users.filter(u => {
            const userDate = new Date(u.createdAt)
            return userDate.getMonth() === monthIndex && userDate.getFullYear() === year
          }).length
          userGrowthData.push({ label: `T${monthIndex + 1}`, value: monthUsers })
        }
        setUserGrowth(userGrowthData)

        // Hourly order distribution
        const hourlyDistribution = Array(24).fill(0)
        orders.forEach(o => {
          const hour = new Date(o.createdAt).getHours()
          hourlyDistribution[hour]++
        })
        const hourlyLabels = ['0h', '3h', '6h', '9h', '12h', '15h', '18h', '21h']
        setHourlyData(hourlyLabels.map((label, i) => ({
          label,
          value: hourlyDistribution[i * 3] + hourlyDistribution[i * 3 + 1] + hourlyDistribution[i * 3 + 2]
        })))

        // Weekday distribution
        const weekdays = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN']
        const weekdayDist = Array(7).fill(0)
        orders.forEach(o => {
          const day = new Date(o.createdAt).getDay()
          // Map Sunday (0) to index 6, Monday (1) to index 0, etc.
          const mappedIndex = day === 0 ? 6 : day - 1
          weekdayDist[mappedIndex]++
        })
        setWeekdayData(weekdays.map((label, i) => ({
          label,
          value: weekdayDist[i]
        })))

        // Category data
        const categoryCount = {}
        products.forEach(p => {
          const mainCat = categories.find(cat => 
            cat.slug === p.category || cat._id === p.category ||
            cat.subcategories?.some(sub => sub.slug === p.category || sub._id === p.category)
          )
          const catName = mainCat?.name || 'Khác'
          categoryCount[catName] = (categoryCount[catName] || 0) + 1
        })
        const colors = ['#1a472a', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444']
        const catData = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count], i) => ({
            label: name.length > 12 ? name.substring(0, 12) + '...' : name,
            fullLabel: name,
            value: count,
            color: colors[i % colors.length]
          }))
        setCategoryData(catData)

        // Performance metrics for radar chart
        setPerformanceData([
          { label: 'Doanh thu', value: Math.min(totalRevenue / 10000000 * 100, 100) },
          { label: 'Đơn hàng', value: Math.min(orders.length / 100 * 100, 100) },
          { label: 'Sản phẩm', value: Math.min(products.length / 50 * 100, 100) },
          { label: 'Khách hàng', value: Math.min(users.length / 100 * 100, 100) },
          { label: 'Bài viết', value: Math.min(articlesRes.data.length / 20 * 100, 100) },
          { label: 'Tỷ lệ HT', value: orders.length > 0 ? (completedOrders / orders.length) * 100 : 0 }
        ])

        // Top products
        const topProds = products.filter(p => p.isBestseller || p.isFeatured).slice(0, 5)
        if (topProds.length < 5) {
          topProds.push(...products.filter(p => !topProds.includes(p)).slice(0, 5 - topProds.length))
        }
        setTopProducts(topProds.slice(0, 5))

        // Recent orders
        const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setRecentOrders(sorted.slice(0, 6))

      } catch (e) {
        console.error('Error fetching stats:', e)
      }
      setLoading(false)
    }

    fetchStats()
    const pollInterval = setInterval(fetchStats, 60000)
    return () => clearInterval(pollInterval)
  }, [])

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period)
    if (period === 'specific-week') {
      calculateRevenueByPeriod(allOrders, period, selectedMonth, selectedYear, selectedWeek)
      calculateOrdersByCategory(allOrders, period, selectedMonth, selectedYear, selectedWeek)
      calculateUserGrowthByPeriod(period, selectedMonth, selectedYear, selectedWeek)
    } else if (period === 'specific-month') {
      calculateRevenueByPeriod(allOrders, period, selectedMonth, selectedYear)
      calculateOrdersByCategory(allOrders, period, selectedMonth, selectedYear)
      calculateUserGrowthByPeriod(period, selectedMonth, selectedYear)
    } else if (period === 'specific-year') {
      calculateRevenueByPeriod(allOrders, period, null, selectedYear)
      calculateOrdersByCategory(allOrders, period, null, selectedYear)
      calculateUserGrowthByPeriod(period, null, selectedYear)
    } else {
      calculateRevenueByPeriod(allOrders, period)
      calculateOrdersByCategory(allOrders, period)
      calculateUserGrowthByPeriod(period)
    }
  }

  const handleWeekChange = (e) => {
    const week = parseInt(e.target.value)
    setSelectedWeek(week)
    if (timePeriod === 'specific-week') {
      calculateRevenueByPeriod(allOrders, 'specific-week', selectedMonth, selectedYear, week)
      calculateOrdersByCategory(allOrders, 'specific-week', selectedMonth, selectedYear, week)
      calculateUserGrowthByPeriod('specific-week', selectedMonth, selectedYear, week)
    }
  }

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value)
    setSelectedMonth(month)
    if (timePeriod === 'specific-week') {
      calculateRevenueByPeriod(allOrders, 'specific-week', month, selectedYear, selectedWeek)
      calculateOrdersByCategory(allOrders, 'specific-week', month, selectedYear, selectedWeek)
      calculateUserGrowthByPeriod('specific-week', month, selectedYear, selectedWeek)
    } else if (timePeriod === 'specific-month') {
      calculateRevenueByPeriod(allOrders, 'specific-month', month, selectedYear)
      calculateOrdersByCategory(allOrders, 'specific-month', month, selectedYear)
      calculateUserGrowthByPeriod('specific-month', month, selectedYear)
    }
  }

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value)
    setSelectedYear(year)
    if (timePeriod === 'specific-week') {
      calculateRevenueByPeriod(allOrders, 'specific-week', selectedMonth, year, selectedWeek)
      calculateOrdersByCategory(allOrders, 'specific-week', selectedMonth, year, selectedWeek)
      calculateUserGrowthByPeriod('specific-week', selectedMonth, year, selectedWeek)
    } else if (timePeriod === 'specific-month') {
      calculateRevenueByPeriod(allOrders, 'specific-month', selectedMonth, year)
      calculateOrdersByCategory(allOrders, 'specific-month', selectedMonth, year)
      calculateUserGrowthByPeriod('specific-month', selectedMonth, year)
    } else if (timePeriod === 'specific-year') {
      calculateRevenueByPeriod(allOrders, 'specific-year', null, year)
      calculateOrdersByCategory(allOrders, 'specific-year', null, year)
      calculateUserGrowthByPeriod('specific-year', null, year)
    }
  }

  const calculateOrdersByCategory = (orders, period, month = null, year = null, week = null) => {
    // Filter orders based on time period
    let filteredOrders = orders
    const now = new Date()
    
    if (period === 'specific-week' && week && month && year) {
      const startDay = (week - 1) * 7 + 1
      const endDay = Math.min(week * 7, new Date(year, month, 0).getDate())
      filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        const day = orderDate.getDate()
        return day >= startDay && day <= endDay && 
               orderDate.getMonth() === month - 1 && 
               orderDate.getFullYear() === year
      })
    } else if (period === 'specific-month' && month && year) {
      filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate.getMonth() === month - 1 && orderDate.getFullYear() === year
      })
    } else if (period === 'specific-year' && year) {
      filteredOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate.getFullYear() === year
      })
    } else if (period === 'day') {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= sevenDaysAgo)
    } else if (period === 'week') {
      const eightWeeksAgo = new Date(now)
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= eightWeeksAgo)
    } else if (period === 'month') {
      const sixMonthsAgo = new Date(now)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= sixMonthsAgo)
    } else if (period === 'year') {
      const fiveYearsAgo = new Date(now)
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 4)
      filteredOrders = orders.filter(o => new Date(o.createdAt) >= fiveYearsAgo)
    }
    
    // Group orders by category
    const categoryMap = new Map()
    
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.product && item.product.category) {
            const categoryName = item.product.category.name || 'Khác'
            categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1)
          }
        })
      }
    })
    
    // Convert to array and sort by count
    const data = Array.from(categoryMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8) // Top 8 categories
    
    setOrderTrend(data)
  }

  const calculateUserGrowthByPeriod = (period, month = null, year = null, week = null) => {
    const users = stats.allUsers || []
    const now = new Date()
    let data = []
    
    if (period === 'specific-week' && week && month && year) {
      const startDay = (week - 1) * 7 + 1
      const endDay = Math.min(week * 7, new Date(year, month, 0).getDate())
      
      for (let day = startDay; day <= endDay; day++) {
        const currentDay = new Date(year, month - 1, day)
        const dayUsers = users.filter(u => {
          const userDate = new Date(u.createdAt)
          return userDate.getDate() === day && userDate.getMonth() === month - 1 && userDate.getFullYear() === year
        }).length
        const dayLabel = currentDay.toLocaleDateString('vi-VN', { weekday: 'short' })
        data.push({ label: dayLabel, value: dayUsers })
      }
    } else if (period === 'specific-month' && month && year) {
      const daysInMonth = new Date(year, month, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const dayUsers = users.filter(u => {
          const userDate = new Date(u.createdAt)
          return userDate.getDate() === day && 
                 userDate.getMonth() === month - 1 && 
                 userDate.getFullYear() === year
        }).length
        data.push({ label: `${day}`, value: dayUsers })
      }
    } else if (period === 'specific-year' && year) {
      for (let m = 1; m <= 12; m++) {
        const monthUsers = users.filter(u => {
          const userDate = new Date(u.createdAt)
          return userDate.getMonth() === m - 1 && userDate.getFullYear() === year
        }).length
        data.push({ label: `T${m}`, value: monthUsers })
      }
    } else if (period === 'day') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const shortLabel = date.toLocaleDateString('vi-VN', { weekday: 'short' })
        const dayUsers = users.filter(u => new Date(u.createdAt).toDateString() === date.toDateString()).length
        data.push({ label: shortLabel, value: dayUsers })
      }
    } else if (period === 'week') {
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now)
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const weekLabel = `T${8-i}`
        const weekUsers = users.filter(u => {
          const userDate = new Date(u.createdAt)
          return userDate >= weekStart && userDate <= weekEnd
        }).length
        data.push({ label: weekLabel, value: weekUsers })
      }
    } else if (period === 'month') {
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        const monthIndex = date.getMonth()
        const year = date.getFullYear()
        const monthUsers = users.filter(u => {
          const userDate = new Date(u.createdAt)
          return userDate.getMonth() === monthIndex && userDate.getFullYear() === year
        }).length
        data.push({ label: `T${monthIndex + 1}`, value: monthUsers })
      }
    } else if (period === 'year') {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i
        const yearUsers = users.filter(u => new Date(u.createdAt).getFullYear() === year).length
        data.push({ label: year.toString(), value: yearUsers })
      }
    }
    setUserGrowth(data)
  }

  const orderStatusData = [
    { label: 'Hoàn thành', value: stats.completedOrders, color: '#22c55e' },
    { label: 'Đang giao', value: stats.shippingOrders, color: '#3b82f6' },
    { label: 'Xử lý', value: stats.processingOrders, color: '#8b5cf6' },
    { label: 'Chờ duyệt', value: stats.pendingOrders, color: '#f59e0b' },
    { label: 'Đã hủy', value: stats.cancelledOrders, color: '#ef4444' }
  ]

  const formatCurrency = (value) => {
    return value.toLocaleString('vi-VN') + 'đ'
  }

  const handleExportReport = () => {
    const getTimePeriodLabel = () => {
      if (timePeriod === 'day') return '7 ngày gần nhất'
      if (timePeriod === 'week') return '8 tuần gần nhất'
      if (timePeriod === 'month') return '6 tháng gần nhất'
      if (timePeriod === 'year') return '5 năm gần nhất'
      if (timePeriod === 'specific-week') return `Tuần ${selectedWeek} - Tháng ${selectedMonth}/${selectedYear}`
      if (timePeriod === 'specific-month') return `Tháng ${selectedMonth}/${selectedYear}`
      return `Năm ${selectedYear}`
    }

    const formatCurrencyReport = (value) => {
      return (value || 0).toLocaleString('vi-VN') + 'đ'
    }

    const reportText = `
==============================================
           BÁO CÁO THỐNG KÊ
           GARDENX - CỬA HÀNG CÂY CẢNH
==============================================

Ngày xuất báo cáo: ${new Date().toLocaleString('vi-VN')}
Khoảng thời gian: ${getTimePeriodLabel()}

----------------------------------------------
TỔNG QUAN
----------------------------------------------
Tổng đơn hàng:        ${stats.totalOrders}
Tổng doanh thu:       ${formatCurrencyReport(stats.totalRevenue)}
Số sản phẩm:          ${stats.totalProducts}
Số khách hàng:        ${stats.totalUsers}

----------------------------------------------
TRẠNG THÁI ĐƠN HÀNG
----------------------------------------------
Hoàn thành:           ${stats.completedOrders} đơn
Đang giao:            ${stats.shippingOrders} đơn
Đang xử lý:           ${stats.processingOrders} đơn
Chờ duyệt:            ${stats.pendingOrders} đơn
Đã hủy:               ${stats.cancelledOrders} đơn

----------------------------------------------
DOANH THU THEO THỜI GIAN
----------------------------------------------
${revenueChartData.map(item => `${item.label.padEnd(15)} ${formatCurrencyReport(item.value)}`).join('\n')}

----------------------------------------------
ĐƠN HÀNG THEO DANH MỤC
----------------------------------------------
${orderTrend.map((item, i) => `${(i + 1).toString().padStart(2)}. ${item.label.padEnd(20)} ${item.value} đơn`).join('\n')}

----------------------------------------------
KHÁCH HÀNG MỚI
----------------------------------------------
${userGrowth.map(item => `${item.label.padEnd(15)} ${item.value} khách`).join('\n')}

==============================================
Báo cáo được tạo tự động bởi hệ thống GardenX
==============================================
    `.trim()

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `bao-cao-thong-ke-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <AdminLayout>
      <div className="stats-dashboard">
        {/* Header */}
        <div className="stats-header">
          <div className="stats-header-left">
            <h1>📊 Thống kê & Báo cáo</h1>
            <p>Tổng quan hoạt động kinh doanh của cửa hàng</p>
          </div>
          <div className="stats-header-right">
            <button className="export-btn" onClick={handleExportReport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Xuất báo cáo
            </button>
            <span className="stats-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Global Filter */}
        <div className="global-filter">
          <div className="filter-label">🔍 Bộ lọc thời gian:</div>
          <div className="filter-options">
            {['day', 'week', 'month', 'year', 'specific-week', 'specific-month', 'specific-year'].map(p => (
              <button 
                key={p}
                className={`filter-option-btn ${timePeriod === p ? 'active' : ''}`}
                onClick={() => handleTimePeriodChange(p)}
              >
                {p === 'day' ? 'Ngày' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : p === 'year' ? 'Năm' : p === 'specific-week' ? 'Lọc tuần' : p === 'specific-month' ? 'Lọc tháng' : 'Lọc năm'}
              </button>
            ))}
          </div>
          {(timePeriod === 'specific-week' || timePeriod === 'specific-month' || timePeriod === 'specific-year') && (
            <div className="date-range-selector">
              {timePeriod === 'specific-week' && (
                <>
                  <div className="date-input-group">
                    <label>Tháng:</label>
                    <select value={selectedMonth} onChange={handleMonthChange} className="month-year-select">
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="date-input-group">
                    <label>Tuần:</label>
                    <select value={selectedWeek} onChange={handleWeekChange} className="month-year-select">
                      {[1,2,3,4,5].map(w => (
                        <option key={w} value={w}>Tuần {w}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {timePeriod === 'specific-month' && (
                <div className="date-input-group">
                  <label>Tháng:</label>
                  <select value={selectedMonth} onChange={handleMonthChange} className="month-year-select">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>Tháng {m}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="date-input-group">
                <label>Năm:</label>
                <select value={selectedYear} onChange={handleYearChange} className="month-year-select">
                  {Array.from({length: 10}, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="stats-loading">
            <div className="spinner"></div>
            <span>Đang tải dữ liệu thống kê...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="stats-kpi-grid">
              <div className="kpi-card revenue">
                <div className="kpi-icon">💰</div>
                <div className="kpi-content">
                  <span className="kpi-label">Tổng doanh thu</span>
                  <span className="kpi-value">{stats.totalRevenue.toLocaleString()}đ</span>
                  <div className="kpi-sparkline">
                    <Sparkline data={revenueChartData.map(d => d.value)} color="#1a472a" />
                  </div>
                </div>
              </div>
              <div className="kpi-card orders">
                <div className="kpi-icon">📦</div>
                <div className="kpi-content">
                  <span className="kpi-label">Đơn hàng</span>
                  <span className="kpi-value">{stats.totalOrders}</span>
                  <span className="kpi-sub">{stats.pendingOrders} đang chờ xử lý</span>
                </div>
              </div>
              <div className="kpi-card products">
                <div className="kpi-icon">🌿</div>
                <div className="kpi-content">
                  <span className="kpi-label">Sản phẩm</span>
                  <span className="kpi-value">{stats.totalProducts}</span>
                  <span className="kpi-sub">Đang kinh doanh</span>
                </div>
              </div>
              <div className="kpi-card users">
                <div className="kpi-icon">👥</div>
                <div className="kpi-content">
                  <span className="kpi-label">Khách hàng</span>
                  <span className="kpi-value">{stats.totalUsers}</span>
                  <div className="kpi-sparkline">
                    <Sparkline data={userGrowth.map(d => d.value)} color="#10b981" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="stats-row">
              <div className="stats-card large">
                <div className="stats-card-header">
                  <h3>📈 Biểu đồ doanh thu</h3>
                </div>
                <LineChart data={revenueChartData} height={220} color="#4A90E2" />
                <div className="chart-summary">
                  <span>Tổng: <strong>{formatCurrency(revenueChartData.reduce((s, d) => s + d.value, 0))}</strong></span>
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>🎯 Trạng thái đơn hàng</h3>
                </div>
                <div className="donut-section">
                  <DonutChart data={orderStatusData} size={150} />
                  <div className="donut-legend">
                    {orderStatusData.map((item, i) => (
                      <div key={i} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="stats-row">
              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>📊 Số lượng đơn hàng</h3>
                </div>
                <BarChart data={orderTrend} height={200} />
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>👤 Khách hàng mới</h3>
                </div>
                <BarChart data={userGrowth} height={200} />
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>🗂️ Sản phẩm theo danh mục</h3>
                </div>
                <HorizontalBarChart data={categoryData} height={200} />
              </div>
            </div>

            {/* Charts Row 3 */}
            <div className="stats-row">
              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>⏰ Đơn hàng theo giờ</h3>
                </div>
                <BarChart data={hourlyData} height={180} />
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>📅 Đơn hàng theo ngày</h3>
                </div>
                <BarChart data={weekdayData} height={180} />
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>🎯 Hiệu suất tổng quan</h3>
                </div>
                <div className="radar-wrapper">
                  <RadarChart data={performanceData} size={180} />
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="stats-row">
              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>📈 Mục tiêu tháng này</h3>
                </div>
                <div className="progress-list">
                  <ProgressBar label="Doanh thu (triệu đ)" value={Math.round(stats.totalRevenue / 1000000)} max={50} color="#1a472a" />
                  <ProgressBar label="Đơn hàng hoàn thành" value={stats.completedOrders} max={100} color="#10b981" />
                  <ProgressBar label="Khách hàng mới" value={stats.totalUsers} max={50} color="#3b82f6" />
                  <ProgressBar label="Bài viết đăng" value={stats.totalArticles} max={20} color="#8b5cf6" />
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>⚡ Tỷ lệ hoàn thành</h3>
                </div>
                <div className="gauge-grid">
                  <GaugeChart 
                    value={stats.completedOrders} 
                    max={stats.totalOrders || 1} 
                    label="Đơn hoàn thành" 
                    color="#22c55e"
                  />
                  <GaugeChart 
                    value={stats.totalOrders - stats.cancelledOrders} 
                    max={stats.totalOrders || 1} 
                    label="Không hủy" 
                    color="#3b82f6"
                  />
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-card-header">
                  <h3>🏆 Top sản phẩm</h3>
                </div>
                <div className="top-products-list">
                  {topProducts.slice(0, 5).map((product, i) => (
                    <div key={product._id} className="top-product-item">
                      <span className="product-rank">#{i + 1}</span>
                      <img 
                        src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : '/images/placeholder.png'} 
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => e.target.src = '/images/placeholder.png'}
                      />
                      <span className="product-name">{product.name}</span>
                      <span className="product-price">{product.price?.toLocaleString()}đ</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="stats-row">
              <div className="stats-card full">
                <div className="stats-card-header">
                  <h3>🛒 Đơn hàng gần đây</h3>
                  <a href="/admin/orders" className="view-all-link">Xem tất cả →</a>
                </div>
                <div className="recent-orders-grid">
                  {recentOrders.map(order => (
                    <div key={order._id} className="recent-order-card">
                      <div className="order-header">
                        <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                        <span className={`order-status status-${order.status}`}>
                          {order.status === 'pending' ? 'Chờ duyệt' :
                           order.status === 'processing' ? 'Đang xử lý' :
                           order.status === 'shipping' ? 'Đang giao' :
                           order.status === 'delivered' ? 'Hoàn thành' : 'Đã hủy'}
                        </span>
                      </div>
                      <div className="order-customer">
                        <span>👤 {order.customerName || 'Khách hàng'}</span>
                      </div>
                      <div className="order-footer">
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                        <span className="order-total">{(order.total || 0).toLocaleString()}đ</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
