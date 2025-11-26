import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add, announce } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`)
        setProduct(res.data)
        
        // Fetch related products from same category
        const allProducts = await axios.get('/api/products')
        const related = allProducts.data
          .filter(p => p._id !== id && p.category === res.data.category)
          .slice(0, 4)
        setRelatedProducts(related)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    if (!product) return
    
    if (product.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    if (quantity > product.stock) {
      alert(`Chỉ còn ${product.stock} sản phẩm trong kho`)
      return
    }
    
    add(product, quantity)
    announce(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`)
    const el = document.getElementById('cart-announcer')
    if (el) el.textContent = `Đã thêm ${quantity} ${product.name} vào giỏ hàng`
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>Không tìm thấy sản phẩm</h2>
          <Link to="/shop" className="btn-primary">Quay lại cửa hàng</Link>
        </div>
      </div>
    )
  }

  const images = product.images || (product.imageUrl ? [product.imageUrl] : [])

  return (
    <div className="container product-detail-container">
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="breadcrumb-separator">›</span>
        <Link to="/shop">Sản phẩm</Link>
        <span className="breadcrumb-separator">›</span>
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="gallery-main">
            {images.length > 0 ? (
              <img src={images[selectedImage]} alt={product.name} />
            ) : (
              <div className="gallery-placeholder">
                <span>🌿</span>
                <p>Chưa có hình ảnh</p>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={`thumb ${idx === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-meta">
            <span className="product-category">
              <span className="meta-icon">🏷️</span>
              {product.category || 'Chưa phân loại'}
            </span>
            <span className="product-stock">
              <span className="meta-icon">📦</span>
              {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </span>
          </div>

          <div className="product-price">
            {product.price?.toLocaleString('vi-VN')} ₫
          </div>

          {product.description && (
            <div className="product-description">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div className="product-actions">
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <div className="quantity-controls">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={product.stock}
                />
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <div className="action-buttons">
              <button
                className="btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <span>🛒 Thêm vào giỏ hàng</span>
              </button>
              <button
                className="btn-secondary btn-lg"
                onClick={() => {
                  handleAddToCart()
                  navigate('/cart')
                }}
                disabled={product.stock === 0}
              >
                <span>💳 Mua ngay</span>
              </button>
            </div>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <span className="feature-icon">✅</span>
              <span>Cam kết chất lượng</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🚚</span>
              <span>Giao hàng tận nơi</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔄</span>
              <span>Đổi trả trong 7 ngày</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Sản phẩm liên quan</h2>
          <div className="product-grid">
            {relatedProducts.map(item => (
              <Link
                key={item._id}
                to={`/product/${item._id}`}
                className="product-card"
              >
                <div className="card-image">
                  {item.images?.[0] || item.imageUrl ? (
                    <img src={item.images?.[0] || item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="card-placeholder">🌿</div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{item.name}</h3>
                  <div className="card-price">{item.price?.toLocaleString('vi-VN')} ₫</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
