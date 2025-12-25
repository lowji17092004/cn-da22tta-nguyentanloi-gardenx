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
                    <div className="coupon-percent">{coupon.discount}%</div>
                    <div className="coupon-content">
                      <div className="coupon-code">{coupon.code}</div>
                      <p className="coupon-desc">{coupon.description}</p>
                      <div className="coupon-info">
                        {coupon.minOrder > 0 && <span>Đơn tối thiểu: {formatPrice(coupon.minOrder)}₫</span>}
                        {coupon.validTo && <span>HSD: {formatDate(coupon.validTo)}</span>}
                        {coupon.quantity !== undefined && <span>Còn lại: {coupon.quantity}</span>}
                      </div>
                      <button 
                        className={`btn-save ${savedCoupons.find(c => c.code === coupon.code) ? 'saved' : ''}`}
                        onClick={() => saveCoupon(coupon)}
                        disabled={savingCoupon === coupon._id || savedCoupons.find(c => c.code === coupon.code) || coupon.quantity === 0}
                      >
                        {savingCoupon === coupon._id ? 'Đang lưu...' : 
                         savedCoupons.find(c => c.code === coupon.code) ? 'Đã lưu' : 
                         coupon.quantity === 0 ? 'Hết mã' : 'Lưu mã'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Coupons */}
          {user && savedCoupons.filter(c => !c.used).length > 0 && (
            <section className="coupons-section saved-section">
              <div className="section-header">
                <h2>Mã đã lưu</h2>
                <p>Dùng ngay khi thanh toán</p>
              </div>
              <div className="saved-coupons-list">
                {savedCoupons.filter(coupon => !coupon.used).map(coupon => (
                  <div key={coupon.id} className="saved-item">
                    <div className="saved-percent">{coupon.discountValue}%</div>
                    <div className="saved-content">
                      <div className="saved-code-text">{coupon.code}</div>
                      <p className="saved-desc-text">{coupon.title}</p>
                      {coupon.expiryDate && <span className="saved-expiry-text">HSD: {formatDate(coupon.expiryDate)}</span>}
                    </div>
                    <div className="saved-actions">
                      <button 
                        className="btn-use"
                        onClick={() => useCoupon(coupon.code)}
                      >
                        Dùng ngay
                      </button>
                      <button 
                        className="btn-remove"
                        onClick={() => removeSavedCoupon(coupon.id)}
                      >
                        Xóa
                      </button>
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
