import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import PageBanner from '../components/PageBanner'
import './BlogPromotion.css'

export default function BlogPromotion(){
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons(){
    try {
      const res = await api.get('/coupons/active')
      setCoupons(res.data)
    } catch(err) {
      console.error('Lỗi tải mã giảm giá:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    alert(`Đã sao chép mã: ${code}`)
  }

  const saveCoupon = (coupon) => {
    // Lưu mã giảm giá vào localStorage
    const savedCoupons = JSON.parse(localStorage.getItem('savedCoupons') || '[]')
    const exists = savedCoupons.find(c => c.code === coupon.code)
    
    if (!exists) {
      savedCoupons.push({
        code: coupon.code,
        discount: coupon.discount,
        description: coupon.description,
        minOrder: coupon.minOrder,
        validTo: coupon.validTo,
        savedAt: new Date().toISOString()
      })
      localStorage.setItem('savedCoupons', JSON.stringify(savedCoupons))
      alert(`Đã lưu mã ${coupon.code} vào danh sách của bạn!`)
    } else {
      alert('Mã này đã có trong danh sách của bạn!')
    }
  }

  return (
    <>
      <PageBanner page="blogPromotion" />
      <div className="container">
        <div className="blog-page promotion-page">
          <div className="blog-breadcrumb">
            <Link to="/articles">Blog</Link>
            <span>/</span>
            <span>Khuyến mãi</span>
          </div>

          <div className="promotion-header">
            <h1>🎁 Mã giảm giá đặc biệt</h1>
            <p>Săn ngay các mã giảm giá hấp dẫn cho đơn hàng của bạn!</p>
          </div>

          <div className="blog-page-content">
          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : coupons.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎫</span>
              <h3>Chưa có mã giảm giá</h3>
              <p>Các chương trình khuyến mãi sẽ sớm được cập nhật.</p>
            </div>
          ) : (
            <div className="coupons-grid-promo">
              {coupons.map(coupon => (
                <div key={coupon._id} className="coupon-card-promo">
                  <div className="coupon-badge">
                    <span className="badge-discount">{coupon.discount}%</span>
                    <span className="badge-label">GIẢM</span>
                  </div>
                  
                  <div className="coupon-body">
                    <div className="coupon-code-display">
                      <span className="code-label">Mã giảm giá</span>
                      <span className="code-value">{coupon.code}</span>
                    </div>
                    
                    {coupon.description && (
                      <p className="coupon-desc">{coupon.description}</p>
                    )}
                    
                    <div className="coupon-conditions">
                      {coupon.minOrder && (
                        <div className="condition-item">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                          </svg>
                          Đơn tối thiểu: {new Intl.NumberFormat('vi-VN').format(coupon.minOrder)}₫
                        </div>
                      )}
                      {coupon.validTo && (
                        <div className="condition-item">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                          </svg>
                          HSD: {new Date(coupon.validTo).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="coupon-actions">
                    <button 
                      className="btn-save-coupon"
                      onClick={() => saveCoupon(coupon)}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      Lưu mã
                    </button>
                    <button 
                      className="btn-copy-coupon"
                      onClick={() => copyCode(coupon.code)}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      Sao chép
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}
