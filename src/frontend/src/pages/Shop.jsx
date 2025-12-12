import React, { useEffect, useState } from 'react'
import axios from 'axios'
import api from '../api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import { flyToCart } from '../utils/cartAnimation'
import { matchesSearchTerm, normalizeCategorySlug } from '../utils/searchUtils'
import { getMainCategories, getCategoryDisplayName, getCategorySlug } from '../utils/categoryUtils'
import './Shop.css'

const CATEGORIES = getMainCategories()

// Local storage key for search history
const SEARCH_HISTORY_KEY = 'florana_search_history'
const MAX_SEARCH_HISTORY = 10

export default function Shop(){
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [stockFilter, setStockFilter] = useState('all') // all, in-stock, low-stock
  const [categories, setCategories] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [searchParams] = useSearchParams()
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

  // Load categories
  useEffect(() => {
    api.get('/categories?type=product').then(res => {
      setCategories(res.data)
    }).catch(err => console.error('Error loading categories:', err))
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const subcategory = searchParams.get('subcategory')
    
    let url = '/api/products'
    const params = new URLSearchParams()
    
    if (category) {
      setSelectedCategory(category)
      const categoryName = getCategoryDisplayName(category)
      params.append('category', categoryName)
    }
    
    if (subcategory) {
      setSelectedSubcategory(subcategory)
    }
    
    if (search) {
      setSearchTerm(search)
    }
    
    if (params.toString()) {
      url += '?' + params.toString()
    }
    
    axios.get(url).then(r => {
      let data = r.data
      // Filter by search if provided
      if (search) {
        data = data.filter(item => 
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
        )
      }
      setItems(data)
      setFilteredItems(data)
    }).catch(() => {})
  }, [searchParams])

  // Local filter when user changes search/category in UI
  useEffect(() => {
    let result = items

    // Filter by search term with Vietnamese support
    if (searchTerm && !searchParams.get('search')) {
      result = result.filter(item => 
        matchesSearchTerm(item.name, searchTerm) ||
        matchesSearchTerm(item.description, searchTerm)
      )
    }

    // Filter by category - exact match
    if (selectedCategory) {
      result = result.filter(item => {
        const itemCategorySlug = normalizeCategorySlug(item.category || '')
        return itemCategorySlug === selectedCategory
      })
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      result = result.filter(item => {
        if (!item.subcategory) return false
        const itemSubSlug = getCategorySlug(item.subcategory)
        return itemSubSlug === selectedSubcategory || 
               item.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()
      })
    }

    // Filter by stock
    if (stockFilter === 'in-stock') {
      result = result.filter(item => item.stock > 0)
    } else if (stockFilter === 'low-stock') {
      result = result.filter(item => item.stock > 0 && item.stock < 10)
    }

    // Filter by price range - improved
    const minPrice = priceRange.min ? parseInt(priceRange.min) : 0
    const maxPrice = priceRange.max ? parseInt(priceRange.max) : Infinity
    
    if (minPrice > 0 || maxPrice < Infinity) {
      result = result.filter(item => {
        const price = item.price || 0
        return price >= minPrice && price <= maxPrice
      })
    }

    // Sort products
    result = [...result].sort((a, b) => {
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

    setFilteredItems(result)
  }, [searchTerm, selectedCategory, selectedSubcategory, priceRange, sortBy, stockFilter, items, searchParams])

  function handleAdd(it, event){
    if (!user) {
      navigate('/login', { state: { from: '/shop' } })
      return
    }
    
    if (it.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    // Trigger flying animation
    const productElement = event?.target?.closest('.product-card-minimal')
    if (productElement) {
      const productImage = it.images && it.images[0] ? it.images[0] : '/images/placeholder.png'
      flyToCart(productElement, productImage, it.name)
    }
    
    add(it, 1)
    announce && announce(`${it.name} đã được thêm vào giỏ`)
    const el = document.getElementById('cart-announcer')
    if (el) el.textContent = `${it.name} đã được thêm vào giỏ`
  }

  function handleBuyNow(it){
    if (!user) {
      navigate('/login', { state: { from: '/shop' } })
      return
    }
    
    if (it.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    add(it, 1)
    navigate('/cart')
  }

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      saveSearchToHistory(searchTerm.trim())
    }
    setShowSearchHistory(false)
  }

  // Get subcategories for selected category
  const getSubcategories = () => {
    if (!selectedCategory) return []
    const cat = categories.find(c => c.slug === selectedCategory)
    return cat?.subcategories || []
  }

  // Handle category change
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat)
    setSelectedSubcategory('') // Reset subcategory when category changes
  }

  return (
    <>
      <PageBanner page="shop" />
      <div className="container">
        {/* Search Bar with History */}
        <div className="shop-search-section">
          <form className="search-box-modern" onSubmit={handleSearchSubmit}>
            <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mô tả sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
              className="search-input-modern"
            />
            {searchTerm && (
              <button type="button" className="search-clear-modern" onClick={() => setSearchTerm('')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
            {/* Search History Dropdown */}
            {showSearchHistory && searchHistory.length > 0 && !searchTerm && (
              <div className="search-history-dropdown">
                <div className="search-history-header">
                  <span>Tìm kiếm gần đây</span>
                  <button type="button" onClick={clearSearchHistory}>Xóa tất cả</button>
                </div>
                {searchHistory.map((term, idx) => (
                  <div 
                    key={idx} 
                    className="search-history-item"
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

        {/* Filter Toolbar */}
        <div className="shop-toolbar-modern">
          <div className="toolbar-left">
            {/* Category Pills */}
            <div className="category-pills">
              <button 
                className={`pill-btn ${!selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategoryChange('')}
              >
                Tất cả
                <span className="pill-count">{items.length}</span>
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.slug}
                  className={`pill-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  {cat.name}
                  <span className="pill-count">
                    {items.filter(it => {
                      const itemCatSlug = normalizeCategorySlug(it.category || '')
                      return itemCatSlug === cat.slug
                    }).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subcategory Pills - Show when category is selected */}
        {selectedCategory && getSubcategories().length > 0 && (
          <div className="subcategory-pills-section">
            <div className="subcategory-pills">
              <button 
                className={`sub-pill-btn ${!selectedSubcategory ? 'active' : ''}`}
                onClick={() => setSelectedSubcategory('')}
              >
                Tất cả
              </button>
              {getSubcategories().map(sub => (
                <button 
                  key={sub.slug}
                  className={`sub-pill-btn ${selectedSubcategory === sub.slug ? 'active' : ''}`}
                  onClick={() => setSelectedSubcategory(sub.slug)}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Second row filters */}
        <div className="shop-filters-row">
          {/* Stock Filter */}
          <div className="stock-filter">
            <label>Tồn kho:</label>
            <select value={stockFilter} onChange={e => setStockFilter(e.target.value)} className="filter-select">
              <option value="all">Tất cả ({items.length})</option>
              <option value="in-stock">Còn hàng ({items.filter(it => it.stock > 0).length})</option>
              <option value="low-stock">Sắp hết ({items.filter(it => it.stock > 0 && it.stock < 10).length})</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="price-filter-compact">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <input
              type="number"
              placeholder="Từ (VNĐ)"
              value={priceRange.min}
              onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="price-input-compact"
              min="0"
              step="10000"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Đến (VNĐ)"
              value={priceRange.max}
              onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="price-input-compact"
              min="0"
              step="10000"
            />
            {(priceRange.min || priceRange.max) && (
              <button 
                className="price-clear-btn"
                onClick={() => setPriceRange({ min: '', max: '' })}
                title="Xóa lọc giá"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="sort-section">
            <label>Sắp xếp:</label>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)} 
              className="sort-select-modern"
            >
              <option value="newest">Mới nhất</option>
              <option value="bestseller">Bán chạy</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="name-asc">Tên A → Z</option>
              <option value="name-desc">Tên Z → A</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="results-count">
            Hiển thị <strong>{filteredItems.length}</strong> / {items.length} sản phẩm
          </div>
        </div>

      <div className="products-grid">
        {filteredItems.map(it => (
          <article key={it._id} className="product-card-minimal">
            {/* Product Image */}
            <Link to={`/product/${it._id}`} className="product-image-link-modern">
              <div className="product-image-wrapper-modern">
                {it.images && it.images[0] ? (
                  <img src={it.images[0]} alt={it.name} className="product-image-modern" loading="lazy" />
                ) : (
                  <div className="product-placeholder-modern">
                    <span className="placeholder-icon-modern">🌿</span>
                  </div>
                )}
                
                {/* Tags */}
                {(it.isFeatured || (it.sold || 0) >= 10 || it.stock === 0) && (
                  <div className="product-badges-modern">
                    {it.stock === 0 && (
                      <span className="product-badge out-of-stock">Hết hàng</span>
                    )}
                    {it.isFeatured && it.stock > 0 && (
                      <span className="product-badge featured">⭐ Nổi bật</span>
                    )}
                    {(it.sold || 0) >= 10 && it.stock > 0 && (
                      <span className="product-badge bestseller">🔥 Bán chạy</span>
                    )}
                  </div>
                )}

                {/* Add to Cart Button - On Hover */}
                <div className="product-hover-action">
                  <button 
                    className="btn-add-to-cart-hover" 
                    onClick={(e) => {
                      e.preventDefault()
                      handleAdd(it, e)
                    }}
                    disabled={it.stock === 0}
                    title={it.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <span>Thêm vào giỏ</span>
                  </button>
                </div>
              </div>
            </Link>
            
            {/* Product Info */}
            <div className="product-info-minimal">
              {/* Category Tags */}
              {it.category && (
                <span className="product-category-tag">
                  {getCategoryDisplayName(it.category)}
                </span>
              )}
              {it.subcategory && (
                <span className="product-subcategory-tag">
                  {getCategoryDisplayName(it.subcategory)}
                </span>
              )}
              
              {/* Product Name */}
              <Link to={`/product/${it._id}`} className="product-name-link">
                <h3 className="product-name-minimal">{it.name}</h3>
              </Link>
              
              {/* Price & Stock */}
              <div className="product-price-minimal">
                <span className="price-amount">{it.price?.toLocaleString('vi-VN')}₫</span>
                {it.stock > 0 && it.stock < 10 && (
                  <span className="stock-indicator">Còn {it.stock}</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state-modern">
          <div className="empty-icon-modern">🔍</div>
          <h3>Không tìm thấy sản phẩm nào</h3>
          <p>Thử điều chỉnh bộ lọc hoặc tìm kiếm từ khóa khác</p>
          {(searchTerm || priceRange.min || priceRange.max || selectedCategory || selectedSubcategory || stockFilter !== 'all') && (
            <button 
              className="btn-clear-filters"
              onClick={() => { 
                setSearchTerm('')
                setPriceRange({ min: '', max: '' })
                setSelectedCategory('')
                setSelectedSubcategory('')
                setStockFilter('all')
              }}
            >
              Xóa tất cả bộ lọc
            </button>
          )}
        </div>
      )}
      </div>
    </>
  )
}
