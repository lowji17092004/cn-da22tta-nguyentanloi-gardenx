import React, { useState, useEffect } from 'react'
import api from '../api'
import './CouponDisplay.css'

export default function CouponDisplay({ categorySlug }) {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedCoupons, setSavedCoupons] = useState(() => {
    const saved = localStorage.getItem('savedCoupons')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    loadCoupons()
  }, [categorySlug])

  async function loadCoupons() {
    try {
      const res = await api.get('/coupons/active')
      let allCoupons = res.data || []
      
      // Lọc mã giảm giá còn hiệu lực
      const now = new Date()
      const validCoupons = allCoupons.filter(coupon => {
        const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null
        const validTo = coupon.validTo ? new Date(coupon.validTo) : null
        
        // Kiểm tra còn trong thời hạn
        const isValidTime = (!validFrom || validFrom <= now) && (!validTo || validTo >= now)
        
        // Kiểm tra active và còn số lượng
        const isActive = coupon.active && (coupon.quantity > 0 || !coupon.quantity)
        
        return isValidTime && isActive
      })
      
      setCoupons(validCoupons.slice(0, 6)) // Hiển thị tối đa 6 mã
    } catch(err) {
      console.error('Lỗi tải mã giảm giá:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveCoupon = (coupon) => {
    const isAlreadySaved = savedCoupons.some(c => c.code === coupon.code)
    
    if (isAlreadySaved) {
      // Remove from saved
      const newSaved = savedCoupons.filter(c => c.code !== coupon.code)
      setSavedCoupons(newSaved)
      localStorage.setItem('savedCoupons', JSON.stringify(newSaved))
    } else {
      // Add to saved
      const newSaved = [...savedCoupons, { 
        code: coupon.code, 
        discount: coupon.discount,
        description: coupon.description,
        validTo: coupon.validTo 
      }]
      setSavedCoupons(newSaved)
      localStorage.setItem('savedCoupons', JSON.stringify(newSaved))
    }
  }

  const isSaved = (code) => savedCoupons.some(c => c.code === code)

  // Show loading state or empty state with message
  if (loading) {
    return (
      <div className="coupon-display-section">
        <div className="coupon-header">
          <div className="coupon-header-icon">🎁</div>
          <h2>Ưu đãi dành cho bạn</h2>
          <p>Đang tải mã giảm giá...</p>
        </div>
      </div>
    )
  }

  if (coupons.length === 0) {
    return (
      <div className="coupon-display-section">
        <div className="coupon-header">
          <div className="coupon-header-icon">🎁</div>
          <h2>Ưu đãi dành cho bạn</h2>
          <p>Hiện chưa có mã giảm giá nào. Quay lại sau nhé!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="coupon-display-section">
      <div className="coupon-header">
        <div className="coupon-header-icon">🎁</div>
        <h2>Ưu đãi dành cho bạn</h2>
        <p>Lưu mã giảm giá để sử dụng khi thanh toán</p>
      </div>
      
      <div className="coupons-horizontal-grid">
        {coupons.map(coupon => (
          <div key={coupon._id} className={`coupon-horizontal-card ${isSaved(coupon.code) ? 'saved' : ''}`}>
            <div className="coupon-h-left">
              <div className="coupon-h-discount">
                <span className="coupon-h-percent">{coupon.discount}</span>
                <span className="coupon-h-symbol">%</span>
              </div>
              <span className="coupon-h-off">GIẢM</span>
            </div>
            
            <div className="coupon-h-divider"></div>
            
            <div className="coupon-h-center">
              <span className="coupon-h-code">{coupon.code}</span>
              {coupon.description && (
                <span className="coupon-h-desc">{coupon.description}</span>
              )}
            </div>
            
            <button 
              className={`coupon-h-save-btn ${isSaved(coupon.code) ? 'saved' : ''}`}
              onClick={() => saveCoupon(coupon)}
            >
              {isSaved(coupon.code) ? (
                <>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Đã lưu
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                  </svg>
                  Lưu
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {savedCoupons.length > 0 && (
        <div className="saved-coupons-hint">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Bạn đã lưu {savedCoupons.length} mã giảm giá. Xem trong trang thanh toán.
        </div>
      )}
    </div>
  )
}
