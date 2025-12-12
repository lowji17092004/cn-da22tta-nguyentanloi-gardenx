import React, { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { normalizeCategorySlug, matchesSearchTerm } from '../utils/searchUtils'
import './AdminProducts.css'

export default function AdminProducts(){
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('table')
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null })

  // pagination (client-side)
  const [page, setPage] = useState(1)
  const perPage = 12

  // load products
  const load = useCallback(async ()=>{
    setLoading(true)
    try{
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories?type=product')
      ])
      setItems(Array.isArray(productsRes.data) ? productsRes.data : [])
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
    }catch(e){
      console.error('Load products failed', e)
    }finally{
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // debounce search term for better performance
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 250)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Derived filtered + sorted items
  const filteredItems = useMemo(() => {
    let result = items.filter(item => {
      // Search with Vietnamese accent support
      const matchSearch = !debouncedSearch || 
        matchesSearchTerm(item.name, debouncedSearch) || 
        matchesSearchTerm(item.description, debouncedSearch)

      // Exact category match
      const normalizedItemCategory = normalizeCategorySlug(item.category)
      const matchCategory = !filterCategory || normalizedItemCategory === filterCategory

      // Stock filter
      const stock = Number(item.stock || 0)
      const matchStock = !filterStock || (
        (filterStock === 'low' && stock > 0 && stock < 10) ||
        (filterStock === 'out' && stock === 0) ||
        (filterStock === 'ok' && stock >= 10)
      )

      return matchSearch && matchCategory && matchStock
    })

    result.sort((a,b) => {
      switch(sortBy){
        case 'name': return String(a.name || '').localeCompare(String(b.name || ''))
        case 'price-asc': return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price-desc': return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'stock-asc': return (Number(a.stock) || 0) - (Number(b.stock) || 0)
        case 'stock-desc': return (Number(b.stock) || 0) - (Number(a.stock) || 0)
        default: return 0
      }
    })

    return result
  }, [items, debouncedSearch, filterCategory, filterStock, sortBy])

  // pagination helpers
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / perPage))
  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [totalPages, page])
  const pagedItems = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredItems.slice(start, start + perPage)
  }, [filteredItems, page])

  // counts
  const categoryCounts = useMemo(() => {
    const counts = {}
    items.forEach(item => {
      const slug = normalizeCategorySlug(item.category)
      if (slug) counts[slug] = (counts[slug] || 0) + 1
    })
    return counts
  }, [items])

  const stockCounts = useMemo(() => {
    const all = items.length
    const ok = items.filter(it => Number(it.stock || 0) >= 10).length
    const low = items.filter(it => Number(it.stock || 0) > 0 && Number(it.stock) < 10).length
    const out = items.filter(it => Number(it.stock || 0) === 0).length
    return { all, ok, low, out }
  }, [items])

  // Get category and subcategory display names
  const getCategoryDisplay = useCallback((item) => {
    const cat = categories.find(c => c.slug === normalizeCategorySlug(item.category))
    const catName = cat?.name || item.category || '-'
    
    if (item.subcategory) {
      const sub = cat?.subcategories?.find(s => s.slug === item.subcategory)
      const subName = sub?.name || item.subcategory
      return { category: catName, subcategory: subName }
    }
    
    return { category: catName, subcategory: null }
  }, [categories])
  const confirmDelete = useCallback(async () => {
    const item = deleteModal.item
    if (!item) return
    try{
      await api.delete('/products/' + item._id)
      setItems(prev => prev.filter(p => p._id !== item._id))
      setDeleteModal({ show: false, item: null })
    }catch(e){
      console.error('Delete failed', e)
      alert('Xóa thất bại')
    }
  }, [deleteModal])

  const remove = useCallback((item) => {
    setDeleteModal({ show: true, item })
  }, [])

  // remove all (server endpoint must support it) - keep confirmation
  const removeAll = useCallback(async () => {
    if (!window.confirm('BẠN CHẮC CHẮN MUỐN XÓA TẤT CẢ SẢN PHẨM? Hành động này không thể hoàn tác!')) return
    try{
      await api.delete('/products')
      setItems([])
      alert('Đã xóa tất cả sản phẩm thành công')
    }catch(e){
      console.error('Remove all failed', e)
      alert('Xóa thất bại: ' + (e.response?.data?.message || e.message))
    }
  }, [])

  // small helpers
  const formatCurrency = useCallback((v) => {
    const n = Number(v || 0)
    return n.toLocaleString('vi-VN') + ' ₫'
  }, [])

  return (
    <AdminLayout>
      <div className="ap-page">
        {loading ? (
          <div className="ap-loading">
            <div className="ap-spinner" />
            <span>Đang tải sản phẩm...</span>
          </div>
        ) : (
          <>
            <div className="ap-hero">
              <div className="ap-hero-content">
                <div className="ap-hero-icon">
                  <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h1>Quản lý Sản phẩm</h1>
                  <p>Thêm, sửa, xóa và quản lý toàn bộ sản phẩm hoa kiểng</p>
                </div>
              </div>
              <Link to="/admin/products/new">
                <button className="ap-btn-add">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Thêm sản phẩm mới</span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="ap-stats">
              <div className="ap-stat-card">
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{items.length}</div>
                  <div className="ap-stat-label">Tổng sản phẩm</div>
                </div>
              </div>

              <div className="ap-stat-card">
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{stockCounts.low + stockCounts.out}</div>
                  <div className="ap-stat-label">Sắp hết/Hết hàng</div>
                </div>
              </div>

              <div className="ap-stat-card">
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{(items.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.stock) || 0)), 0) / 1000000).toFixed(1)}M</div>
                  <div className="ap-stat-label">Giá trị kho hàng</div>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="ap-empty">
                <div className="ap-empty-icon">
                  <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3>Chưa có sản phẩm nào</h3>
                <p>Hãy tạo sản phẩm đầu tiên của bạn để bắt đầu bán hàng</p>
                <Link to="/admin/products/new">
                  <button className="btn btn-primary" style={{marginTop: '16px'}}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Tạo sản phẩm mới</span>
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="ap-toolbar">
                  <div className="ap-view-toggle">
                    <button className={`ap-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>Table</span>
                    </button>
                    <button className={`ap-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      <span>Grid</span>
                    </button>
                  </div>
                </div>

                <div className="ap-category-tabs">
                  <button className={`ap-category-tab ${!filterCategory ? 'active' : ''}`} onClick={() => setFilterCategory('')}>
                    <span className="tab-label">Tất cả</span>
                    <span className="tab-count">{items.length}</span>
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat._id}
                      className={`ap-category-tab ${filterCategory === cat.slug ? 'active' : ''}`} 
                      onClick={() => setFilterCategory(cat.slug)}
                    >
                      <span className="tab-label">{cat.name}</span>
                      <span className="tab-count">{categoryCounts[cat.slug] || 0}</span>
                    </button>
                  ))}
                </div>

                <div className="ap-filters">
                  <div className="ap-search-box">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="search" placeholder="Tìm kiếm theo tên hoặc mô tả sản phẩm..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }} />
                  </div>

                  <div className="ap-filter-group">
                    <label>Tồn kho:</label>
                    <select value={filterStock} onChange={(e) => { setFilterStock(e.target.value); setPage(1) }}>
                      <option value="">Tất cả ({stockCounts.all})</option>
                      <option value="ok">Còn hàng ≥10 ({stockCounts.ok})</option>
                      <option value="low">Sắp hết &lt;10 ({stockCounts.low})</option>
                      <option value="out">Hết hàng ({stockCounts.out})</option>
                    </select>
                  </div>

                  <div className="ap-filter-group">
                    <label>Sắp xếp:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="name">Tên A-Z</option>
                      <option value="price-asc">Giá: Thấp → Cao</option>
                      <option value="price-desc">Giá: Cao → Thấp</option>
                      <option value="stock-asc">Tồn kho: Thấp → Cao</option>
                      <option value="stock-desc">Tồn kho: Cao → Thấp</option>
                    </select>
                  </div>
                </div>

                <div className="ap-results-info">
                  <span>Hiển thị <strong>{filteredItems.length}</strong> / {items.length} sản phẩm</span>
                </div>

                {viewMode === 'table' ? (
                  <div className="ap-table-wrapper">
                    <table className="ap-table">
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
                        {pagedItems.map(it => (
                          <tr key={it._id}>
                            <td>
                              <div className="ap-table-image">
                                {it.images?.[0] ? (
                                  <img src={it.images[0]} alt={it.name} />
                                ) : (
                                  <div className="ap-image-placeholder">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="ap-product-info">
                                <div className="ap-product-name">{it.name}</div>
                                <div className="ap-product-desc">{it.description?.substring(0, 50)}{it.description?.length > 50 ? '...' : ''}</div>
                              </div>
                            </td>
                            <td>
                              {it.category ? (
                                <div className="ap-category-cell">
                                  <span className="ap-category-badge">
                                    {getCategoryDisplay(it).category}
                                  </span>
                                  {getCategoryDisplay(it).subcategory && (
                                    <span className="ap-subcategory-badge">
                                      {getCategoryDisplay(it).subcategory}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">Chưa có</span>
                              )}
                            </td>
                            <td><strong className="ap-price">{formatCurrency(it.price)}</strong></td>
                            <td>
                              <span className={`ap-stock-badge ${Number(it.stock) === 0 ? 'out' : Number(it.stock) < 10 ? 'low' : 'ok'}`}>
                                {Number(it.stock) || 0}
                              </span>
                            </td>
                            <td>
                              {Number(it.stock) === 0 ? (
                                <span className="ap-status-badge danger">Hết hàng</span>
                              ) : Number(it.stock) < 10 ? (
                                <span className="ap-status-badge warning">Sắp hết</span>
                              ) : (
                                <span className="ap-status-badge success">Còn hàng</span>
                              )}
                            </td>
                            <td>
                              <div className="ap-table-actions">
                                <Link to={`/admin/products/${it._id}`}>
                                  <button className="ap-action-btn edit" title="Chỉnh sửa">
                                    <svg width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{display:'block'}}>
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                  </button>
                                </Link>
                                <button onClick={()=>remove(it)} className="ap-action-btn delete" title="Xóa">
                                  <svg width="18" height="18" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{display:'block'}}>
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* pagination */}
                    <div className="ap-pagination">
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
                      <span>Trang {page} / {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
                    </div>
                  </div>
                ) : (
                  <div className="ap-grid">
                    {pagedItems.map(it => (
                      <div key={it._id} className="ap-product-card">
                        <div className="ap-card-image">
                          {it.images && it.images.length > 0 ? (
                            <img src={it.images[0]} alt={it.name} />
                          ) : it.imageUrl ? (
                            <img src={it.imageUrl} alt={it.name} />
                          ) : (
                            <div className="ap-card-placeholder">
                              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          {Number(it.stock) <= 5 && Number(it.stock) > 0 && (
                            <span className="ap-card-badge warning">Sắp hết</span>
                          )}
                          {Number(it.stock) === 0 && (
                            <span className="ap-card-badge danger">Hết hàng</span>
                          )}
                        </div>

                        <div className="ap-card-body">
                          <h3 className="ap-card-title">{it.name}</h3>
                          <p className="ap-card-desc">{it.description?.substring(0, 60) || 'Chưa có mô tả'}{it.description?.length > 60 ? '...' : ''}</p>
                          <div className="ap-card-meta">
                            <div className="meta-row">
                              <span className="meta-label">Giá:</span>
                              <span className="meta-value price">{formatCurrency(it.price)}</span>
                            </div>
                            <div className="meta-row">
                              <span className="meta-label">Kho:</span>
                              <span className={`meta-value stock ${Number(it.stock) <= 5 ? 'low' : ''}`}>{Number(it.stock) || 0}</span>
                            </div>
                            {it.category && (
                              <div className="meta-row">
                                <div className="ap-card-categories">
                                  <span className="ap-card-category">
                                    {getCategoryDisplay(it).category}
                                  </span>
                                  {getCategoryDisplay(it).subcategory && (
                                    <span className="ap-card-subcategory">
                                      {getCategoryDisplay(it).subcategory}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="ap-card-actions">
                            <Link to={`/admin/products/${it._id}`}>
                              <button className="ap-btn-secondary">
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Sửa</span>
                              </button>
                            </Link>
                            <button onClick={()=>remove(it)} className="ap-btn-danger">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Xóa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* pagination grid */}
                    <div className="ap-pagination">
                      <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
                      <span>Trang {page} / {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="ap-modal-overlay" onClick={() => setDeleteModal({ show: false, item: null })}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="ap-modal-close" onClick={() => setDeleteModal({ show: false, item: null })}>×</button>
            </div>
            <div className="ap-modal-body">
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteModal.item?.name}</strong>?</p>
              <p className="text-muted">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="ap-modal-footer">
              <button className="ap-btn-ghost" onClick={() => setDeleteModal({ show: false, item: null })}>
                Hủy
              </button>
              <button className="ap-btn-danger-modal" onClick={confirmDelete}>
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

     