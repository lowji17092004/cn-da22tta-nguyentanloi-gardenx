import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer(){
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col footer-col-about">
            <div className="footer-brand">
              <h3>The Sun Garden</h3>
              
            </div>
            <p className="footer-desc">Florana mang đến không gian xanh tươi mát, kết nối bạn với thiên nhiên qua những sản phẩm hoa và cây cảnh chất lượng cao, tạo nên vẻ đẹp và sự tĩnh lặng cho ngôi nhà của bạn.</p>
            <div className="footer-badge">
            </div>
            <div className="footer-company-info">
              <p><strong> Đồ án chuyên ngành "Xây dựng website quảng bá và kinh doanh hoa kiểng"</strong></p>
              <p> Nguyễn Tấn Lợi, DA22TTA, 110122014</p>
              
            </div>
          </div>

          <div className="footer-col">
            <h4>VỀ CHÚNG TÔI</h4>
            <ul className="footer-links">
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Chính sách bảo hành</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Phương thức thanh toán</a></li>
              <li><a href="#">Phương thức vận chuyển</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>LIÊN HỆ</h4>
            <ul className="footer-contact">
              <li>
                <span className="contact-label">Hotline 1:</span>
                <a href="tel:0368920249">0368 920 249</a>
              </li>
              <li>
                <span className="contact-label">Email:</span>
                <a href="mailto:info@florana.vn">info@florana.vn</a>
              </li>
              <li className="footer-address">
                <span className="contact-label">Địa chỉ:</span>
                <span>Trường Đại học Trà Vinh, Số 126 Nguyễn Thiện Thành, Khóm 4, Phường 5, Thành phố Trà Vinh, Tỉnh Trà Vinh</span>
              </li>
            </ul>
            <div className="footer-social">
              <a href="https://www.facebook.com/lowji.ngt" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/facebook.svg" alt="Facebook" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/x.svg" alt="X" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/youtube.svg" alt="YouTube" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="TikTok">
                <img src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/tiktok.svg" alt="TikTok" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-map-section">
          <h4 className="map-title">Hướng dẫn tới Florana - Đại học Trà Vinh</h4>
          <div className="footer-map">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.725562827935!2d106.34244257586894!3d9.933824990148385!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0178263e3f927%3A0xdb6bb9ba1e5aab5f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBUcsOgIFZpbmg!5e0!3m2!1svi!2s!4v1733900000000!5m2!1svi!2s" 
              width="100%" 
              height="350" 
              style={{border: 0, borderRadius: '12px'}} 
              allowFullScreen="" 
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Copyright 2025 © Florana - Đại học Trà Vinh. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
