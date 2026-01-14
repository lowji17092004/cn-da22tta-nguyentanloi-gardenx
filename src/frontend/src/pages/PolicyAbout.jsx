import React from 'react'
import { Link } from 'react-router-dom'
import PageBanner from '../components/PageBanner'
import './Policy.css'

export default function PolicyAbout() {
  return (
    <>
      <PageBanner page="policy" title="Giới thiệu" subtitle="Về Floréa" />
      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-section">
            <h2>🌿 Về Chúng Tôi</h2>
            <p>
              <strong>Floréa</strong> là điểm đến lý tưởng cho những ai yêu thích cây cảnh và mong muốn tạo nên không gian sống xanh, 
              gần gũi với thiên nhiên. Chúng tôi tự hào là một trong những cửa hàng cung cấp cây cảnh, hoa kiểng và phụ kiện làm vườn 
              chất lượng cao tại Việt Nam.
            </p>
          </div>

          <div className="policy-section">
            <h2>🎯 Sứ Mệnh</h2>
            <p>
              Mang thiên nhiên đến gần hơn với cuộc sống hiện đại, giúp mọi người tạo dựng không gian sống xanh, 
              trong lành và tràn đầy năng lượng tích cực.
            </p>
          </div>

          <div className="policy-section">
            <h2>💎 Giá Trị Cốt Lõi</h2>
            <div className="value-grid">
              <div className="value-card">
                <div className="value-icon">✅</div>
                <h3>Chất Lượng</h3>
                <p>Cam kết cung cấp cây cảnh và sản phẩm chất lượng cao nhất</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💚</div>
                <h3>Tận Tâm</h3>
                <p>Tư vấn chăm sóc tận tình, hỗ trợ khách hàng 24/7</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🚀</div>
                <h3>Đổi Mới</h3>
                <p>Không ngừng cập nhật xu hướng và công nghệ mới</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Uy Tín</h3>
                <p>Xây dựng niềm tin với khách hàng qua từng sản phẩm</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>🌟 Dịch Vụ Của Chúng Tôi</h2>
            <ul className="service-list">
              <li><strong>Cung cấp cây cảnh:</strong> Đa dạng các loại cây trong nhà, ngoài trời, cây phong thủy</li>
              <li><strong>Hoa kiểng:</strong> Hoa tươi, hoa chậu, hoa lan cao cấp</li>
              <li><strong>Phụ kiện làm vườn:</strong> Chậu cây, đất trồng, phân bón, dụng cụ</li>
              <li><strong>Tư vấn chăm sóc:</strong> Hướng dẫn chi tiết cách chăm sóc cây</li>
              <li><strong>Giao hàng toàn quốc:</strong> Đóng gói cẩn thận, vận chuyển nhanh chóng</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>📞 Liên Hệ</h2>
            <div className="contact-info">
              <p><strong>Hotline:</strong> <a href="tel:0368920249">0368 920 249</a></p>
              <p><strong>Email:</strong> <a href="mailto:thesungarden.tvu@gmail.com">thesungarden.tvu@gmail.com</a></p>
              <p><strong>Website:</strong> <a href="https://thesungarden.vn">thesungarden.vn</a></p>
            </div>
          </div>

          <div className="policy-cta">
            <h3>Bắt đầu mua sắm ngay!</h3>
            <p>Khám phá bộ sưu tập cây cảnh đa dạng của chúng tôi</p>
            <Link to="/shop" className="btn-primary">Xem sản phẩm</Link>
          </div>
        </div>
      </div>
    </>
  )
}
