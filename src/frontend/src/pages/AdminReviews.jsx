import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import Toast from '../components/Toast'
import './AdminReviews.css'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRating, setFilterRating] = useState('')
  const [filterReplied, setFilterReplied] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await api.get('/reviews')
      // API returns { reviews, total, ... } object
      setReviews(res.data.reviews || res.data || [])
    } catch (e) {
      console.error('Error loading reviews:', e)
      setReviews([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleReply = async (reviewId) => {
    if (!replyContent.trim()) {
      showToast('Vui lòng nhập nội dung phản hồi', 'warning')
      return
    }

    setSubmittingReply(true)
    try {
      await api.post(`/reviews/${reviewId}/reply`, { content: replyContent })
      setReplyContent('')
      setReplyingTo(null)
      loadReviews()
      showToast('Phản hồi đánh giá thành công', 'success')
    } catch (e) {
      showToast('Có lỗi xảy ra khi gửi phản hồi', 'error')
    }
    setSubmittingReply(false)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return

    try {
      await api.delete(`/reviews/${reviewId}`)
      loadReviews()
      showToast('Xóa đánh giá thành công', 'success')
    } catch (e) {
      showToast('Có lỗi xảy ra khi xóa đánh giá', 'error')
    }
  }

  const filteredReviews = reviews.filter(r => {
    const matchRating = !filterRating || r.rating === parseInt(filterRating)
    const matchReplied = !filterReplied || 
      (filterReplied === 'replied' ? r.reply?.content : !r.reply?.content)
    const matchSearch = !searchTerm || 
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchRating && matchReplied && matchSearch
  })

  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
      : 0,
    needReply: reviews.filter(r => !r.reply?.content).length,
    replied: reviews.filter(r => r.reply?.content).length
  }

  const renderStars = (rating) => {
    return (
      <div className="star-display">
        {[1, 2, 3, 4, 5].map(star => (
          <svg 
            key={star} 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill={star <= rating ? '#f5c518' : 'none'} 
            stroke={star <= rating ? '#f5c518' : '#ccc'} 
            strokeWidth="2"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Đánh giá</h1>
          <p className="admin-page-desc">Xem và phản hồi đánh giá từ khách hàng</p>
        </div>
      </div>

      {!loading && reviews.length > 0 && (
        <>
          {/* Stats Row */}
          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Tổng đánh giá</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeWidth="1.5" fill="#f5c518"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Điểm trung bình</div>
                <div className="stat-value">{stats.avgRating}/5</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Chờ phản hồi</div>
                <div className="stat-value">{stats.needReply}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Đã phản hồi</div>
                <div className="stat-value">{stats.replied}</div>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="admin-filter-bar">
            <div className="filter-search">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Tìm theo nội dung, khách hàng, sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label-inline">Số sao:</label>
              <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)} className="filter-select">
                <option value="">Tất cả</option>
                <option value="5">5 sao</option>
                <option value="4">4 sao</option>
                <option value="3">3 sao</option>
                <option value="2">2 sao</option>
                <option value="1">1 sao</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label-inline">Trạng thái:</label>
              <select value={filterReplied} onChange={(e) => setFilterReplied(e.target.value)} className="filter-select">
                <option value="">Tất cả</option>
                <option value="pending">Chờ phản hồi</option>
                <option value="replied">Đã phản hồi</option>
              </select>
            </div>
          </div>

          <div className="admin-results-info">
            <span>Hiển thị <strong>{filteredReviews.length}</strong> / {reviews.length} đánh giá</span>
          </div>
        </>
      )}

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải đánh giá...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3>Chưa có đánh giá nào</h3>
          <p>Các đánh giá từ khách hàng sẽ hiển thị ở đây</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3>Không tìm thấy đánh giá</h3>
          <p>Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="admin-reviews-list">
          {filteredReviews.map(review => (
            <div key={review._id} className="admin-review-card">
              <div className="review-card-header">
                <div className="review-user-info">
                  <div className="user-avatar-wrapper">
                    {review.user?.avatar ? (
                      <img 
                        src={review.user.avatar.startsWith('http') 
                          ? review.user.avatar 
                          : review.user.avatar.startsWith('/uploads') 
                            ? `http://localhost:5000${review.user.avatar}`
                            : `http://localhost:5000/uploads/avatars/${review.user.avatar}`
                        }
                        alt={review.user?.name || 'User'}
                        className="user-avatar"
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                        }}
                      />
                    ) : null}
                    <div className="user-avatar-fallback" style={{ display: review.user?.avatar ? 'none' : 'flex' }}>
                      {(review.user?.name || 'K').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="user-details">
                    <div className="user-name">{review.user?.name || 'Khách hàng ẩn danh'}</div>
                    <div className="review-meta">
                      <span className="review-date">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(review.createdAt).toLocaleString('vi-VN')}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="verified-badge">
                          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Đã mua hàng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>

              <div className="review-product-info-modern">
                {review.product ? (
                  <Link to={`/product/${review.product._id}`} className="product-link">
                    {review.product.image && (
                      <img 
                        src={`http://localhost:5000${review.product.image}`} 
                        alt={review.product.name} 
                        className="review-product-thumb"
                        onError={(e) => { e.target.src = '/placeholder.png' }}
                      />
                    )}
                    <div className="product-info-text">
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="review-product-name">{review.product.name}</span>
                    </div>
                  </Link>
                ) : (
                  <div className="product-deleted">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Sản phẩm đã xóa</span>
                  </div>
                )}
              </div>

              {review.comment && (
                <div className="review-comment">
                  <p>{review.comment}</p>
                </div>
              )}

              {(review.images?.length > 0 || review.videos?.length > 0) && (
                <div className="review-media-gallery">
                  {review.images?.map((img, idx) => (
                    <div key={`img-${idx}`} className="media-item">
                      <img src={`http://localhost:5000${img}`} alt="Review" />
                    </div>
                  ))}
                  {review.videos?.map((vid, idx) => (
                    <div key={`vid-${idx}`} className="media-item video">
                      <video controls>
                        <source src={`http://localhost:5000${vid}`} />
                      </video>
                    </div>
                  ))}
                </div>
              )}

              {review.reply?.content ? (
                <div className="review-admin-reply">
                  <div className="reply-header">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>Phản hồi của shop</span>
                    <span className="reply-time">{new Date(review.reply.repliedAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <p>{review.reply.content}</p>
                </div>
              ) : replyingTo === review._id ? (
                <div className="reply-form">
                  <textarea
                    className="reply-textarea"
                    placeholder="Nhập phản hồi của bạn..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={3}
                  />
                  <div className="reply-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hủy
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleReply(review._id)}
                      disabled={submittingReply}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="review-actions">
                  <button 
                    className="btn btn-reply"
                    onClick={() => setReplyingTo(review._id)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Phản hồi
                  </button>
                  <button 
                    className="btn btn-delete"
                    onClick={() => handleDeleteReview(review._id)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
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
