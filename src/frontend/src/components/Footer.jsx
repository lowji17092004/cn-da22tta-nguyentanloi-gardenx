import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">
              {/* Thay bằng ảnh logo: <img src="/images/logo.png" alt="Logo" width="40" height="40" /> */}
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C16 4 12 8 12 12C12 14.2 13.8 16 16 16C18.2 16 20 14.2 20 12C20 8 16 4 16 4Z" fill="currentColor"/>
                <path d="M8 16C8 16 4 12 4 16C4 18.2 5.8 20 8 20C10.2 20 12 18.2 12 16C12 12 8 16 8 16Z" fill="currentColor" opacity="0.7"/>
                <path d="M24 16C24 16 28 12 28 16C28 18.2 26.2 20 24 20C21.8 20 20 18.2 20 16C20 12 24 16 24 16Z" fill="currentColor" opacity="0.7"/>
                <path d="M16 20C16 20 12 24 12 20C12 17.8 13.8 16 16 16C18.2 16 20 17.8 20 20C20 24 16 20 16 20Z" fill="currentColor" opacity="0.5"/>
                <circle cx="16" cy="16" r="3" fill="#fbbf24"/>
              </svg>
              <h3>Hoa Kiểng</h3>
            </div>
            <p className="footer-desc">Chuyên cung cấp hoa và cây kiểng cao cấp, mang vẻ đẹp thiên nhiên đến mọi không gian.</p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook" className="social-link">📘</a>
              <a href="#" aria-label="Instagram" className="social-link">📷</a>
              <a href="#" aria-label="Twitter" className="social-link">🐦</a>
              <a href="#" aria-label="YouTube" className="social-link">🎥</a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Sản phẩm</h4>
            <ul className="footer-links">
              <li><Link to="/shop">Hoa kiểng</Link></li>
              <li><Link to="/shop">Cây cảnh</Link></li>
              <li><Link to="/shop">Cây thủy cảnh</Link></li>
              <li><Link to="/shop">Sen đá</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul className="footer-links">
              <li><Link to="/articles">Hướng dẫn chăm sóc</Link></li>
              <li><Link to="/articles">Kiến thức</Link></li>
              <li><a href="#">Chính sách đổi trả</a></li>
              <li><a href="#">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Liên hệ</h4>
            <ul className="footer-contact">
              <li>📍 126 Nguyễn Chí Thành, phường Trà Vinh, Vĩnh Long</li>
              <li>📞 <a href="tel:+84123456789">0368 920 249</a></li>
              <li>✉️ <a href="mailto:info@hoakieng.vn">info@hoakieng.vn</a></li>
              <li>🕒 8:00 - 20:00 (T2-CN)</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Hoa Kiểng. Tất cả quyền được bảo lưu.</p>
          <div className="footer-bottom-links">
            <a href="#">Điều khoản dịch vụ</a>
            <span>•</span>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
