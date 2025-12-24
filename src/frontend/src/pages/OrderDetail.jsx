import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewVideo, setReviewVideo] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [productReviews, setProductReviews] = useState({});
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
      
      // Fetch reviews for products in this order
      if (res.data.items && res.data.items.length > 0) {
        const reviewPromises = res.data.items.map(async (item) => {
          try {
            const productId = item.product?._id || item.product;
            const reviewRes = await api.get(`/reviews/user-review/${productId}/${res.data._id}`);
            return { productId, review: reviewRes.data };
          } catch (err) {
            return { productId: item.product?._id || item.product, review: null };
          }
        });
        
        const reviewsData = await Promise.all(reviewPromises);
        const reviewsMap = {};
        reviewsData.forEach(({ productId, review }) => {
          reviewsMap[productId] = review;
        });
        setProductReviews(reviewsMap);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusConfig = {
    pending: { text: 'Chờ xác nhận', icon: '⏳' },
    confirmed: { text: 'Đã xác nhận', icon: '✅' },
    preparing: { text: 'Đang chuẩn bị', icon: '📦' },
    shipping: { text: 'Đang giao hàng', icon: '🚚' },
    delivered: { text: 'Đã giao hàng', icon: '🎉' },
    cancelled: { text: 'Đã hủy', icon: '❌' }
  };

  const timelineSteps = [
    { key: 'pending', icon: '📝', label: 'Đặt hàng' },
    { key: 'confirmed', icon: '✅', label: 'Xác nhận' },
    { key: 'preparing', icon: '📦', label: 'Chuẩn bị' },
    { key: 'shipping', icon: '🚚', label: 'Giao hàng' },
    { key: 'delivered', icon: '🎉', label: 'Hoàn thành' }
  ];

  const getStepState = (stepKey) => {
    if (order?.status === 'cancelled') return '';
    const statusOrder = ['pending', 'confirmed', 'preparing', 'shipping', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);
    const stepIndex = statusOrder.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return '';
  };

  // Fix product image
  const getProductImage = (item) => {
    const img = item.image || item.product?.images?.[0] || item.product?.image;
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
    
    try {
      await api.put(`/orders/${id}`, { status: 'cancelled' });
      
      // Notify system
      await api.post('/messages', {
        name: 'Hệ thống',
        email: 'system@thesungarden.vn',
        phone: '',
        subject: '❌ Đơn hàng bị hủy',
        message: `Đơn hàng #${id.slice(-8).toUpperCase()} đã bị hủy bởi khách hàng.`
      });

      alert('Đơn hàng đã được hủy');
      fetchOrder();
    } catch (err) {
      console.error('Cancel error:', err);
      alert('Không thể hủy đơn hàng');
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedProduct || !reviewData.comment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }

    try {
      setUploadingMedia(true);
      
      // Upload images if any
      let uploadedImages = [];
      if (reviewImages.length > 0) {
        for (const img of reviewImages) {
          const formData = new FormData();
          formData.append('image', img);
          const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          if (uploadRes.data.imageUrl) {
            uploadedImages.push(uploadRes.data.imageUrl);
          }
        }
      }

      // Upload video if any
      let uploadedVideo = null;
      if (reviewVideo) {
        const formData = new FormData();
        formData.append('video', reviewVideo);
        const uploadRes = await api.post('/upload/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.data.videoUrl) {
          uploadedVideo = uploadRes.data.videoUrl;
        }
      }

      if (editingReview) {
        // Update existing review
        await api.put(`/reviews/${editingReview._id}`, {
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: uploadedImages,
          video: uploadedVideo
        });
        alert('Cập nhật đánh giá thành công!');
      } else {
        // Create new review
        await api.post('/reviews', {
          order: order._id,
          orderItem: selectedProduct._id,
          product: selectedProduct.product?._id || selectedProduct.product,
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: uploadedImages,
          video: uploadedVideo
        });
        alert('Đánh giá thành công!');
      }

      setShowReviewModal(false);
      setSelectedProduct(null);
      setReviewData({ rating: 5, comment: '' });
      setReviewImages([]);
      setReviewVideo(null);
      setEditingReview(null);
      
      // Refresh order to get updated reviews
      fetchOrder();
    } catch (err) {
      console.error('Review error:', err);
      alert(err.response?.data?.message || 'Không thể gửi đánh giá');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleEditReview = (item, review) => {
    setSelectedProduct(item);
    setEditingReview(review);
    setReviewData({
      rating: review.rating,
      comment: review.comment
    });
    setShowReviewModal(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      alert('Đã xóa đánh giá');
      fetchOrder();
    } catch (err) {
      console.error('Delete review error:', err);
      alert('Không thể xóa đánh giá');
    }
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="detail-loading">
          <div className="spinner"></div>
          <span>Đang tải thông tin đơn hàng...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="not-found">
          <div className="icon">📭</div>
          <h2>Không tìm thấy đơn hàng</h2>
          <p>Đơn hàng không tồn tại hoặc đã bị xóa</p>
          <Link to="/orders" className="back-btn">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
  const shipping = 30000;

  return (
    <div className="order-detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="header-content">
          <Link to="/orders" className="back-link">
            <span className="back-arrow">&lt;</span>
            <span>Quay lại</span>
          </Link>
          
          <div className="order-title">
            <h1>Chi tiết đơn hàng</h1>
            <span className="order-code">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
          
          <div className="order-date-prominent">
            <span className="date-label">Ngày đặt:</span>
            <span className="date-value">{formatDate(order.createdAt)}</span>
          </div>

          <div className={`status-badge-large ${order.status}`}>
            <span>{statusConfig[order.status]?.icon}</span>
            <span>{statusConfig[order.status]?.text}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Main Column */}
        <div className="detail-main">
          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="detail-card">
              <h3 className="card-title">
                <span className="icon">📍</span>
                Trạng thái đơn hàng
              </h3>
              <div className="timeline">
                {timelineSteps.map(step => (
                  <div key={step.key} className={`timeline-step ${getStepState(step.key)}`}>
                    <div className="step-icon">{step.icon}</div>
                    <span className="step-label">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          <div className="detail-card">
            <h3 className="card-title">
              <span className="icon">🛍️</span>
              Sản phẩm đã đặt ({order.items?.length || 0})
            </h3>            {order.status === 'delivered' && (
              <div style={{padding: '12px 16px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '10px', marginBottom: '16px', border: '2px dashed #fbbf24'}}>
                <p style={{margin: 0, color: '#92400e', fontSize: '14px', fontWeight: 600}}>
                  ⭐ Đơn hàng đã hoàn thành! Bạn có thể đánh giá sản phẩm bên dưới.
                </p>
              </div>
            )}            <div className="product-list-vertical">
              {order.items?.map((item, idx) => {
                const productId = item.product?._id || item.product;
                const existingReview = productReviews[productId];
                
                return (
                  <div className="product-card-vertical" key={idx}>
                    <a 
                      href={`/product/${item.product?.slug || item.product?._id || item.product}`}
                      className="product-image-vertical"
                      style={{textDecoration: 'none'}}
                    >
                      {getProductImage(item) ? (
                        <img 
                          src={getProductImage(item)} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="emoji">🌸</span>
                      )}
                    </a>
                    <div className="product-info-vertical">
                      <a 
                        href={`/product/${item.product?.slug || item.product?._id || item.product}`}
                        className="product-name-vertical"
                        style={{textDecoration: 'none', color: 'inherit'}}
                      >
                        {item.name}
                      </a>
                      
                      {order.status === 'delivered' && (
                        existingReview ? (
                          <div className="reviewed-status">
                            <div className="reviewed-badge">
                              ✅ Đã đánh giá
                              <div className="review-stars">
                                {'★'.repeat(existingReview.rating)}{'☆'.repeat(5 - existingReview.rating)}
                              </div>
                            </div>
                            <div className="review-actions">
                              <button 
                                className="btn-edit-review"
                                onClick={() => handleEditReview(item, existingReview)}
                              >
                                ✏️ Sửa
                              </button>
                              <button 
                                className="btn-delete-review"
                                onClick={() => handleDeleteReview(existingReview._id)}
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn-review-product"
                            onClick={() => {
                              setSelectedProduct(item);
                              setEditingReview(null);
                              setReviewData({ rating: 5, comment: '' });
                              setShowReviewModal(true);
                            }}
                          >
                            ⭐ Đánh giá
                          </button>
                        )
                      )}
                    </div>
                    <div className="product-total-vertical">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Info */}
          <div className="detail-card">
            <h3 className="card-title">
              <span className="icon">📦</span>
              Thông tin giao hàng
            </h3>
            <div className="shipping-info-simple">
              <div className="info-row-simple">
                <span className="icon-simple">👤</span>
                <strong>{order.customerName}</strong>
              </div>
              <div className="info-row-simple">
                <span className="icon-simple">📱</span>
                <span>{order.phone}</span>
              </div>
              {order.customerEmail && (
                <div className="info-row-simple">
                  <span className="icon-simple">✉️</span>
                  <span>{order.customerEmail}</span>
                </div>
              )}
              <div className="info-row-simple">
                <span className="icon-simple">📍</span>
                <span>{order.shippingAddress}</span>
              </div>
              {order.note && (
                <div className="info-row-simple">
                  <span className="icon-simple">📝</span>
                  <em>{order.note}</em>
                </div>
              )}
            </div>
          </div>

          {order.notes && (
            <div className="note-box" style={{marginTop: '16px'}}>
              <div className="label">📝 Ghi chú</div>
              <div className="text">{order.notes}</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          {/* Payment Card */}
          <div className="payment-card">
            <h3 className="card-title">
              <span className="icon">💳</span>
              Thanh toán
            </h3>

            <div className={`payment-status ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
              <span>{order.paymentStatus === 'paid' ? '✅' : '⏳'}</span>
              <span>{order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
            </div>

            <div className="payment-rows">
              <div className="payment-row">
                <span>Phương thức:</span>
                <span>ZaloPay</span>
              </div>
              <div className="payment-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="payment-row">
                <span>Phí vận chuyển:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="payment-row total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-card action-card">
            <Link to="/products" className="action-btn primary">
              🛍️ Tiếp tục mua sắm
            </Link>
            
            <Link to="/orders" className="action-btn secondary">
              📋 Xem tất cả đơn hàng
            </Link>

            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button className="action-btn danger" onClick={handleCancelOrder}>
                ❌ Hủy đơn hàng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="review-modal-header">
              <h3>{editingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}</h3>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            <div className="review-modal-body">
              <div className="review-product-info">
                <img src={getProductImage(selectedProduct)} alt={selectedProduct.name} />
                <span>{selectedProduct.name}</span>
              </div>
              <div className="review-rating">
                <label>Đánh giá:</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${star <= reviewData.rating ? 'active' : ''}`}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="review-comment">
                <label>Nhận xét:</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  rows="4"
                />
              </div>

              {/* Upload hình ảnh */}
              <div className="review-media-upload">
                <label>📷 Thêm hình ảnh (tối đa 5 ảnh):</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 5);
                    setReviewImages(files);
                  }}
                  className="media-input"
                />
                {reviewImages.length > 0 && (
                  <div className="preview-images">
                    {reviewImages.map((img, idx) => (
                      <div key={idx} className="preview-image">
                        <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} />
                        <button 
                          type="button"
                          className="remove-preview"
                          onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload video */}
              <div className="review-media-upload">
                <label>🎥 Thêm video (tối đa 1 video, dưới 50MB):</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size <= 50 * 1024 * 1024) {
                      setReviewVideo(file);
                    } else if (file) {
                      alert('Video phải nhỏ hơn 50MB');
                    }
                  }}
                  className="media-input"
                />
                {reviewVideo && (
                  <div className="preview-video">
                    <video src={URL.createObjectURL(reviewVideo)} controls width="200" />
                    <button 
                      type="button"
                      className="remove-preview"
                      onClick={() => setReviewVideo(null)}
                    >×</button>
                  </div>
                )}
              </div>
            </div>
            <div className="review-modal-footer">
              <button className="btn-cancel" onClick={() => setShowReviewModal(false)}>Hủy</button>
              <button 
                className="btn-submit" 
                onClick={handleReviewSubmit}
                disabled={uploadingMedia}
              >
                {uploadingMedia ? 'Đang gửi...' : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
