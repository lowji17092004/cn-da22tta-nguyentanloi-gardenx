import React, { useEffect, useState, useMemo, useCallback } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import Toast from '../components/Toast'
import { normalizeCategorySlug, matchesSearchTerm } from '../utils/searchUtils'
import { getCategoryDisplayName } from '../utils/categoryUtils'
import './AdminProducts.css'

export default function AdminProducts(){
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStock, setFilterStock] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('all') // all, visible, hidden
  const [filterSpecial, setFilterSpecial] = useState('') // bestseller, new, featured
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('table')
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null })
  const [toast, setToast] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // pagination (client-side)
  const [page, setPage] = useState(1)
  const perPage = 12

  // load products (including hidden for admin)
  const load = useCallback(async ()=>{
    setLoading(true)
    try{
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products?includeHidden=true'),
        api.get('/categories?type=product')
      ])
      const products = Array.isArray(productsRes.data) ? productsRes.data : []
      setItems(products)
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : [])
      setLastUpdated(new Date())
      
      // Build notifications based on stock status
      const newNotifications = []
      const outOfStock = products.filter(p => Number(p.stock || 0) === 0)
      const lowStock = products.filter(p => Number(p.stock || 0) > 0 && Number(p.stock) < 10)
      
      if (outOfStock.length > 0) {
        newNotifications.push({
          type: 'danger',
          icon: '🚫',
          title: `${outOfStock.length} sản phẩm hết hàng`,
          message: outOfStock.slice(0, 3).map(p => p.name).join(', ') + (outOfStock.length > 3 ? '...' : '')
        })
      }
      if (lowStock.length > 0) {
        newNotifications.push({
          type: 'warning',
          icon: '⚠️',
          title: `${lowStock.length} sản phẩm sắp hết hàng`,
          message: lowStock.slice(0, 3).map(p => `${p.name} (còn ${p.stock})`).join(', ') + (lowStock.length > 3 ? '...' : '')
        })
      }
      setNotifications(newNotifications)
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

      // Visibility filter
      const matchVisibility = filterVisibility === 'all' || 
        (filterVisibility === 'visible' && !item.isHidden) ||
        (filterVisibility === 'hidden' && item.isHidden)

      // Special filter (bestseller, new, featured)
      const sold = Number(item.sold || 0)
      const isNew = new Date() - new Date(item.createdAt) < 7 * 24 * 60 * 60 * 1000 // 7 days
      const matchSpecial = !filterSpecial || 
        (filterSpecial === 'bestseller' && sold >= 10) ||
        (filterSpecial === 'new' && isNew) ||
        (filterSpecial === 'featured' && item.isFeatured)

      return matchSearch && matchCategory && matchStock && matchVisibility && matchSpecial
    })

    result.sort((a,b) => {
      switch(sortBy){
        case 'name': return String(a.name || '').localeCompare(String(b.name || ''))
        case 'price-asc': return (Number(a.price) || 0) - (Number(b.price) || 0)
        case 'price-desc': return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'stock-asc': return (Number(a.stock) || 0) - (Number(b.stock) || 0)
        case 'stock-desc': return (Number(b.stock) || 0) - (Number(a.stock) || 0)
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        default: return 0
      }
    })

    return result
  }, [items, debouncedSearch, filterCategory, filterStock, filterVisibility, filterSpecial, sortBy])

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

    // Build map of known slugs -> parent category slug (from categories state)
    const parentMap = {}
    categories.forEach(cat => {
      const catSlug = cat.slug
      parentMap[normalizeCategorySlug(catSlug)] = catSlug
      cat.subcategories?.forEach(sub => {
        parentMap[normalizeCategorySlug(sub.slug)] = catSlug
        parentMap[normalizeCategorySlug(sub.name || '')] = catSlug
      })
      // also map display name (no-diacritics)
      parentMap[normalizeCategorySlug(cat.name || '')] = catSlug
    })

    items.forEach(item => {
      // Try to determine the main category slug for this item
      const itemCat = normalizeCategorySlug(item.category || '')
      const itemSub = normalizeCategorySlug(item.subcategory || '')

      let mainSlug = null
      if (parentMap[itemCat]) mainSlug = parentMap[itemCat]
      else if (parentMap[itemSub]) mainSlug = parentMap[itemSub]
      else if (itemCat) mainSlug = itemCat
      else if (itemSub) mainSlug = itemSub

      if (mainSlug) counts[mainSlug] = (counts[mainSlug] || 0) + 1
    })

    return counts
  }, [items])

  const stockCounts = useMemo(() => {
    const all = items.length
    const ok = items.filter(it => Number(it.stock || 0) >= 10).length
    const low = items.filter(it => Number(it.stock || 0) > 0 && Number(it.stock) < 10).length
    const out = items.filter(it => Number(it.stock || 0) === 0).length
    const visible = items.filter(it => !it.isHidden).length
    const hidden = items.filter(it => it.isHidden).length
    const bestseller = items.filter(it => Number(it.sold || 0) >= 10).length
    const newProducts = items.filter(it => new Date() - new Date(it.createdAt) < 7 * 24 * 60 * 60 * 1000).length
    const featured = items.filter(it => it.isFeatured).length
    return { all, ok, low, out, visible, hidden, bestseller, newProducts, featured }
  }, [items])

  // Get category and subcategory display names
  const getCategoryDisplay = useCallback((item) => {
    const cat = categories.find(c => c.slug === normalizeCategorySlug(item.category))
    const catName = cat?.name || getCategoryDisplayName(item.category) || '-'
    
    if (item.subcategory) {
      const sub = cat?.subcategories?.find(s => s.slug === item.subcategory)
      const subName = sub?.name || getCategoryDisplayName(item.subcategory)
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
      showToast('Xóa sản phẩm thành công', 'success')
    }catch(e){
      console.error('Delete failed', e)
      showToast('Xóa sản phẩm thất bại', 'error')
    }
  }, [deleteModal, showToast])

  const toggleVisibility = useCallback(async (item) => {
    try {
      const res = await api.patch(`/products/${item._id}/toggle-visibility`)
      setItems(prev => prev.map(p => 
        p._id === item._id ? { ...p, isHidden: res.data.isHidden } : p
      ))
      showToast(res.data.isHidden ? 'Đã ẩn sản phẩm' : 'Đã hiện sản phẩm', 'success')
    } catch(e) {
      console.error('Toggle visibility failed', e)
      showToast('Không thể thay đổi trạng thái hiển thị', 'error')
    }
  }, [showToast])

  const remove = useCallback((item) => {
    setDeleteModal({ show: true, item })
  }, [])

  // remove all (server endpoint must support it) - keep confirmation
  const removeAll = useCallback(async () => {
    if (!window.confirm('BẠN CHẮC CHẮN MUỐN XÓA TẤT CẢ SẢN PHẨM? Hành động này không thể hoàn tác!')) return
    try{
      await api.delete('/products')
      setItems([])
      showToast('Đã xóa tất cả sản phẩm thành công', 'success')
    }catch(e){
      console.error('Remove all failed', e)
      showToast('Xóa thất bại: ' + (e.response?.data?.message || e.message), 'error')
    }
  }, [showToast])

  // small helpers
  const formatCurrency = useCallback((v) => {
    const n = Number(v || 0)
    return n.toLocaleString('vi-VN') + ' ₫'
  }, [])

  // Get product image URL with proper path
  const getImageUrl = useCallback((item) => {
    if (item.images?.[0]) {
      if (item.images[0].startsWith('http')) return item.images[0]
      return `http://localhost:5000${item.images[0]}`
    }
    if (item.imageUrl) {
      if (item.imageUrl.startsWith('http')) return item.imageUrl
      return `http://localhost:5000${item.imageUrl}`
    }
    return null
  }, [])

  // Check if product is bestseller (sold >= 10)
  const isBestseller = useCallback((item) => {
    return Number(item.sold || 0) >= 10
  }, [])

  // Check if product is new (created within 7 days)
  const isNewProduct = useCallback((item) => {
    return new Date() - new Date(item.createdAt) < 7 * 24 * 60 * 60 * 1000
  }, [])

  // Handle stat card click to filter
  const handleStatClick = useCallback((type) => {
    setFilterStock('')
    setFilterSpecial('')
    setPage(1)
    
    switch(type) {
      case 'all':
        break
      case 'low':
      case 'out':
        setFilterStock(type)
        break
      case 'bestseller':
      case 'new':
      case 'featured':
        setFilterSpecial(type)
        break
      default:
        break
    }
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

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="ap-notifications">
                {notifications.map((notif, idx) => (
                  <div key={idx} className={`ap-notification ap-notification-${notif.type}`}>
                    <span className="ap-notification-icon">{notif.icon}</span>
                    <div className="ap-notification-content">
                      <strong>{notif.title}</strong>
                      <span>{notif.message}</span>
                    </div>
                    <button className="ap-notification-close" onClick={() => setNotifications(prev => prev.filter((_, i) => i !== idx))}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Stats - Clickable */}
            <div className="ap-stats">
              <div className={`ap-stat-card ap-stat-clickable ${!filterStock && !filterSpecial ? 'active' : ''}`} onClick={() => handleStatClick('all')}>
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #1a472a 0%, #2d7a4a 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{items.length}</div>
                  <div className="ap-stat-label">Tổng sản phẩm</div>
                </div>
              </div>

              <div className={`ap-stat-card ap-stat-clickable ${filterStock === 'low' || filterStock === 'out' ? 'active' : ''}`} onClick={() => handleStatClick('low')}>
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{stockCounts.low + stockCounts.out}</div>
                  <div className="ap-stat-label">Sắp hết/Hết hàng</div>
                </div>
                {(stockCounts.low + stockCounts.out > 0) && <span className="ap-stat-alert">!</span>}
              </div>

              <div className={`ap-stat-card ap-stat-clickable ${filterSpecial === 'bestseller' ? 'active' : ''}`} onClick={() => handleStatClick('bestseller')}>
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{stockCounts.bestseller}</div>
                  <div className="ap-stat-label">Bán chạy</div>
                </div>
              </div>

              <div className={`ap-stat-card ap-stat-clickable ${filterSpecial === 'new' ? 'active' : ''}`} onClick={() => handleStatClick('new')}>
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{stockCounts.newProducts}</div>
                  <div className="ap-stat-label">Mới (7 ngày)</div>
                </div>
              </div>

              <div className={`ap-stat-card ap-stat-clickable`} onClick={() => handleStatClick('out')}>
                <div className="ap-stat-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
                  <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ap-stat-content">
                  <div className="ap-stat-value">{items.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.stock) || 0)), 0).toLocaleString('vi-VN')}đ</div>
                  <div className="ap-stat-label">Giá trị kho hàng</div>
                </div>
              </div>

              {lastUpdated && (
                <div className="ap-last-updated">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}</span>
                  <button className="ap-refresh-btn" onClick={load} title="Làm mới dữ liệu">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="refresh-text">↻ Tải lại</span>
                  </button>
                </div>
              )}
            </div>

            {/* Active Filter Indicator */}
            {(filterStock || filterSpecial) && (
              <div className="ap-active-filter">
                <span className="ap-filter-label">
                  Đang lọc: 
                  <strong>
                    {filterStock === 'low' && ' Sắp hết hàng'}
                    {filterStock === 'out' && ' Hết hàng'}
                    {filterSpecial === 'bestseller' && ' Bán chạy'}
                    {filterSpecial === 'new' && ' Sản phẩm mới'}
                    {filterSpecial === 'featured' && ' Nổi bật'}
                  </strong>
                  ({filteredItems.length} sản phẩm)
                </span>
                <button className="ap-clear-filter" onClick={() => { setFilterStock(''); setFilterSpecial(''); }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa bộ lọc
                </button>
              </div>
            )}

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
                    <label>Hiển thị:</label>
                    <select value={filterVisibility} onChange={(e) => { setFilterVisibility(e.target.value); setPage(1) }}>
                      <option value="all">Tất cả ({stockCounts.all})</option>
                      <option value="visible">Đang hiện ({stockCounts.visible})</option>
                      <option value="hidden">Đã ẩn ({stockCounts.hidden})</option>
                    </select>
                  </div>

                  <div className="ap-filter-group">
                    <label>Sắp xếp:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="name">Tên A-Z</option>
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
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
                          <tr key={it._id} className={it.isHidden ? 'ap-row-hidden' : ''}>
                            <td>
                              <div className="ap-table-image">
                                {getImageUrl(it) ? (
                                  <img src={getImageUrl(it)} alt={it.name} onError={(e) => e.target.style.display = 'none'} />
                                ) : (
                                  <div className="ap-image-placeholder">
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                )}
                                {/* Product Status Badges */}
                                <div className="ap-image-badges">
                                  {isBestseller(it) && <span className="ap-img-badge bestseller" title="Bán chạy">🔥</span>}
                                  {isNewProduct(it) && !isBestseller(it) && <span className="ap-img-badge new" title="Mới">✨</span>}
                                  {Number(it.stock) > 0 && Number(it.stock) < 10 && <span className="ap-img-badge low-stock" title="Sắp hết">⚠️</span>}
                                  {Number(it.stock) === 0 && <span className="ap-img-badge out-stock" title="Hết hàng">🚫</span>}
                                  {it.featured && <span className="ap-img-badge featured" title="Nổi bật">⭐</span>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="ap-product-info">
                                <Link to={`/product/${it._id}`} className="ap-product-name" style={{textDecoration: 'none', color: 'inherit', cursor: 'pointer'}}>
                                  <div className="ap-product-name">
                                    {it.name}
                                    {isBestseller(it) && <span className="ap-bestseller-text">Bán chạy</span>}
                                  </div>
                                </Link>
                                <div className="ap-product-desc">{it.description?.substring(0, 50)}{it.description?.length > 50 ? '...' : ''}</div>
                                {it.sold > 0 && <div className="ap-product-sold">Đã bán: {it.sold}</div>}
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
                              <div className="ap-stock-cell">
                                <span className={`ap-stock-badge ${Number(it.stock) === 0 ? 'out' : Number(it.stock) < 10 ? 'low' : 'ok'}`}>
                                  {Number(it.stock) === 0 ? (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                  ) : Number(it.stock) < 10 ? (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                  ) : (
                                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                  <span>{Number(it.stock) || 0}</span>
                                </span>
                              </div>
                            </td>
                            <td>
                              {it.isHidden ? (
                                <span className="ap-status-badge muted">Đã ẩn</span>
                              ) : Number(it.stock) === 0 ? (
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
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                </Link>
                                <button 
                                  onClick={() => toggleVisibility(it)} 
                                  className={`ap-action-btn ${it.isHidden ? 'show' : 'hide'}`} 
                                  title={it.isHidden ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}
                                >
                                  {it.isHidden ? (
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                  ) : (
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  )}
                                </button>
                                <button onClick={()=>remove(it)} className="ap-action-btn delete" title="Xóa">
                                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                      <div key={it._id} className={`ap-product-card ${it.isHidden ? 'ap-card-hidden' : ''}`}>
                        <div className="ap-card-image">
                          {getImageUrl(it) ? (
                            <img src={getImageUrl(it)} alt={it.name} onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            <div className="ap-card-placeholder">
                              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          {/* Product Status Badges */}
                          <div className="ap-card-badges">
                            {isBestseller(it) && (
                              <span className="ap-card-badge bestseller">🔥 Bán chạy</span>
                            )}
                            {isNewProduct(it) && !isBestseller(it) && (
                              <span className="ap-card-badge new">✨ Mới</span>
                            )}
                            {!isBestseller(it) && !isNewProduct(it) && Number(it.stock) <= 5 && Number(it.stock) > 0 && (
                              <span className="ap-card-badge warning">⚠️ Sắp hết</span>
                            )}
                            {Number(it.stock) === 0 && (
                              <span className="ap-card-badge danger">🚫 Hết hàng</span>
                            )}
                            {it.featured && (
                              <span className="ap-card-badge featured">⭐ Nổi bật</span>
                            )}
                          </div>
                          {it.isHidden && (
                            <span className="ap-card-badge hidden">👁️ Đang ẩn</span>
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
                              <span className={`meta-value stock ${Number(it.stock) === 0 ? 'out' : Number(it.stock) <= 5 ? 'low' : ''}`}>{Number(it.stock) || 0}</span>
                            </div>
                            {it.sold > 0 && (
                              <div className="meta-row">
                                <span className="meta-label">Đã bán:</span>
                                <span className="meta-value sold">{it.sold}</span>
                              </div>
                            )}
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
                            <button 
                              onClick={() => toggleVisibility(it)} 
                              className={`ap-btn-toggle ${it.isHidden ? 'show' : 'hide'}`}
                              title={it.isHidden ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}
                            >
                              {it.isHidden ? '👁️' : '🙈'}
                            </button>
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
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AdminLayout>
  )
}

     