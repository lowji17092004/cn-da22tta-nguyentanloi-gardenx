import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'

const CATEGORIES = {
  'hoa-kieng': 'Hoa kiểng',
  'cay-canh': 'Cây cảnh',
  'cay-thuy-canh': 'Cây thủy cảnh',
  'sen-da': 'Sen đá'
}

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

const getCategoryName = (slug) => CATEGORIES[slug] || slug

export default function HomeNew(){
  const [featured, setFeatured] = useState([])
  const [best, setBest] = useState([])
  const [testimonials] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products')
        const products = res.data
        
        // Lọc sản phẩm nổi bật và bán chạy
        const featuredProducts = products.filter(p => p.isFeatured)
        const bestSellerProducts = products.filter(p => p.isBestSeller)
        
        // Nếu không có sản phẩm nổi bật, lấy 5 sản phẩm đầu
        setFeatured(featuredProducts.length > 0 ? featuredProducts : products.slice(0, 5))
        
        // Nếu không có sản phẩm bán chạy, lấy 5 sản phẩm tiếp theo
        setBest(bestSellerProducts.length > 0 ? bestSellerProducts : products.slice(5, 10))
      } catch(e) {
        console.error('Failed to load products', e)
      }
    }
    loadProducts()
  }, [])

  const { add, announce } = useCart()

  function handleAdd(p){
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    
    if (p.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    add(p, 1)
    try{ announce && announce(`${p.name} đã được thêm vào giỏ`) }catch(e){}
    const el = document.getElementById('cart-announcer')
    if (el) el.textContent = `${p.name} đã được thêm vào giỏ`
  }

  function handleBuyNow(p){
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    
    if (p.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    add(p, 1)
    navigate('/cart')
  }

  return (
    <main id="main-content">
      <div className="home-hero">
        <div className="single-banner">
          <img src="/images/banner.png" alt="Cửa hàng hoa kiểng" className="banner-image" />
        </div>
      </div>

      {featured.length > 0 && (
        <section className="home-section container">
          <div className="section-title">
            <h3>Sản phẩm nổi bật</h3>
            <Link to="/shop" className="muted">Xem tất cả</Link>
          </div>
          <div className="products-grid">
            {featured.map(p=> (
              <article key={p._id} className="product-card-modern">
                <Link to={`/product/${p._id}`} className="product-image-wrapper">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="product-image" loading="lazy" />
                  ) : (
                    <div className="product-image-placeholder">
                      <span className="placeholder-icon">🌿</span>
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div className="product-badge badge-danger">Hết hàng</div>
                  )}
                  {(p.isFeatured || p.isBestSeller) && (
                    <div className="product-tags">
                      {p.isFeatured && (
                        <span className="product-tag featured">
                          <span className="product-tag-icon">⭐</span>
                          Nổi bật
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className="product-tag bestseller">
                          <span className="product-tag-icon">🔥</span>
                          Bán chạy
                        </span>
                      )}
                    </div>
                  )}
                </Link>
                <div className="product-info">
                  <Link to={`/product/${p._id}`} className="product-link">
                    <h3 className="product-name">{p.name}</h3>
                  </Link>
                  {p.category && (
                    <span className="product-category">{getCategoryName(normalizeCategorySlug(p.category))}</span>
                  )}
                  <div className="product-price-wrapper">
                    <span className="product-price">{p.price?.toLocaleString('vi-VN')}₫</span>
                    {p.stock > 0 && (
                      <span className="product-stock">Còn {p.stock}</span>
                    )}
                  </div>
                  <div className="product-actions">
                    <button className="btn-add-cart" onClick={() => handleAdd(p)} disabled={p.stock === 0}>
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      <span>Thêm</span>
                    </button>
                    <button className="btn-buy-now" onClick={() => handleBuyNow(p)} disabled={p.stock === 0}>
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>Mua ngay</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {best.length > 0 && (
        <section className="home-section container">
          <div className="section-title">
            <h3>Bán chạy</h3>
            <Link to="/shop" className="muted">Xem tất cả</Link>
          </div>
          <div className="products-grid">
            {best.map(p=> (
              <article key={p._id} className="product-card-modern">
                <Link to={`/product/${p._id}`} className="product-image-wrapper">
                  {p.images && p.images[0] ? (
                    <img src={p.images[0]} alt={p.name} className="product-image" loading="lazy" />
                  ) : (
                    <div className="product-image-placeholder">
                      <span className="placeholder-icon">🌿</span>
                    </div>
                  )}
                  {p.stock === 0 && (
                    <div className="product-badge badge-danger">Hết hàng</div>
                  )}
                  {(p.isFeatured || p.isBestSeller) && (
                    <div className="product-tags">
                      {p.isFeatured && (
                        <span className="product-tag featured">
                          <span className="product-tag-icon">⭐</span>
                          Nổi bật
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className="product-tag bestseller">
                          <span className="product-tag-icon">🔥</span>
                          Bán chạy
                        </span>
                      )}
                    </div>
                  )}
                </Link>
                <div className="product-info">
                  <Link to={`/product/${p._id}`} className="product-link">
                    <h3 className="product-name">{p.name}</h3>
                  </Link>
                  {p.category && (
                    <span className="product-category">{getCategoryName(normalizeCategorySlug(p.category))}</span>
                  )}
                  <div className="product-price-wrapper">
                    <span className="product-price">{p.price?.toLocaleString('vi-VN')}₫</span>
                    {p.stock > 0 && (
                      <span className="product-stock">Còn {p.stock}</span>
                    )}
                  </div>
                  <div className="product-actions">
                    <button className="btn-add-cart" onClick={() => handleAdd(p)} disabled={p.stock === 0}>
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                      <span>Thêm</span>
                    </button>
                    <button className="btn-buy-now" onClick={() => handleBuyNow(p)} disabled={p.stock === 0}>
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>Mua ngay</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="home-section container">
          <div className="section-title">
            <h3>Khách hàng nói gì</h3>
            <Link to="/articles" className="muted">Đọc thêm</Link>
          </div>
          <div className="testimonials">
            {testimonials.map(t=> (
              <blockquote key={t.id} className="testimonial" tabIndex={0}>
                <div className="testimonial-header">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <cite className="testimonial-name">{t.name}</cite>
                    <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
                <p className="testimonial-text">"{t.text}"</p>
              </blockquote>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
