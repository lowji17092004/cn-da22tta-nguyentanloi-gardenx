import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { getCategoryDisplayName, getCategorySlug } from '../utils/categoryUtils'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add, announce, setBuyNow } = useCart()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [relatedIndex, setRelatedIndex] = useState(0)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description') // description, reviews, care
  const [expandedReviews, setExpandedReviews] = useState(new Set())
  const [showImageModal, setShowImageModal] = useState(false)
  const [likedReviews, setLikedReviews] = useState(new Set())
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [reviewImages, setReviewImages] = useState([])
  const [reviewVideo, setReviewVideo] = useState(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [uploadingReview, setUploadingReview] = useState(false)

  const RELATED_PER_PAGE = 4

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`)
        setProduct(res.data)
        
        // Fetch related products from same category
        const allProducts = await axios.get('/api/products')
        const related = allProducts.data
          .filter(p => p._id !== id && p.category === res.data.category)
          .slice(0, 12)
        setRelatedProducts(related)
        setRelatedIndex(0)
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }
    
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true)
        const token = localStorage.getItem('token')
        const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {}
        const res = await axios.get(`/api/reviews/product/${id}`, config)
        console.log('Reviews fetched:', res.data)
        setReviews(res.data.reviews || [])
        setReviewStats(res.data.stats)
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews([])
        setReviewStats(null)
      } finally {
        setReviewsLoading(false)
      }
    }
    
    const checkPurchaseStatus = async () => {
      if (user) {
        try {
          const res = await axios.get('/api/orders/my-orders')
          const orders = res.data
          const purchased = orders.some(order => 
            order.status === 'delivered' && 
            order.items?.some(item => 
              item.product?._id === id || item.product === id
            )
          )
          setHasPurchased(purchased)
        } catch (error) {
          console.error('Error checking purchase status:', error)
        }
      }
    }
    
    fetchProduct()
    fetchReviews()
    checkPurchaseStatus()
  }, [id, user])

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
  }

  const handleBuyNow = () => {
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
    
    // Set buy now item and navigate to checkout
    setBuyNow(product, quantity)
    navigate('/checkout')
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

  const handleLikeReview = async (reviewId) => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(`/api/reviews/${reviewId}/like`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Toggle local state
      setLikedReviews(prev => {
        const newSet = new Set(prev)
        if (newSet.has(reviewId)) {
          newSet.delete(reviewId)
        } else {
          newSet.add(reviewId)
        }
        return newSet
      })

      // Update review count locally
      setReviews(prevReviews => prevReviews.map(review => {
        if (review._id === reviewId) {
          const isLiked = likedReviews.has(reviewId)
          return {
            ...review,
            likes: (review.likes || 0) + (isLiked ? -1 : 1)
          }
        }
        return review
      }))
    } catch (error) {
      console.error('Error liking review:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá')
      return
    }

    try {
      setUploadingReview(true)

      // Upload images first if any
      let imageUrls = []
      let videoUrl = null

      if (reviewImages.length > 0) {
        for (const img of reviewImages) {
          const formData = new FormData()
          formData.append('image', img)
          
          try {
            const uploadRes = await axios.post('/api/upload/review', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
            imageUrls.push(uploadRes.data.url)
          } catch (err) {
            console.error('Error uploading image:', err)
          }
        }
      }

      // Upload video if any
      if (reviewVideo) {
        const formData = new FormData()
        formData.append('video', reviewVideo)
        
        try {
          const uploadRes = await axios.post('/api/upload/review-video', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          videoUrl = uploadRes.data.url
        } catch (err) {
          console.error('Error uploading video:', err)
        }
      }

      // Submit review
      await axios.post('/api/reviews', {
        product: id,
        rating: newReview.rating,
        comment: newReview.comment,
        images: imageUrls,
        video: videoUrl
      })

      alert('Đánh giá thành công!')
      setShowReviewForm(false)
      setNewReview({ rating: 5, comment: '' })
      setReviewImages([])
      setReviewVideo(null)
      
      // Reload reviews
      const res = await axios.get(`/api/reviews/product/${id}`)
      setReviews(res.data.reviews || [])
      setReviewStats(res.data.stats)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Có lỗi xảy ra khi gửi đánh giá')
    } finally {
      setUploadingReview(false)
    }
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
      <div className="pd-loading">
        <div className="pd-spinner"></div>
        <p>Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pd-error">
        <div className="pd-error-icon">🔍</div>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/shop" className="pd-btn-back">Quay lại cửa hàng</Link>
      </div>
    )
  }

  const normalizeImage = (url) => {
    if (!url) return null
    return url.startsWith('http') ? url : `http://localhost:5000${url}`
  }

  const images = (product.images && product.images.length > 0
    ? product.images
    : (product.imageUrl ? [product.imageUrl] : [])
  ).map(normalizeImage).filter(Boolean)
  const categorySlug = getCategorySlug(product.category)

  return (
    <div className="pd-page-wrapper">
      {/* Breadcrumb & Title Section */}
      <div className="pd-hero">
        <div className="container">
          <nav className="pd-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="pd-sep">›</span>
            <Link to="/shop">Sản phẩm</Link>
            {product.category && (
              <>
                <span className="pd-sep">›</span>
                <Link to={`/category/${categorySlug}`}>
                  {getCategoryDisplayName(product.category)}
                </Link>
              </>
            )}
            <span className="pd-sep">›</span>
            <span className="pd-current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="pd-main">
        <div className="container">
          <div className="pd-layout">
            {/* Left Column - Images */}
            <div className="pd-images-column">
              <div className="pd-gallery">
                <div 
                  className="pd-main-image"
                  onClick={() => setShowImageModal(true)}
                >
                  {images.length > 0 ? (
                    <img src={images[selectedImage]} alt={product.name} />
                  ) : (
                    <div className="pd-no-image">
                      <span>🌿</span>
                      <p>Chưa có hình ảnh</p>
                    </div>
                  )}
                  {images.length > 0 && (
                    <div className="pd-zoom-hint">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="M21 21l-4.35-4.35"/>
                        <path d="M11 8v6"/>
                        <path d="M8 11h6"/>
                      </svg>
                      <span>Click để phóng to</span>
                    </div>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="pd-thumbs">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`pd-thumb ${idx === selectedImage ? 'active' : ''}`}
                        onClick={() => setSelectedImage(idx)}
                      >
                        <img src={img} alt={`${product.name} ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Cards */}
              <div className="pd-info-cards">
                <div className="pd-info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <div>
                    <h4>Đảm bảo chất lượng</h4>
                    <p>Sản phẩm chính hãng 100%</p>
                  </div>
                </div>
                
                <div className="pd-info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <div>
                    <h4>Giao hàng nhanh</h4>
                    <p>Miễn phí ship đơn trên 500K</p>
                  </div>
                </div>
                
                <div className="pd-info-card">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <div>
                    <h4>Hỗ trợ 24/7</h4>
                    <p>Tư vấn chăm sóc miễn phí</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="pd-details-column">
              <div className="pd-sticky-card">
                {/* Product Header */}
                <div className="pd-header">
                  {(product.isBestSeller || product.isFeatured) && (
                    <div className="pd-badges">
                      {product.isBestSeller && (
                        <span className="pd-badge bestseller">
                          🔥 Bán chạy
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="pd-badge featured">
                          ⭐ Nổi bật
                        </span>
                      )}
                    </div>
                  )}
                  
                  <h1 className="pd-title">{product.name}</h1>
                  
                  {/* Rating */}
                  {reviewStats && reviewStats.averageRating > 0 && (
                    <div className="pd-rating">
                      <div className="pd-rating-stars">
                        {renderStars(Math.round(reviewStats.averageRating))}
                      </div>
                      <span className="pd-rating-score">{reviewStats.averageRating.toFixed(1)}</span>
                      <span className="pd-rating-count">({reviewStats.totalReviews} đánh giá)</span>
                      <span className="pd-sold-count">• {product.sold || 0} đã bán</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="pd-price-section">
                  <div className="pd-price-main">
                    <span className="pd-price">{product.price?.toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="pd-meta-grid">
                  <div className="pd-meta-item">
                    <span className="pd-meta-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a1 1 0 00-1 1v11a2 2 0 002 2h14a2 2 0 002-2V8a1 1 0 00-1-1zM10 5h4v2h-4V5z"/>
                      </svg>
                      Danh mục
                    </span>
                    <span className="pd-meta-value">{getCategoryDisplayName(product.category)}</span>
                  </div>
                  
                  {product.subcategory && (
                    <div className="pd-meta-item">
                      <span className="pd-meta-label">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 7h10M7 12h10M7 17h10"/>
                        </svg>
                        Loại
                      </span>
                      <span className="pd-meta-value">{getCategoryDisplayName(product.subcategory)}</span>
                    </div>
                  )}
                  
                  <div className="pd-meta-item">
                    <span className="pd-meta-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM12 15a3 3 0 100-6 3 3 0 000 6z"/>
                        <path d="M2 9.5L12 4l10 5.5"/>
                      </svg>
                      Tồn kho
                    </span>
                    <span className="pd-meta-value" style={{color: product.stock > 0 ? '#10b981' : '#ef4444'}}>
                      {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
                    </span>
                  </div>

                  <div className="pd-meta-item">
                    <span className="pd-meta-label">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20v-6M6 12l6-8 6 8"/>
                      </svg>
                      Đã bán
                    </span>
                    <span className="pd-meta-value">{product.sold || 0} sản phẩm</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="pd-quantity-section">
                    <label className="pd-quantity-label">Số lượng</label>
                    <div className="pd-quantity-control">
                      <button
                        className="pd-qty-btn"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                      <input
                        type="number"
                        className="pd-qty-input"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          setQuantity(Math.max(1, Math.min(product.stock, val)))
                        }}
                        min="1"
                        max={product.stock}
                      />
                      <button
                        className="pd-qty-btn"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                    </div>
                    {quantity === product.stock && (
                      <span className="pd-stock-warn">Đã đạt giới hạn tồn kho</span>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pd-actions">
                  <button
                    className="pd-btn-add-to-cart"
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    <span>{product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</span>
                  </button>
                  
                  <button
                    className="pd-btn-buy-now"
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z"/>
                    </svg>
                    <span>Mua ngay</span>
                  </button>
                </div>

                {/* Delivery Info */}
                <div className="pd-delivery-info">
                  <div className="pd-delivery-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>Giao hàng trong 2-3 ngày</span>
                  </div>
                  
                  <div className="pd-delivery-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Hỗ trợ tư vấn miễn phí</span>
                  </div>
                  
                  <div className="pd-delivery-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Đổi trả trong 7 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="pd-tabs-section">
            <div className="pd-tabs-header">
              <button
                className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                Mô tả sản phẩm
              </button>
              
              <button
                className={`pd-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
                onClick={() => setActiveTab('care')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Hướng dẫn chăm sóc
              </button>
              
              <button
                className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Đánh giá ({reviewStats?.totalReviews || 0})
              </button>
            </div>

            <div className="pd-tabs-content">
              {activeTab === 'description' && (
                <div className="pd-tab-panel">
                  <h3>Thông tin sản phẩm</h3>
                  <p className="pd-description">{product.description || 'Chưa có mô tả chi tiết'}</p>
                </div>
              )}

              {activeTab === 'care' && (
                <div className="pd-tab-panel">
                  <h3>Hướng dẫn chăm sóc</h3>
                  <div className="pd-care-tips">
                    <div className="pd-care-item">
                      <span className="pd-care-icon">💧</span>
                      <div>
                        <h4>Tưới nước</h4>
                        <p>Tưới 2-3 lần/tuần, giữ đất ẩm nhẹ</p>
                      </div>
                    </div>
                    
                    <div className="pd-care-item">
                      <span className="pd-care-icon">☀️</span>
                      <div>
                        <h4>Ánh sáng</h4>
                        <p>Cần ánh sáng gián tiếp, tránh ánh nắng trực tiếp</p>
                      </div>
                    </div>
                    
                    <div className="pd-care-item">
                      <span className="pd-care-icon">🌡️</span>
                      <div>
                        <h4>Nhiệt độ</h4>
                        <p>18-25°C là nhiệt độ lý tưởng</p>
                      </div>
                    </div>
                    
                    <div className="pd-care-item">
                      <span className="pd-care-icon">🪴</span>
                      <div>
                        <h4>Phân bón</h4>
                        <p>Bón phân NPK 1-2 lần/tháng</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="pd-tab-panel">
                  {/* Hiển thị stats đánh giá */}
                  {reviewStats && reviewStats.totalReviews > 0 && (
                    <div className="pd-review-stats">
                      <div className="pd-stats-summary">
                        <div className="pd-stats-score">
                          <div className="pd-stats-number">{reviewStats.averageRating.toFixed(1)}</div>
                          <div className="pd-stats-stars">{renderStars(Math.round(reviewStats.averageRating))}</div>
                          <div className="pd-stats-count">{reviewStats.totalReviews} đánh giá</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Form đánh giá cho user đã mua */}
                  {user ? (
                    hasPurchased ? (
                      <div className="pd-write-review-section">
                        {!showReviewForm ? (
                          <button 
                            className="pd-btn-write-review"
                            onClick={() => setShowReviewForm(true)}
                          >
                            ✍️ Viết đánh giá của bạn
                          </button>
                        ) : (
                          <div className="pd-review-form">
                            <h4>Đánh giá của bạn</h4>
                            <div className="pd-form-rating">
                              <label>Xếp hạng:</label>
                              <div className="pd-star-input">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`star ${star <= newReview.rating ? 'active' : ''}`}
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="pd-form-comment">
                              <label>Nhận xét:</label>
                              <textarea
                                value={newReview.comment}
                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                rows="4"
                              />
                            </div>
                            
                            {/* Upload hình ảnh */}
                            <div className="pd-form-media">
                              <label>📷 Thêm hình ảnh (tối đa 5):</label>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files).slice(0, 5)
                                  setReviewImages(files)
                                }}
                              />
                              {reviewImages.length > 0 && (
                                <div className="pd-preview-images">
                                  {reviewImages.map((img, idx) => (
                                    <div key={idx} className="pd-preview-img">
                                      <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} />
                                      <button onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}>×</button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Upload video */}
                            <div className="pd-form-media">
                              <label>🎥 Thêm video (tối đa 50MB):</label>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files[0]
                                  if (file && file.size <= 50 * 1024 * 1024) {
                                    setReviewVideo(file)
                                  } else if (file) {
                                    alert('Video phải nhỏ hơn 50MB')
                                  }
                                }}
                              />
                              {reviewVideo && (
                                <div className="pd-preview-video">
                                  <video src={URL.createObjectURL(reviewVideo)} controls width="200" />
                                  <button onClick={() => setReviewVideo(null)}>×</button>
                                </div>
                              )}
                            </div>

                            <div className="pd-form-actions">
                              <button 
                                className="pd-btn-cancel"
                                onClick={() => {
                                  setShowReviewForm(false)
                                  setNewReview({ rating: 5, comment: '' })
                                  setReviewImages([])
                                  setReviewVideo(null)
                                }}
                              >
                                Hủy
                              </button>
                              <button 
                                className="pd-btn-submit-review"
                                onClick={handleSubmitReview}
                                disabled={uploadingReview}
                              >
                                {uploadingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null
                  ) : null}
                  
                  {/* Hiển thị message cho user chưa mua */}
                  {user && !hasPurchased && (
                    <div className="pd-purchase-hint">
                      <span className="icon">💡</span>
                      <p>Mua và nhận sản phẩm để viết đánh giá của bạn</p>
                    </div>
                  )}
                  
                  {/* Hiển thị message cho user chưa login */}
                  {!user && (
                    <div className="pd-login-hint">
                      <span className="icon">💡</span>
                      <p><Link to="/login">Đăng nhập</Link> để viết đánh giá</p>
                    </div>
                  )}
                  
                  {/* Danh sách đánh giá - luôn hiển thị */}
                  {reviewsLoading ? (
                    <div className="pd-reviews-loading">Đang tải đánh giá...</div>
                  ) : reviews.length > 0 ? (
                    <div className="pd-reviews-list">
                      {reviews.map(review => (
                        <div key={review._id} className="pd-review-card">
                          <div className="pd-review-header">
                            <div className="pd-review-avatar">
                              {review.user?.avatar ? (
                                <img 
                                  src={review.user.avatar.startsWith('http') 
                                    ? review.user.avatar 
                                    : review.user.avatar.startsWith('/uploads') 
                                      ? `http://localhost:5000${review.user.avatar}`
                                      : `http://localhost:5000/uploads/avatars/${review.user.avatar}`
                                  }
                                  alt={review.user?.name || 'User'}
                                  onError={(e) => { 
                                    e.target.style.display = 'none'; 
                                    e.target.parentElement.textContent = review.user?.name?.charAt(0).toUpperCase() || 'U';
                                  }}
                                />
                              ) : (
                                review.user?.name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="pd-review-info">
                              <div className="pd-review-name">{review.user?.name || 'Người dùng'}</div>
                              <div className="pd-review-meta">
                                {renderStars(review.rating)}
                                <span className="pd-review-date">{formatDate(review.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="pd-review-comment">{review.comment}</p>
                          
                          {/* Like button */}
                          <div className="pd-review-actions">
                            <button
                              className={`pd-review-like-btn ${likedReviews.has(review._id) ? 'liked' : ''}`}
                              onClick={() => handleLikeReview(review._id)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill={likedReviews.has(review._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                              </svg>
                              <span>Hữu ích ({review.likes || 0})</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pd-no-reviews">
                      <span className="pd-no-reviews-icon">💬</span>
                      <p>Chưa có đánh giá nào</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pd-related-section">
              <div className="pd-related-header">
                <h2 className="pd-related-title">Sản phẩm tương tự</h2>
                {relatedProducts.length > RELATED_PER_PAGE && (
                  <div className="pd-related-nav">
                    <button
                      className="pd-related-nav-btn"
                      onClick={() => setRelatedIndex(Math.max(0, relatedIndex - RELATED_PER_PAGE))}
                      disabled={relatedIndex === 0}
                      aria-label="Xem sản phẩm trước"
                    >
                      ‹
                    </button>
                    <button
                      className="pd-related-nav-btn"
                      onClick={() => setRelatedIndex(Math.min(relatedProducts.length - RELATED_PER_PAGE, relatedIndex + RELATED_PER_PAGE))}
                      disabled={relatedIndex >= relatedProducts.length - RELATED_PER_PAGE}
                      aria-label="Xem sản phẩm tiếp"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
              <div className="pd-related-grid">
                {relatedProducts.slice(relatedIndex, relatedIndex + RELATED_PER_PAGE).map(item => (
                  <Link key={item._id} to={`/product/${item._id}`} className="pd-related-card">
                    <div className="pd-related-image">
                      {item.imageUrl || item.images?.[0] ? (
                        <img src={item.imageUrl || item.images[0]} alt={item.name} />
                      ) : (
                        <div className="pd-related-no-img">🌿</div>
                      )}
                    </div>
                    <div className="pd-related-info">
                      <h4>{item.name}</h4>
                      <p className="pd-related-price">{item.price?.toLocaleString('vi-VN')}₫</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && images.length > 0 && (
        <div className="pd-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="pd-modal-content" onClick={e => e.stopPropagation()}>
            <button className="pd-modal-close" onClick={() => setShowImageModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img src={images[selectedImage]} alt={product.name} />
          </div>
        </div>
      )}
    </div>
  )
}
