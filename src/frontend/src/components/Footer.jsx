import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer(){
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="site-footer">
      {/* Wave Decoration */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,90 1440,60 L1440,120 L0,120 Z" />
        </svg>
      </div>

      <div className="footer-main">
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
              <span className="logo-icon">🌿</span>
              <div className="logo-text">
                <h2>FLORÉA</h2>
                <span>Botanica Way of Life</span>
              </div>
            </div>
            <p className="brand-desc">
              Mang thiên nhiên vào không gian sống của bạn với những sản phẩm hoa kiểng chất lượng cao.
            </p>
            
            {/* Social Icons */}
            <div className="social-wrapper">
              <a href="https://www.facebook.com/lowji.ngt" target="_blank" rel="noopener noreferrer" className="social-btn facebook" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://zalo.me/0368920249" target="_blank" rel="noopener noreferrer" className="social-btn zalo" aria-label="Zalo">
                <span className="zalo-text">Zalo</span>
              </a>
              <a href="https://youtube.com/@thesungarden" target="_blank" rel="noopener noreferrer" className="social-btn youtube" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://tiktok.com/@thesungarden" target="_blank" rel="noopener noreferrer" className="social-btn tiktok" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="footer-links-grid">
            <div className="link-column">
              <h4><span className="col-icon">🛒</span> Mua sắm</h4>
              <ul>
                <li><Link to="/shop">Tất cả sản phẩm</Link></li>
                <li><Link to="/category/hoa-kieng">Hoa Kiểng</Link></li>
                <li><Link to="/category/cay-canh">Cây Cảnh</Link></li>
                <li><Link to="/category/chau-cay">Chậu Cây</Link></li>
              </ul>
            </div>

            <div className="link-column">
              <h4><span className="col-icon">📋</span> Chính sách</h4>
              <ul>
                <li><Link to="/policy/about">Về chúng tôi</Link></li>
                <li><Link to="/policy/privacy">Bảo mật</Link></li>
                <li><Link to="/policy/warranty">Bảo hành</Link></li>
                <li><Link to="/policy/shipping">Vận chuyển</Link></li>
              </ul>
            </div>

            <div className="link-column contact-column">
              <h4><span className="col-icon">📞</span> Liên hệ</h4>
              <div className="contact-cards">
                <a href="tel:0368920249" className="contact-card">
                  <div className="card-icon phone-icon">📱</div>
                  <div className="card-info">
                    <span className="card-label">Hotline</span>
                    <span className="card-value">0368 920 249</span>
                  </div>
                </a>
                <a href="mailto:thesungarden.tvu@gmail.com" className="contact-card">
                  <div className="card-icon email-icon">✉️</div>
                  <div className="card-info">
                    <span className="card-label">Email</span>
                    <span className="card-value">florea.tvu@gmail.com</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Map & Address */}
          <div className="footer-location">
            <div className="location-info">
              <div className="location-badge">
                <span className="badge-icon">📍</span>
                <span>Địa chỉ cửa hàng</span>
              </div>
              <p className="address-text">126 Nguyễn Thiện Thành, Phường 5, TP. Trà Vinh</p>
            </div>
            <div className="mini-map">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.7255653!2d106.3424426!3d9.9338250!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0178263e3f927%3A0xdb6bb9ba1e5aab5f!2s126%20Nguy%E1%BB%85n%20Thi%E1%BB%87n%20Th%C3%A0nh%2C%20Ph%C6%B0%E1%BB%9Dng%205%2C%20Tr%C3%A0%20Vinh%2C%20Vi%E1%BB%87t%20Nam!5e0!3m2!1svi!2s!4v1703318400000!5m2!1svi!2s"
                width="100%" 
                height="120" 
                style={{border: 0}} 
                allowFullScreen="" 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="bottom-container">
          <div className="copyright">
            <span className="heart-icon">🌱</span>
            <span>© {currentYear} FLORÉA</span>
          </div>
          <div className="thesis-info">
            <span className="thesis-badge">📚 Đồ án chuyên ngành " Xây đựng website quảng bá và kinh doanh hoa kiểng "</span>
          </div>
          <div className="author-info">
            <span className="info-badge name-badge">Nguyễn Tấn Lợi</span>
            <span className="info-badge class-badge">DA22TTA</span>
            <span className="info-badge id-badge">110122014</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
