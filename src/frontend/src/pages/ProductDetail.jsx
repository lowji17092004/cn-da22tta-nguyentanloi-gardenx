import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import './ProductDetail.css'

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
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description') // description, reviews
  const [expandedReviews, setExpandedReviews] = useState(new Set())

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
    
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        console.log('Fetching reviews for product:', id)
        const res = await axios.get(`/api/reviews/product/${id}`)
        console.log('Reviews response:', res.data)
        setReviews(res.data.reviews || [])
        setReviewStats(res.data.stats)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        console.error('Error response:', error.response?.data)
        // Set empty data on error
        setReviews([])
        setReviewStats(null)
      } finally {
        setReviewsLoading(false)
      }
    }
    
    fetchProduct()
    fetchReviews()
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  const renderStars = (rating) => {
    return (
      <div className="star-rating-display">
        {[1, 2, 3, 4, 5].map(star => (
          <span key={star} className={`star ${star <= rating ? 'filled' : ''}`}>
            ★
          </span>
        ))}
      </div>
    )
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

          {reviewStats && (
            <div className="product-rating-summary">
              <div className="rating-score">
                <span className="score-number">{reviewStats.averageRating?.toFixed(1) || 0}</span>
                {renderStars(Math.round(reviewStats.averageRating || 0))}
              </div>
              <span className="rating-count">
                {reviewStats.totalReviews || 0} đánh giá
              </span>
            </div>
          )}

          <div className="product-description">
            <h3>Mô tả sản phẩm</h3>
            <p>{product.description || 'Chưa có mô tả'}</p>
          </div>

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

      {/* Tabs Section */}
      <div className="product-tabs-section">
        <div className="tabs-header">
          <button
            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            Chi tiết sản phẩm
          </button>
          <button
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Đánh giá ({reviews.length})
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' && (
            <div className="tab-panel description-panel">
              <div className="description-content">
                <h3>Thông tin sản phẩm</h3>
                <p>{product.description || 'Chưa có mô tả chi tiết'}</p>
                
                <div className="product-specs">
                  <div className="spec-item">
                    <span className="spec-label">Danh mục:</span>
                    <span className="spec-value">{product.category || 'Chưa phân loại'}</span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">Tình trạng:</span>
                    <span className="spec-value">
                      {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                    </span>
                  </div>
                </div>

                <div className="care-tips">
                  <h4>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    Hướng dẫn chăm sóc
                  </h4>
                  <ul>
                    <li>💧 Tưới nước đều đặn, tránh để đất quá khô hoặc quá ướt</li>
                    <li>☀️ Đặt cây ở nơi có ánh sáng phù hợp với loại cây</li>
                    <li>🌡️ Nhiệt độ thích hợp 18-25°C</li>
                    <li>✂️ Cắt tỉa lá úa, cành khô thường xuyên</li>
                    <li>🌱 Bón phân định kỳ để cây phát triển tốt</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-panel reviews-panel">
              {reviewsLoading ? (
                <div className="reviews-loading">
                  <div className="spinner"></div>
                  <p>Đang tải đánh giá...</p>
                </div>
              ) : (
                <>
                  {reviewStats && reviews.length > 0 && (
                    <div className="reviews-overview">
                      <div className="overview-score">
                        <div className="big-score">{reviewStats.averageRating?.toFixed(1) || 0}</div>
                        {renderStars(Math.round(reviewStats.averageRating || 0))}
                        <p className="score-label">{reviewStats.totalReviews} đánh giá</p>
                      </div>
                      <div className="overview-bars">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = reviews.filter(r => r.rating === star).length
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                          return (
                            <div key={star} className="rating-bar-item">
                              <span className="bar-label">{star} ★</span>
                              <div className="bar-track">
                                <div 
                                  className="bar-fill" 
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="bar-count">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {reviews.length === 0 ? (
                    <div className="no-reviews">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <h3>Chưa có đánh giá nào</h3>
                      <p>Hãy là người đầu tiên đánh giá sản phẩm này sau khi mua hàng!</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map(review => {
                        const isExpanded = expandedReviews.has(review._id)
                        const hasMedia = (review.images?.length > 0) || (review.videos?.length > 0)
                        const commentLength = review.comment?.length || 0
                        const needsExpand = commentLength > 200 || hasMedia

                        return (
                          <div key={review._id} className="review-card">
                            <div className="review-header">
                              <div className="reviewer-info">
                                <div className="reviewer-avatar">
                                  {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="reviewer-details">
                                  <div className="reviewer-name">{review.user?.name || 'Người dùng'}</div>
                                  <div className="review-meta">
                                    {review.verified && (
                                      <span className="verified-badge">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                          <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>
                                        </svg>
                                        Đã mua hàng
                                      </span>
                                    )}
                                    <span className="review-date">{formatDate(review.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              {renderStars(review.rating)}
                            </div>

                            <div className={`review-content ${isExpanded ? 'expanded' : ''}`}>
                              {review.title && <h4 className="review-title">{review.title}</h4>}
                              {review.comment && (
                                <p className="review-comment">
                                  {isExpanded || commentLength <= 200 
                                    ? review.comment 
                                    : `${review.comment.substring(0, 200)}...`}
                                </p>
                              )}

                              {review.images && review.images.length > 0 && (isExpanded || !needsExpand) && (
                                <div className="review-media-grid">
                                  {review.images.map((img, idx) => (
                                    <div key={idx} className="media-item">
                                      <img 
                                        src={`http://localhost:5000${img}`} 
                                        alt={`Review ${idx + 1}`}
                                        onClick={() => window.open(`http://localhost:5000${img}`, '_blank')}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {review.videos && review.videos.length > 0 && (isExpanded || !needsExpand) && (
                                <div className="review-media-grid">
                                  {review.videos.map((vid, idx) => (
                                    <div key={idx} className="media-item video">
                                      <video controls>
                                        <source src={`http://localhost:5000${vid}`} type="video/mp4" />
                                      </video>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {needsExpand && (
                                <button 
                                  className="expand-btn"
                                  onClick={() => toggleReviewExpand(review._id)}
                                >
                                  {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                                  <svg 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                                  >
                                    <polyline points="6 9 12 15 18 9"/>
                                  </svg>
                                </button>
                              )}
                            </div>

                            {review.reply && (
                              <div className="shop-reply">
                                <div className="reply-header">
                                  <span className="reply-badge">Phản hồi từ shop</span>
                                  <span className="reply-date">{formatDate(review.reply.repliedAt)}</span>
                                </div>
                                <p className="reply-content">{review.reply.content}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
