import React, { useState, useEffect } from 'react'
import api from '../api'
import './CouponDisplay.css'

export default function CouponDisplay({ categorySlug }) {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

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

      // Nếu có categorySlug, lọc theo category
      // Giả sử coupon.category là ObjectId, ta cần tìm category name/slug
      // Hoặc backend đã populate category
      
      setCoupons(validCoupons.slice(0, 3)) // Chỉ hiển thị 3 mã
    } catch(err) {
      console.error('Lỗi tải mã giảm giá:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Đã copy mã: ${code}`)
  }

  if (loading || coupons.length === 0) {
    return null
  }

  return (
    <div className="coupon-display-section">
      <div className="coupon-header">
        <h2>🎁 Mã giảm giá dành cho bạn</h2>
        <p>Áp dụng ngay các mã giảm giá hấp dẫn khi mua hàng</p>
      </div>
      
      <div className="coupons-grid">
        {coupons.map(coupon => (
          <div key={coupon._id} className="coupon-card">
            <div className="coupon-discount">
              <span className="discount-value">{coupon.discount}%</span>
              <span className="discount-label">GIẢM</span>
            </div>
            <div className="coupon-details">
              <div className="coupon-code">
                <span className="code-label">Mã:</span>
                <span className="code-value">{coupon.code}</span>
              </div>
              {coupon.description && (
                <p className="coupon-description">{coupon.description}</p>
              )}
              {coupon.minOrder && (
                <p className="coupon-condition">
                  Đơn tối thiểu: {new Intl.NumberFormat('vi-VN').format(coupon.minOrder)}₫
                </p>
              )}
              {coupon.validTo && (
                <p className="coupon-expiry">
                  HSD: {new Date(coupon.validTo).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
            <button 
              className="btn-copy-code"
              onClick={() => copyCode(coupon.code)}
            >
              Sao chép mã
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
