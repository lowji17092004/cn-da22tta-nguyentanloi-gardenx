import React, { useEffect, useState } from 'react'
import BannerCarousel from '../components/BannerCarousel'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import { getCategoryDisplayName } from '../utils/categoryUtils'

const CATEGORIES = [
  { slug: 'chau-cay', name: 'Chậu cây' },
  { slug: 'cay-canh', name: 'Cây cảnh' },
  { slug: 'hoa-kieng', name: 'Hoa kiểng' },
  { slug: 'phu-kien', name: 'Phụ kiện' }
]

// Helper to get image URL with correct base path
const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath
  return `http://localhost:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

export default function Home(){
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const { add, announce } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const hero = [
    { image: '/images/hoakieng.jpg', title: 'Hoa Kiểng Đẹp', subtitle: 'Bộ sưu tập hoa kiểng cao cấp' },
    { image: '/images/caycanh.jpg', title: 'Cây Cảnh Xanh Mát', subtitle: 'Tạo không gian sống trong lành' },
    { image: '/images/caythuycanh.jpg', title: 'Cây Thủy Canh', subtitle: 'Độc đáo và dễ chăm sóc' },
    { image: '/images/senda.jpg', title: 'Sen Đá Xinh Xắn', subtitle: 'Nhỏ gọn và dễ thương' }
  ]

  useEffect(() => {
    // Fetch bestsellers (sold >= 10)
    api.get('/products?bestseller=true').then(r => {
      setFeaturedProducts(r.data.slice(0, 8))
    }).catch(() => {})
    
    // Fetch new products
    api.get('/products').then(r => {
      setNewProducts(r.data.slice(0, 8))
    }).catch(() => {})
  }, [])

  function handleAdd(product) {
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    
    if (product.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    add(product, 1)
    announce && announce(`${product.name} đã được thêm vào giỏ`)
  }

  function handleBuyNow(product, event) {
    event?.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    if (product.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    add(product, 1)
    navigate('/checkout')
  }

  return (
    <div>
      <div className="home-hero">
        <BannerCarousel items={hero} />
      </div>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="home-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Sản phẩm bán chạy</h2>
              <p className="section-subtitle">Những sản phẩm được yêu thích và đã bán trên 10 sản phẩm</p>
              <Link to="/shop" className="section-view-all">
                Xem tất cả
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="products-grid">
              {featuredProducts.map(product => (
                <article key={product._id} className="product-card-minimal">
                  <Link to={`/product/${product._id}`} className="product-image-link">
                    <div className="product-image-container">
                      {product.images && product.images[0] ? (
                        <img src={getImageUrl(product.images[0])} alt={product.name} className="product-image" loading="lazy" />
                      ) : (
                        <div className="product-image-placeholder">
                          <span className="placeholder-icon">🌿</span>
                        </div>
                      )}
                      
                      {(product.isFeatured || (product.sold || 0) >= 10 || product.stock === 0) && (
                        <div className="product-badges-top">
                          {product.stock === 0 && (
                            <span className="product-badge out-of-stock">Hết hàng</span>
                          )}
                          {product.isFeatured && product.stock > 0 && (
                            <span className="product-badge featured">⭐ Nổi bật</span>
                          )}
                          {(product.sold || 0) >= 10 && product.stock > 0 && (
                            <span className="product-badge bestseller">🔥 Bán chạy</span>
                          )}
                        </div>
                      )}

                      <div className="product-hover-action">
                        <button 
                          className="btn-add-to-cart-hover" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleAdd(product)
                          }}
                          disabled={product.stock === 0}
                          title={product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="product-info-minimal">
                    {product.category && (
                      <span className="product-category-tag">
                        {getCategoryDisplayName(product.category)}
                      </span>
                    )}
                    
                    <Link to={`/product/${product._id}`} className="product-name-link">
                      <h3 className="product-name-minimal">{product.name}</h3>
                    </Link>
                    
                    <div className="product-price-minimal">
                      <span className="price-amount">{product.price?.toLocaleString('vi-VN')}₫</span>
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="stock-indicator">Còn {product.stock}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Products Section */}
      {newProducts.length > 0 && (
        <section className="home-section home-section-gray">
          
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Sản phẩm mới nhất</h2>
              <p className="section-subtitle">Cập nhật những sản phẩm mới về</p>
              <Link to="/shop" className="section-view-all">
                Xem tất cả
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <div className="products-grid">
              {newProducts.map(product => (
                <article key={product._id} className="product-card-minimal">
                  <Link to={`/product/${product._id}`} className="product-image-link">
                    <div className="product-image-container">
                      {product.images && product.images[0] ? (
                        <img src={getImageUrl(product.images[0])} alt={product.name} className="product-image" loading="lazy" />
                      ) : (
                        <div className="product-image-placeholder">
                          <span className="placeholder-icon">🌿</span>
                        </div>
                      )}
                      
                      {(product.isFeatured || (product.sold || 0) >= 10 || product.stock === 0) && (
                        <div className="product-badges-top">
                          {product.stock === 0 && (
                            <span className="product-badge out-of-stock">Hết hàng</span>
                          )}
                          {product.isFeatured && product.stock > 0 && (
                            <span className="product-badge featured">⭐ Nổi bật</span>
                          )}
                          {(product.sold || 0) >= 10 && product.stock > 0 && (
                            <span className="product-badge bestseller">🔥 Bán chạy</span>
                          )}
                        </div>
                      )}

                      <div className="product-hover-action">
                        <button 
                          className="btn-add-to-cart-hover" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleAdd(product)
                          }}
                          disabled={product.stock === 0}
                          title={product.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                        >
                          <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                          </svg>
                          <span>Thêm vào giỏ</span>
                        </button>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="product-info-minimal">
                    {product.category && (
                      <span className="product-category-tag">
                        {getCategoryDisplayName(product.category)}
                      </span>
                    )}
                    
                    <Link to={`/product/${product._id}`} className="product-name-link">
                      <h3 className="product-name-minimal">{product.name}</h3>
                    </Link>
                    
                    <div className="product-price-minimal">
                      <span className="price-amount">{product.price?.toLocaleString('vi-VN')}₫</span>
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="stock-indicator">Còn {product.stock}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}


