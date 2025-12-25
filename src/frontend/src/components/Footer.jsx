import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer(){
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="site-footer">
      {/* Footer Main */}
      <div className="footer-container">
        <div className="footer-grid">
          {/* Column 1 - About */}
          <div className="footer-col footer-col-about">
            <Link to="/" className="footer-brand">
              <img src="/images/logo.png" alt="The Sun Garden" className="footer-logo-img" />
            </Link>
            <p className="footer-desc">
              The Sun Garden mang đến không gian xanh tươi mát, kết nối bạn với thiên nhiên qua những sản phẩm hoa và cây cảnh chất lượng cao.
            </p>
            <div className="footer-social">
              <a href="https://www.facebook.com/lowji.ngt" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://zalo.me/0368920249" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Zalo">
                <svg viewBox="0 0 48 48" fill="currentColor" width="20" height="20"><path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm7.747 29.355h-3.466l-4.076-6.053v6.053h-3.15V16.645h3.15v5.855l3.987-5.855h3.555l-4.471 6.199 4.471 6.511zm-11.973 0h-6.479v-2.416h6.479v2.416zm0-4.195h-6.479v-2.417h6.479v2.417zm0-4.194h-6.479V22.55h6.479v2.416z"/></svg>
              </a>
              <a href="https://youtube.com/@thesungarden" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="https://tiktok.com/@thesungarden" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="footer-col">
            <h4>DANH MỤC</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Tất cả sản phẩm</Link></li>
              <li><Link to="/category/hoa-kieng">Hoa Kiểng</Link></li>
              <li><Link to="/category/cay-canh">Cây Cảnh</Link></li>
              <li><Link to="/category/chau-cay">Chậu Cây</Link></li>
              <li><Link to="/category/phu-kien">Phụ Kiện</Link></li>
            </ul>
          </div>

          {/* Column 3 - Policy Links */}
          <div className="footer-col">
            <h4>CHÍNH SÁCH</h4>
            <ul className="footer-links">
              <li><Link to="/policy/about">Giới thiệu</Link></li>
              <li><Link to="/policy/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/policy/warranty">Chính sách bảo hành</Link></li>
              <li><Link to="/policy/payment">Phương thức thanh toán</Link></li>
              <li><Link to="/policy/shipping">Phương thức vận chuyển</Link></li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div className="footer-col">
            <h4>LIÊN HỆ</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-icon">📞</span>
                <div className="contact-content">
                  <span className="contact-label">Hotline</span>
                  <a href="tel:0368920249">0368 920 249</a>
                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <div className="contact-content">
                  <span className="contact-label">Email</span>
                  <a href="mailto:thesungarden.tvu@gmail.com">thesungarden.tvu@gmail.com</a>
                </div>
              </li>
              <li>
                <span className="contact-icon">📍</span>
                <div className="contact-content">
                  <span className="contact-label">Địa chỉ</span>
                  <span className="contact-address">126 Nguyễn Thiện Thành, Phường 5, Trà Vinh, Việt Nam</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Map Section */}
        <div className="footer-map-section">
          <h4 className="map-title">📍 Vị trí cửa hàng The Sun Garden</h4>
          <div className="footer-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.7255653!2d106.3424426!3d9.9338250!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0178263e3f927%3A0xdb6bb9ba1e5aab5f!2s126%20Nguy%E1%BB%85n%20Thi%E1%BB%87n%20Th%C3%A0nh%2C%20Ph%C6%B0%E1%BB%9Dng%205%2C%20Tr%C3%A0%20Vinh%2C%20Vi%E1%BB%87t%20Nam!5e0!3m2!1svi!2s!4v1703318400000!5m2!1svi!2s"
              width="100%" 
              height="300" 
              style={{border: 0, borderRadius: '12px'}} 
              allowFullScreen="" 
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p><strong>Đồ án chuyên ngành - Xây dựng website quảng bá và kinh doanh hoa kiểng - Nguyễn Tấn Lợi - DA22TTA - 110122014</strong> </p>
        </div>
      </div>
    </footer>
  )
}
