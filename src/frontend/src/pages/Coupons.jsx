import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './Coupons.css';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const loadSavedCoupons = () => {
    const saved = JSON.parse(localStorage.getItem(`saved_coupons_${user.id}`) || '[]');
    setSavedCoupons(saved);
  };

  const saveCoupon = (coupon) => {
    if (!user) {
      alert('Vui lòng đăng nhập để lưu mã giảm giá');
      navigate('/auth');
      return;
    }

    const saved = JSON.parse(localStorage.getItem(`saved_coupons_${user.id}`) || '[]');
    
    // Kiểm tra đã lưu mã này chưa
    if (saved.find(c => c.code === coupon.code)) {
      alert('Bạn đã lưu mã giảm giá này rồi');
      return;
    }

    // Mỗi người chỉ lưu được 1 mã với số lượng 1
    saved.push({
      code: coupon.code,
      discount: coupon.discount,
      description: coupon.description,
      minOrderValue: coupon.minOrderValue,
      quantity: 1, // Mỗi user chỉ có 1 lượt dùng
      savedAt: new Date().toISOString()
    });

    localStorage.setItem(`saved_coupons_${user.id}`, JSON.stringify(saved));
    setSavedCoupons(saved);
    alert('Đã lưu mã giảm giá! Bạn có 1 lượt sử dụng.');
  };

  const removeSavedCoupon = (code) => {
    const saved = savedCoupons.filter(c => c.code !== code);
    localStorage.setItem(`saved_coupons_${user.id}`, JSON.stringify(saved));
    setSavedCoupons(saved);
  };

  const useCoupon = (code) => {
    sessionStorage.setItem('selectedCoupon', code);
    navigate('/cart');
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return <div className="coupons-loading">Đang tải...</div>;
  }

  return (
    <div className="coupons-page">
      <div className="coupons-container">
        <div className="coupons-header">
          <h1>🎫 Mã Giảm Giá</h1>
          <p>Lưu mã để sử dụng khi thanh toán</p>
        </div>

        {/* Available Coupons */}
        <section className="coupons-section">
          <h2>Mã giảm giá có sẵn</h2>
          <div className="coupons-grid">
            {coupons.length === 0 ? (
              <p className="no-coupons">Hiện không có mã giảm giá nào</p>
            ) : (
              coupons.map(coupon => (
                <div key={coupon._id} className="coupon-card">
                  <div className="coupon-header">
                    <div className="coupon-discount">{coupon.discount}%</div>
                    <div className="coupon-code">{coupon.code}</div>
                  </div>
                  <div className="coupon-body">
                    <p className="coupon-description">{coupon.description}</p>
                    {coupon.minOrderValue > 0 && (
                      <p className="coupon-condition">
                        Áp dụng cho đơn hàng từ {formatPrice(coupon.minOrderValue)}
                      </p>
                    )}
                    {coupon.maxDiscount > 0 && (
                      <p className="coupon-max">
                        Giảm tối đa: {formatPrice(coupon.maxDiscount)}
                      </p>
                    )}
                    <p className="coupon-expiry">
                      Hết hạn: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <button 
                    className="btn-save-coupon"
                    onClick={() => saveCoupon(coupon)}
                  >
                    💾 Lưu mã
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Saved Coupons */}
        {user && savedCoupons.length > 0 && (
          <section className="coupons-section">
            <h2>Mã đã lưu của bạn</h2>
            <div className="saved-coupons-list">
              {savedCoupons.map(coupon => (
                <div key={coupon.code} className="saved-coupon-item">
                  <div className="saved-coupon-info">
                    <div className="saved-coupon-code">{coupon.code}</div>
                    <div className="saved-coupon-discount">-{coupon.discount}%</div>
                    <div className="saved-coupon-desc">{coupon.description}</div>
                  </div>
                  <div className="saved-coupon-actions">
                    <button 
                      className="btn-use-coupon"
                      onClick={() => useCoupon(coupon.code)}
                    >
                      Sử dụng
                    </button>
                    <button 
                      className="btn-remove-saved"
                      onClick={() => removeSavedCoupon(coupon.code)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Coupons;
