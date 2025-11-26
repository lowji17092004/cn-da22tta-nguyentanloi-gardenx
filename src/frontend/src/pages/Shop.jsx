import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'

const CATEGORIES = [
  { slug: 'hoa-kieng', name: 'Hoa kiểng' },
  { slug: 'cay-canh', name: 'Cây cảnh' },
  { slug: 'cay-thuy-canh', name: 'Cây thủy cảnh' },
  { slug: 'sen-da', name: 'Sen đá' }
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

const getCategoryName = (slug) => {
  const category = CATEGORIES.find(c => c.slug === slug)
  return category ? category.name : slug
}

export default function Shop(){
  const [items, setItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchParams] = useSearchParams()
  const { add, announce } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/products').then(r => {
      setItems(r.data)
      setFilteredItems(r.data)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    if (category) {
      setSelectedCategory(category)
    }
    if (search) {
      setSearchTerm(search)
    }
  }, [searchParams])

  useEffect(() => {
    let result = items

    // Filter by search term
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(item => {
        const normalizedItemCategory = normalizeCategorySlug(item.category)
        return normalizedItemCategory === selectedCategory
      })
    }

    setFilteredItems(result)
  }, [searchTerm, selectedCategory, items])

  function handleAdd(it){
    if (!user) {
      navigate('/login', { state: { from: '/shop' } })
      return
    }
    
    if (it.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
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

  return (
    <div className="container">
      <div className="page-header">
        <h1>🌺 Cửa hàng hoa kiểng</h1>
        <p>Khám phá bộ sưu tập hoa và cây kiểng cao cấp</p>
      </div>

      <div className="shop-filters">
        <div className="search-box">
          <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="category-filters">
          <button
            className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Tất cả
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              className={`filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="filter-results">
          Tìm thấy <strong>{filteredItems.length}</strong> sản phẩm
        </div>
      </div>

      <div className="products-grid">
        {filteredItems.map(it => (
          <article key={it._id} className="product-card-modern">
            <Link to={`/product/${it._id}`} className="product-image-wrapper">
              {it.images && it.images[0] ? (
                <img src={it.images[0]} alt={it.name} className="product-image" loading="lazy" />
              ) : (
                <div className="product-image-placeholder">
                  <span className="placeholder-icon">🌿</span>
                </div>
              )}
              {(it.isFeatured || it.isBestSeller) && (
                <div className="product-tags">
                  {it.isFeatured && (
                    <span className="product-tag featured">
                      <span className="product-tag-icon">⭐</span>
                      Nổi bật
                    </span>
                  )}
                  {it.isBestSeller && (
                    <span className="product-tag bestseller">
                      <span className="product-tag-icon">🔥</span>
                      Bán chạy
                    </span>
                  )}
                </div>
              )}
              {it.stock < 5 && it.stock > 0 && (
                <div className="product-badge badge-warning">Sắp hết</div>
              )}
              {it.stock === 0 && (
                <div className="product-badge badge-danger">Hết hàng</div>
              )}
            </Link>
            
            <div className="product-info">
              <Link to={`/product/${it._id}`} className="product-link">
                <h3 className="product-name">{it.name}</h3>
              </Link>
              
              {it.category && (
                <span className="product-category">{getCategoryName(normalizeCategorySlug(it.category))}</span>
              )}
              
              <div className="product-price-wrapper">
                <span className="product-price">{it.price?.toLocaleString('vi-VN')}₫</span>
                {it.stock > 0 && (
                  <span className="product-stock">Còn {it.stock}</span>
                )}
              </div>
              
              <div className="product-actions">
                <button 
                  className="btn-add-cart" 
                  onClick={() => handleAdd(it)}
                  disabled={it.stock === 0}
                  title="Thêm vào giỏ hàng"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                  <span>Thêm</span>
                </button>
                <button 
                  className="btn-buy-now" 
                  onClick={() => handleBuyNow(it)}
                  disabled={it.stock === 0}
                  title="Mua ngay"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span>Mua ngay</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Không tìm thấy sản phẩm nào</h3>
          {(searchTerm || selectedCategory) && (
            <button 
              className="btn-primary"
              onClick={() => { setSearchTerm(''); setSelectedCategory('') }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      )}
    </div>
  )
}
