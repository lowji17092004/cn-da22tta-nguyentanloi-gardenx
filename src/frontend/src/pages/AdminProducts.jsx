import React, { useEffect, useState, useMemo } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

const CATEGORIES = {
  'hoa-kieng': 'Hoa kiểng',
  'cay-canh': 'Cây cảnh',
  'cay-thuy-canh': 'Cây thủy cảnh',
  'sen-da': 'Sen đá'
}

// Normalize category from old format to new slug format
const normalizeCategorySlug = (category) => {
  if (!category) return ''
  const normalized = category.toLowerCase().trim()
  // Map old formats to new slugs
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

export default function AdminProducts(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('table')
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null })

  const load = async ()=>{
    setLoading(true)
    try{ const res = await api.get('/products'); setItems(res.data) }catch(e){}
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      // Normalize category for comparison
      const normalizedItemCategory = normalizeCategorySlug(item.category)
      const matchCategory = !filterCategory || normalizedItemCategory === filterCategory
      const matchStock = !filterStock || 
        (filterStock === 'low' && item.stock < 10) ||
        (filterStock === 'out' && item.stock === 0) ||
        (filterStock === 'ok' && item.stock >= 10)
      return matchSearch && matchCategory && matchStock
    })

    result.sort((a, b) => {
      switch(sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'stock-asc': return a.stock - b.stock
        case 'stock-desc': return b.stock - a.stock
        default: return 0
      }
    })

    return result
  }, [items, searchTerm, filterCategory, filterStock, sortBy])

  // Count products by category
  const categoryCounts = useMemo(() => {
    const counts = {}
    items.forEach(item => {
      // Normalize category to slug format for counting
      const normalizedCat = normalizeCategorySlug(item.category)
      if (normalizedCat) {
        counts[normalizedCat] = (counts[normalizedCat] || 0) + 1
      }
    })
    return counts
  }, [items])

  // Count products by stock status
  const stockCounts = useMemo(() => {
    return {
      all: items.length,
      ok: items.filter(it => it.stock >= 10).length,
      low: items.filter(it => it.stock > 0 && it.stock < 10).length,
      out: items.filter(it => it.stock === 0).length
    }
  }, [items])

  const remove = async (item) => {
    setDeleteModal({ show: true, item })
  }

  const confirmDelete = async () => {
    if (!deleteModal.item) return
    try{ 
      await api.delete('/products/' + deleteModal.item._id)
      load()
      setDeleteModal({ show: false, item: null })
    }catch(e){ alert('Xóa thất bại') }
  }

  const removeAll = async () => {
    if (!confirm('⚠️ BẠN CHẮC CHẮN MUỐN XÓA TẤT CẢ SẢN PHẨM?\n\nHành động này không thể hoàn tác!')) return
    if (!confirm('Xác nhận lần cuối: Xóa TẤT CẢ sản phẩm?')) return
    try{ 
      await api.delete('/products'); 
      alert('Đã xóa tất cả sản phẩm thành công');
      load();
    }catch(e){ 
      alert('Xóa thất bại: ' + (e.response?.data?.message || e.message));
    }
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📦 Quản lý Sản phẩm</h1>
          <p className="admin-page-desc">Thêm, sửa, xóa và quản lý toàn bộ sản phẩm hoa kiểng</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button 
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('table')}
          >
            <span>📊 Table</span>
          </button>
          <button 
            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setViewMode('grid')}
          >
            <span>⊞ Grid</span>
          </button>
          <Link to="/admin/products/new">
            <button className="btn btn-primary">
              <span className="btn-icon">✨</span>
              <span>Thêm mới</span>
            </button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải sản phẩm...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📦</div>
          <h3>Chưa có sản phẩm nào</h3>
          <p>Hãy tạo sản phẩm đầu tiên của bạn</p>
          <Link to="/admin/products/new">
            <button className="btn btn-primary">
              <span className="btn-icon">✨</span>
              <span>Tạo sản phẩm mới</span>
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Category Quick Filters */}
          <div className="category-quick-filters">
            <button 
              className={`category-filter-btn ${!filterCategory ? 'active' : ''}`}
              onClick={() => setFilterCategory('')}
            >
              <span className="filter-label">Tất cả</span>
              <span className="filter-count">{items.length}</span>
            </button>
            <button 
              className={`category-filter-btn ${filterCategory === 'hoa-kieng' ? 'active' : ''}`}
              onClick={() => setFilterCategory('hoa-kieng')}
            >
              <span className="filter-label">Hoa kiểng</span>
              <span className="filter-count">{categoryCounts['hoa-kieng'] || 0}</span>
            </button>
            <button 
              className={`category-filter-btn ${filterCategory === 'cay-canh' ? 'active' : ''}`}
              onClick={() => setFilterCategory('cay-canh')}
            >
              <span className="filter-label">Cây cảnh</span>
              <span className="filter-count">{categoryCounts['cay-canh'] || 0}</span>
            </button>
            <button 
              className={`category-filter-btn ${filterCategory === 'cay-thuy-canh' ? 'active' : ''}`}
              onClick={() => setFilterCategory('cay-thuy-canh')}
            >
              <span className="filter-label">Cây thủy cảnh</span>
              <span className="filter-count">{categoryCounts['cay-thuy-canh'] || 0}</span>
            </button>
            <button 
              className={`category-filter-btn ${filterCategory === 'sen-da' ? 'active' : ''}`}
              onClick={() => setFilterCategory('sen-da')}
            >
              <span className="filter-label">Sen đá</span>
              <span className="filter-count">{categoryCounts['sen-da'] || 0}</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="admin-filter-bar">
            <div className="filter-search">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Tìm kiếm theo tên hoặc mô tả sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label-inline">Tồn kho:</label>
              <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="filter-select">
                <option value="">Tất cả ({stockCounts.all})</option>
                <option value="ok">Còn hàng ≥10 ({stockCounts.ok})</option>
                <option value="low">Sắp hết &lt;10 ({stockCounts.low})</option>
                <option value="out">Hết hàng ({stockCounts.out})</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label-inline">Sắp xếp:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
                <option value="name">Tên A-Z</option>
                <option value="price-asc">Giá: Thấp → Cao</option>
                <option value="price-desc">Giá: Cao → Thấp</option>
                <option value="stock-asc">Tồn kho: Thấp → Cao</option>
                <option value="stock-desc">Tồn kho: Cao → Thấp</option>
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Tổng sản phẩm</div>
                <div className="stat-value">{items.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <div className="stat-label">Tổng tồn kho</div>
                <div className="stat-value">{items.reduce((sum, it) => sum + (it.stock || 0), 0)}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Giá trị kho</div>
                <div className="stat-value">{(items.reduce((sum, it) => sum + (it.price * it.stock || 0), 0) / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>

          <div className="admin-results-info">
            <span>Hiển thị <strong>{filteredItems.length}</strong> / {items.length} sản phẩm</span>
          </div>

          {viewMode === 'table' ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(it => (
                    <tr key={it._id}>
                      <td>
                        <div className="table-image">
                          {it.images?.[0] ? (
                            <img src={it.images[0]} alt={it.name} />
                          ) : (
                            <div className="table-image-placeholder">🌸</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="table-product-info">
                          <div className="table-product-name">{it.name}</div>
                          <div className="table-product-desc">{it.description?.substring(0, 60)}{it.description?.length > 60 ? '...' : ''}</div>
                        </div>
                      </td>
                      <td>
                        {it.category ? (
                          <span className="table-category-badge">
                            {CATEGORIES[normalizeCategorySlug(it.category)] || it.category}
                          </span>
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td><strong className="table-price">{it.price?.toLocaleString('vi-VN')} ₫</strong></td>
                      <td>
                        <span className={`table-stock ${it.stock < 10 ? 'stock-low' : it.stock === 0 ? 'stock-out' : ''}`}>
                          {it.stock || 0}
                        </span>
                      </td>
                      <td>
                        {it.stock === 0 ? (
                          <span className="status-badge badge-danger">Hết hàng</span>
                        ) : it.stock < 10 ? (
                          <span className="status-badge badge-warning">Sắp hết</span>
                        ) : (
                          <span className="status-badge badge-success">Còn hàng</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/admin/products/${it._id}`}>
                            <button className="btn-icon-action" title="Chỉnh sửa">
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                            </button>
                          </Link>
                          <button onClick={()=>remove(it)} className="btn-icon-action danger" title="Xóa">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-grid">
              {filteredItems.map(it=> (
                <div key={it._id} className="admin-product-card">
                <div className="admin-product-image">
                  {it.images && it.images.length > 0 ? (
                    <img src={it.images[0]} alt={it.name} />
                  ) : it.imageUrl ? (
                    <img src={it.imageUrl} alt={it.name} />
                  ) : (
                    <div className="admin-product-placeholder">
                      <span className="placeholder-icon">🌸</span>
                    </div>
                  )}
                  {it.stock <= 5 && (
                    <span className="product-badge badge-warning">Sắp hết</span>
                  )}
                  {it.stock === 0 && (
                    <span className="product-badge badge-danger">Hết hàng</span>
                  )}
                </div>
                <div className="admin-product-body">
                  <h3 className="admin-product-name">{it.name}</h3>
                  <p className="admin-product-desc">{it.description || 'Chưa có mô tả'}</p>
                  <div className="admin-product-meta">
                    <div className="meta-item">
                      <span className="meta-label">Giá:</span>
                      <span className="admin-product-price">{it.price?.toLocaleString()} đ</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Kho:</span>
                      <span className={`admin-product-stock ${it.stock <= 5 ? 'stock-low' : ''}`}>
                        {it.stock || 0}
                      </span>
                    </div>
                    {it.category && (
                      <div className="meta-item">
                        <span className="product-category">
                          {CATEGORIES[normalizeCategorySlug(it.category)] || it.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-product-actions">
                  <Link to={`/admin/products/${it._id}`}>
                    <button className="btn btn-secondary btn-sm">
                      <span className="btn-icon">✏️</span>
                      <span>Sửa</span>
                    </button>
                  </Link>
                  <button onClick={()=>remove(it)} className="btn btn-danger btn-sm">
                    <span className="btn-icon">🗑️</span>
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, item: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, item: null })}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteModal.item?.name}</strong>?</p>
              <p className="text-muted">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteModal({ show: false, item: null })}>Hủy</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Xóa sản phẩm</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
