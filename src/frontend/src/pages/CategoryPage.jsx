import React, { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { flyToCart } from '../utils/cartAnimation'
import PageBanner from '../components/PageBanner'
import { getCategoryDisplayName, getCategorySlug } from '../utils/categoryUtils'
import './CategoryPage.css'

// Local storage key for search history
const SEARCH_HISTORY_KEY = 'florana_category_search_history'
const MAX_SEARCH_HISTORY = 10

export default function CategoryPage() {
  const { categorySlug, subSlug } = useParams()
  const [items, setItems] = useState([])
  const [category, setCategory] = useState(null)
  const [subcategory, setSubcategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [searchHistory, setSearchHistory] = useState([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const { add, announce } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing search history', e)
      }
    }
  }, [])

  // Save search to history
  const saveSearchToHistory = (term) => {
    if (!term.trim()) return
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, MAX_SEARCH_HISTORY)
    setSearchHistory(newHistory)
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
  }

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  // Banner configuration for each category
  const categoryBanners = {
    'hoa-kieng': {
      title: 'Hoa Kiểng',
      slogan: 'Nết đẹp tinh tế, hoa vàng rực rỡ đến từ thiên nhiên',
      gradient: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
      icon: '🌺',
      image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop'
    },
    'cay-canh': {
      title: 'Cây Cảnh',
      slogan: 'Mang thiên nhiên xanh mát vào không gian sống',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      icon: '🌿',
      image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200&h=400&fit=crop'
    },
    'cay-thuy-canh': {
      title: 'Cây Thủy Cảnh',
      slogan: 'Thế giới dưới nước tuyệt đẹp trong từng chi tiết',
      gradient: 'linear-gradient(135deg, #0093E9 0%, #80D0C7 100%)',
      icon: '🌊',
      image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=1200&h=400&fit=crop'
    },
    'sen-da': {
      title: 'Sen Đá',
      slogan: 'Nhỏ nhắn xinh xắn, dễ chăm sóc, đem lại niềm vui',
      gradient: 'linear-gradient(135deg, #F857A6 0%, #FF5858 100%)',
      icon: '🌵',
      image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=1200&h=400&fit=crop'
    }
  }

  // Load category info and products
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load categories
        const catRes = await api.get('/categories?type=product')
        const categories = catRes.data
        
        // Find current category
        const currentCat = categories.find(c => c.slug === categorySlug)
        setCategory(currentCat)
        
        // Find subcategory if specified
        if (subSlug && currentCat) {
          const sub = currentCat.subcategories?.find(s => s.slug === subSlug)
          setSubcategory(sub)
        } else {
          setSubcategory(null)
        }
        
        // Load ALL products first, then filter client-side
        const prodRes = await axios.get('/api/products')
        
        // Filter products by category - support both slug and Vietnamese name
        const filtered = prodRes.data.filter(p => {
          const pCat = (p.category || '').toLowerCase().trim()
          const currentSlug = categorySlug.toLowerCase()
          const categoryName = getCategoryNameFromSlug(categorySlug).toLowerCase()
          
          // Direct match with slug (most products store slug)
          if (pCat === currentSlug) return true
          
          // Direct match with slug containing dashes converted to spaces
          if (pCat === currentSlug.replace(/-/g, ' ')) return true
          
          // Match with Vietnamese category name
          if (pCat === categoryName) return true
          
          // Normalize both for comparison (remove diacritics and spaces)
          const normalize = (str) => str
            .toLowerCase()
            .replace(/[\s-]+/g, '')
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/đ/g, 'd')
          
          const normalizedPCat = normalize(pCat)
          const normalizedSlug = normalize(currentSlug)
          const normalizedName = normalize(categoryName)
          
          return normalizedPCat === normalizedSlug || 
                 normalizedPCat === normalizedName ||
                 normalizedPCat.includes(normalizedSlug) ||
                 normalizedSlug.includes(normalizedPCat)
        })
        
        setItems(filtered)
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [categorySlug, subSlug])

  // Get category name from slug
  const getCategoryNameFromSlug = (slug) => {
    const mapping = {
      'hoa-kieng': 'hoa kiểng',
      'cay-canh': 'cây cảnh',
      'cay-thuy-canh': 'cây thủy cảnh',
      'sen-da': 'sen đá'
    }
    return mapping[slug] || slug
  }

  // Normalize slug
  const normalizeSlug = (str) => {
    if (!str) return ''
    return str.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/\s+/g, '-')
      .trim()
  }

  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'name-asc':
        return a.name.localeCompare(b.name, 'vi')
      case 'name-desc':
        return b.name.localeCompare(a.name, 'vi')
      case 'bestseller':
        return (b.sold || 0) - (a.sold || 0)
      case 'newest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  // Filter by price range and subcategory
  const filteredItems = sortedItems.filter(item => {
    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const nameMatch = item.name?.toLowerCase().includes(term)
      const descMatch = item.description?.toLowerCase().includes(term)
      if (!nameMatch && !descMatch) return false
    }

    // Stock filtering
    if (stockFilter === 'in-stock' && item.stock <= 0) return false
    if (stockFilter === 'low-stock' && (item.stock <= 0 || item.stock >= 10)) return false

    // Price filtering
    if (priceRange.min && item.price < Number(priceRange.min)) return false
    if (priceRange.max && item.price > Number(priceRange.max)) return false
    
    // Subcategory filtering if subSlug is present
    if (subSlug && subcategory) {
      const itemSub = (item.subcategory || '').toLowerCase().trim()
      const currentSubName = (subcategory.name || '').toLowerCase().trim()
      const currentSubSlug = subSlug.toLowerCase().trim()
      
      // Normalize for Vietnamese comparison
      const normalize = (str) => str
        .replace(/[\s-]+/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
      
      const normalizedItemSub = normalize(itemSub)
      const normalizedCurrentName = normalize(currentSubName)
      const normalizedCurrentSlug = normalize(currentSubSlug)
      
      // Match if any of these conditions are true
      if (normalizedItemSub !== normalizedCurrentName && 
          normalizedItemSub !== normalizedCurrentSlug &&
          itemSub !== currentSubName &&
          itemSub !== currentSubSlug) {
        return false
      }
    }
    
    return true
  })

  const handleAdd = (it, event) => {
    if (!user) {
      navigate('/login', { state: { from: `/category/${categorySlug}${subSlug ? '/' + subSlug : ''}` } })
      return
    }
    
    if (it.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    const productElement = event?.target?.closest('.cp-product-card')
    if (productElement) {
      const productImage = it.images?.[0] || '/images/placeholder.png'
      flyToCart(productElement, productImage, it.name)
    }
    
    add(it, 1)
    announce?.(`${it.name} đã được thêm vào giỏ`)
  }

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      saveSearchToHistory(searchTerm.trim())
    }
    setShowSearchHistory(false)
  }

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-spinner"></div>
        <p>Đang tải...</p>
      </div>
    )
  }

  const bannerConfig = categoryBanners[categorySlug] || {
    title: category?.name || 'Danh mục',
    slogan: 'Khám phá bộ sưu tập cây cảnh đa dạng và phong phú',
    gradient: 'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)',
    icon: '🌱',
    image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=1200&h=400&fit=crop'
  }

  return (
    <div className="cp-page">
      {/* Dynamic Banner using PageBanner component */}
      <PageBanner 
        page={subSlug ? `category-${subSlug}` : `category-${categorySlug}`}
        customTitle={subcategory?.name || category?.name}
        customSlogan={subcategory?.description || (category?.description || bannerConfig.slogan)}
      />
      
      <div className="container">
        <nav className="cp-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="cp-breadcrumb-sep">/</span>
          <Link to="/shop">Sản phẩm</Link>
          {category && (
            <>
              <span className="cp-breadcrumb-sep">/</span>
              {subSlug ? (
                <Link to={`/category/${categorySlug}`}>{category.name}</Link>
              ) : (
                <span className="cp-breadcrumb-current">{category.name}</span>
              )}
            </>
          )}
          {subcategory && (
            <>
              <span className="cp-breadcrumb-sep">/</span>
              <span className="cp-breadcrumb-current">{subcategory.name}</span>
            </>
          )}
        </nav>
        
        {/* Subcategories Navigation */}
        {category?.subcategories?.length > 0 && (
          <div className="cp-subcategories">
            <Link 
              to={`/category/${categorySlug}`} 
              className={`cp-subcat-btn ${!subSlug ? 'active' : ''}`}
            >
              Tất cả {category.name}
            </Link>
            {category.subcategories.map(sub => (
              <Link 
                key={sub.slug}
                to={`/category/${categorySlug}/${sub.slug}`}
                className={`cp-subcat-btn ${subSlug === sub.slug ? 'active' : ''}`}
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="cp-search-section">
          <form className="cp-search-box" onSubmit={handleSearchSubmit}>
            <svg className="cp-search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mô tả sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
              className="cp-search-input"
            />
            {searchTerm && (
              <button type="button" className="cp-search-clear" onClick={() => setSearchTerm('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            {/* Search History Dropdown */}
            {showSearchHistory && searchHistory.length > 0 && !searchTerm && (
              <div className="cp-search-history-dropdown">
                <div className="cp-search-history-header">
                  <span>Tìm kiếm gần đây</span>
                  <button type="button" onClick={clearSearchHistory}>Xóa tất cả</button>
                </div>
                {searchHistory.map((term, idx) => (
                  <div 
                    key={idx} 
                    className="cp-search-history-item"
                    onClick={() => {
                      setSearchTerm(term)
                      setShowSearchHistory(false)
                    }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{term}</span>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Filters & Sort */}
        <div className="cp-toolbar">
          <div className="cp-filters">
            {/* Stock Filter */}
            <div className="cp-filter-group">
              <label>Tồn kho:</label>
              <select 
                value={stockFilter} 
                onChange={e => setStockFilter(e.target.value)}
                className="cp-filter-select"
              >
                <option value="all">Tất cả ({items.length})</option>
                <option value="in-stock">Còn hàng ({items.filter(it => it.stock > 0).length})</option>
                <option value="low-stock">Sắp hết ({items.filter(it => it.stock > 0 && it.stock < 10).length})</option>
              </select>
            </div>

            <div className="cp-filter-group">
              <label>Giá từ:</label>
              <input 
                type="number" 
                placeholder="0" 
                value={priceRange.min}
                onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="cp-price-input"
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="∞" 
                value={priceRange.max}
                onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="cp-price-input"
              />
              <span>₫</span>
              {(priceRange.min || priceRange.max) && (
                <button 
                  className="cp-price-clear"
                  onClick={() => setPriceRange({ min: '', max: '' })}
                  title="Xóa lọc giá"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <div className="cp-sort">
            <label>Sắp xếp:</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="cp-sort-select">
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="name-desc">Tên Z → A</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="cp-results-count">
          Hiển thị <strong>{filteredItems.length}</strong> / {items.length} sản phẩm
        </div>

        {/* Products Grid */}
        {filteredItems.length > 0 ? (
          <div className="cp-products-grid">
            {filteredItems.map(it => (
              <article key={it._id} className="cp-product-card">
                <Link to={`/product/${it._id}`} className="cp-product-image-link">
                  <div className="cp-product-image-wrapper">
                    {it.images?.[0] ? (
                      <img src={it.images[0]} alt={it.name} className="cp-product-image" loading="lazy" />
                    ) : (
                      <div className="cp-product-placeholder">
                        <span>🌿</span>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="cp-badges">
                      {it.stock === 0 && (
                        <span className="cp-badge out-of-stock">Hết hàng</span>
                      )}
                      {it.isFeatured && it.stock > 0 && (
                        <span className="cp-badge featured">⭐ Nổi bật</span>
                      )}
                      {(it.sold || 0) >= 10 && it.stock > 0 && (
                        <span className="cp-badge bestseller">🔥 Bán chạy</span>
                      )}
                    </div>

                    {/* Hover Actions */}
                    <div className="cp-hover-actions">
                      <button 
                        className="cp-btn-cart"
                        onClick={(e) => {
                          e.preventDefault()
                          handleAdd(it, e)
                        }}
                        disabled={it.stock === 0}
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        <span>Thêm vào giỏ</span>
                      </button>
                    </div>
                  </div>
                </Link>
                
                <div className="cp-product-info">
                  {it.subcategory && (
                    <Link 
                      to={`/category/${categorySlug}/${normalizeSlug(it.subcategory)}`}
                      className="cp-product-subcat"
                    >
                      {getCategoryDisplayName(it.subcategory)}
                    </Link>
                  )}
                  
                  <Link to={`/product/${it._id}`} className="cp-product-name-link">
                    <h3 className="cp-product-name">{it.name}</h3>
                  </Link>
                  
                  <div className="cp-product-price">
                    <span className="cp-price">{it.price?.toLocaleString('vi-VN')}₫</span>
                    {it.stock > 0 && it.stock < 10 && (
                      <span className="cp-stock-warn">Còn {it.stock}</span>
                    )}
                  </div>
                  
                  {(it.sold || 0) > 0 && (
                    <div className="cp-sold">
                      Đã bán: {it.sold}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cp-empty">
            <div className="cp-empty-icon">🔍</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Chưa có sản phẩm nào trong danh mục này</p>
            <Link to="/shop" className="cp-btn-back">
              Xem tất cả sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
