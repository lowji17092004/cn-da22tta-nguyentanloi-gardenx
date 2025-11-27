import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import AdminLayout from '../components/AdminLayout'

const CATEGORIES = [
  { slug: 'hoa-kieng', name: 'Hoa kiểng', color: '#ec4899' },
  { slug: 'cay-canh', name: 'Cây cảnh', color: '#10b981' },
  { slug: 'cay-thuy-canh', name: 'Cây thủy cảnh', color: '#3b82f6' },
  { slug: 'sen-da', name: 'Sen đá', color: '#8b5cf6' }
]

const normalizeCategorySlug = (category) => {
  if (!category) return ''
  const normalized = category.toLowerCase().trim()
  const mapping = {
    'hoa kiểng': 'hoa-kieng',
    'cây cảnh': 'cay-canh',
    'cay canh': 'cay-canh',
    'cây thủy cảnh': 'cay-thuy-canh',
    'cay thuy canh': 'cay-thuy-canh',
    'sen đá': 'sen-da',
    'sen da': 'sen-da'
  }
  return mapping[normalized] || category
}

export default function AdminCategories() {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await api.get('/products')
      const allProducts = res.data
      setProducts(allProducts)

      // Tính toán thống kê
      const categoryStats = CATEGORIES.map(cat => {
        const count = allProducts.filter(p => {
          const normalized = normalizeCategorySlug(p.category)
          return normalized === cat.slug
        }).length
        
        const totalStock = allProducts
          .filter(p => normalizeCategorySlug(p.category) === cat.slug)
          .reduce((sum, p) => sum + (p.stock || 0), 0)

        return {
          ...cat,
          productCount: count,
          totalStock: totalStock
        }
      })

      setStats(categoryStats)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalProducts = stats.reduce((sum, cat) => sum + cat.productCount, 0)
  const totalStock = stats.reduce((sum, cat) => sum + cat.totalStock, 0)

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Danh mục</h1>
          <p className="admin-page-desc">Thống kê và phân tích sản phẩm theo 4 danh mục chính</p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : (
        <>
          {/* Tổng quan */}
          <div className="category-stats-overview">
            <div className="stat-card stat-primary">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{CATEGORIES.length}</div>
                <div className="stat-label">Danh mục</div>
              </div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalProducts}</div>
                <div className="stat-label">Sản phẩm</div>
              </div>
            </div>
            <div className="stat-card stat-info">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">{totalStock}</div>
                <div className="stat-label">Tồn kho</div>
              </div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {CATEGORIES.length > 0 ? Math.round(totalProducts / CATEGORIES.length) : 0}
                </div>
                <div className="stat-label">TB/Danh mục</div>
              </div>
            </div>
          </div>

          {/* Danh sách danh mục */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Danh sách danh mục</h2>
              <span className="admin-badge">{stats.length} danh mục</span>
            </div>
            <div className="category-list">
              {stats.map(cat => {
                const percentage = totalProducts > 0 
                  ? ((cat.productCount / totalProducts) * 100).toFixed(1)
                  : 0

                return (
                  <div key={cat.slug} className="category-item">
                    <div className="category-main">
                      <div className="category-icon-wrapper" style={{background: 'var(--background)', border: '1px solid var(--border)'}}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div className="category-details">
                        <div className="category-title">
                          <h3>{cat.name}</h3>
                          <span className="category-code">{cat.slug}</span>
                        </div>
                        <div className="category-metrics">
                          <div className="metric">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="metric-text">{cat.productCount} sản phẩm</span>
                          </div>
                          <div className="metric">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="metric-text">{cat.totalStock} tồn kho</span>
                          </div>
                          <div className="metric">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="metric-text">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="category-progress-wrapper">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{
                            width: `${percentage}%`,
                            background: cat.color
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="category-action">
                      <Link 
                        to={`/shop?category=${cat.slug}`} 
                        className="btn-view"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Xem
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}
