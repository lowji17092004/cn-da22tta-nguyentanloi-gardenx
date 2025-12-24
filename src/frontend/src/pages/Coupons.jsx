import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import PageBanner from '../components/PageBanner';
import './Coupons.css';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingCoupon, setSavingCoupon] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCoupons();
    if (user) {
      loadSavedCoupons();
    }
  }, [user]);

  const loadCoupons = async () => {
    try {
      const res = await api.get('/coupons/active');
      setCoupons(res.data || []);
    } catch (error) {
      console.error('Load coupons error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedCoupons = async () => {
    try {
      const res = await api.get('/coupons/my-coupons');
      setSavedCoupons(res.data || []);
    } catch (error) {
      console.error('Load saved coupons error:', error);
    }
  };

  const saveCoupon = async (coupon) => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu mã giảm giá');
      navigate('/auth');
      return;
    }

    // Check if already saved
    if (savedCoupons.find(c => c.code === coupon.code)) {
      alert('Bạn đã lưu mã giảm giá này rồi');
      return;
    }

    setSavingCoupon(coupon._id);
    try {
      const res = await api.post('/coupons/save', { couponId: coupon._id });
      alert('✅ ' + res.data.message);
      loadSavedCoupons();
      loadCoupons(); // Reload to update quantity
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể lưu mã giảm giá');
    } finally {
      setSavingCoupon(null);
    }
  };

  const removeSavedCoupon = async (userCouponId) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    
    try {
      await api.delete(`/coupons/saved/${userCouponId}`);
      loadSavedCoupons();
      loadCoupons(); // Reload to update quantity
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa mã giảm giá');
    }
  };

  const useCoupon = (code) => {
    sessionStorage.setItem('selectedCoupon', code);
    navigate('/cart');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price);
  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  if (loading) {
    return (
      <>
        <PageBanner page="coupons" />
        <div className="coupons-loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageBanner page="coupons" />
      <div className="coupons-page">
        <div className="coupons-container">
          
          {/* Available Coupons */}
          <section className="coupons-section">
            <div className="section-header">
              <h2>🎫 Mã giảm giá có sẵn</h2>
              <p>Lưu mã để sử dụng khi thanh toán</p>
            </div>
            
            {coupons.length === 0 ? (
              <div className="no-coupons-box">
                <div className="empty-icon">🎫</div>
                <p>Hiện không có mã giảm giá nào</p>
                <span>Hãy quay lại sau để nhận ưu đãi!</span>
              </div>
            ) : (
              <div className="coupons-grid">
                {coupons.map(coupon => (
                  <div key={coupon._id} className="coupon-card">
                    <div className="coupon-left">
                      <div className="coupon-discount-badge">
                        <span className="discount-percent">{coupon.discount}%</span>
                        <span className="discount-label">Giảm</span>
                      </div>
                    </div>
                    <div className="coupon-right">
                      <div className="coupon-code-box">
                        <span className="code-label">Mã:</span>
                        <span className="code-value">{coupon.code}</span>
                        <button 
                          className="btn-copy-code"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.code);
                            alert('✅ Đã sao chép mã: ' + coupon.code);
                          }}
                        >
                          📋
                        </button>
                      </div>
                      <p className="coupon-description">{coupon.description}</p>
                      <div className="coupon-conditions">
                        {coupon.minOrder > 0 && (
                          <span className="condition-item">
                            📦 Đơn tối thiểu {formatPrice(coupon.minOrder)}₫
                          </span>
                        )}
                        {coupon.maxDiscount > 0 && (
                          <span className="condition-item">
                            💰 Giảm tối đa {formatPrice(coupon.maxDiscount)}₫
                          </span>
                        )}
                        {coupon.validTo && (
                          <span className="condition-item expiry">
                            ⏰ HSD: {formatDate(coupon.validTo)}
                          </span>
                        )}
                      </div>
                      <button 
                        className={`btn-save-coupon ${savedCoupons.find(c => c.code === coupon.code) ? 'saved' : ''}`}
                        onClick={() => saveCoupon(coupon)}
                        disabled={savingCoupon === coupon._id || savedCoupons.find(c => c.code === coupon.code)}
                      >
                        {savingCoupon === coupon._id ? '⏳ Đang lưu...' : 
                         savedCoupons.find(c => c.code === coupon.code) ? '✅ Đã lưu' : '💾 Lưu mã'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Coupons */}
          {user && savedCoupons.length > 0 && (
            <section className="coupons-section saved-section">
              <div className="section-header">
                <h2>⭐ Mã đã lưu của bạn</h2>
                <p>Sử dụng khi thanh toán để được giảm giá (Mỗi mã chỉ dùng được 1 lần)</p>
              </div>
              <div className="saved-coupons-list">
                {savedCoupons.map(coupon => (
                  <div key={coupon.id} className={`saved-coupon-item ${coupon.used ? 'used' : ''}`}>
                    <div className="saved-left">
                      {coupon.used && <span className="used-badge">Đã dùng</span>}
                      <div className="saved-discount">{coupon.discountValue}</div>
                      <div className="saved-code">{coupon.code}</div>
                    </div>
                    <div className="saved-middle">
                      <p className="saved-desc">{coupon.title}</p>
                      {coupon.minOrder > 0 && (
                        <span className="saved-condition">Đơn tối thiểu {formatPrice(coupon.minOrder)}₫</span>
                      )}
                      {coupon.expiryDate && (
                        <span className="saved-expiry">HSD: {formatDate(coupon.expiryDate)}</span>
                      )}
                    </div>
                    <div className="saved-actions">
                      {!coupon.used ? (
                        <>
                          <button 
                            className="btn-use-coupon"
                            onClick={() => useCoupon(coupon.code)}
                            title="Dùng ngay"
                          >
                            🛒 Dùng ngay
                          </button>
                          <button 
                            className="btn-remove-saved"
                            onClick={() => removeSavedCoupon(coupon.id)}
                            title="Xóa mã này"
                          >
                            🗑️ Xóa
                          </button>
                        </>
                      ) : (
                        <span className="used-info">Đã dùng {coupon.usedAt ? formatDate(coupon.usedAt) : ''}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Coupons;
