import React from 'react'
import PageBanner from '../components/PageBanner'
import './Policy.css'

export default function PolicyShipping() {
  return (
    <>
      <PageBanner page="policy" title="Phương thức vận chuyển" subtitle="Giao hàng toàn quốc" />
      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-intro">
            <p>
              <strong>The Sun Garden</strong> cam kết giao hàng nhanh chóng, an toàn với đội ngũ đóng gói chuyên nghiệp 
              và đối tác vận chuyển uy tín.
            </p>
          </div>

          <div className="policy-section">
            <h2>🚚 Đơn Vị Vận Chuyển</h2>
            <div className="shipping-partners">
              <div className="partner-card">
                <div className="partner-logo">📦</div>
                <h3>Giao hàng nhanh</h3>
                <p>Giao hàng tiết kiệm, JT Express, Viettel Post</p>
              </div>
              <div className="partner-card">
                <div className="partner-logo">🏍️</div>
                <h3>Giao hàng nội thành</h3>
                <p>GrabExpress, ShopeeExpress, Lalamove</p>
              </div>
              <div className="partner-card">
                <div className="partner-logo">✈️</div>
                <h3>Vận chuyển xa</h3>
                <p>Kerry Express, Ninja Van, DHL</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>⏱️ Thời Gian Giao Hàng</h2>
            <div className="shipping-time">
              <div className="time-card">
                <h3>🏙️ Nội thành TP.HCM</h3>
                <p className="time">1-2 ngày</p>
                <p className="desc">Giao trong ngày nếu đặt trước 14:00</p>
              </div>
              <div className="time-card">
                <h3>🌆 Các tỉnh lân cận</h3>
                <p className="time">2-3 ngày</p>
                <p className="desc">Đồng Nai, Bình Dương, Long An, Tây Ninh</p>
              </div>
              <div className="time-card">
                <h3>🗺️ Miền Nam</h3>
                <p className="time">3-4 ngày</p>
                <p className="desc">Các tỉnh miền Đông, Tây Nam Bộ</p>
              </div>
              <div className="time-card">
                <h3>🌏 Miền Trung & Bắc</h3>
                <p className="time">4-7 ngày</p>
                <p className="desc">Từ Đà Nẵng trở ra và các vùng xa</p>
              </div>
            </div>
            <p className="note"><em>* Thời gian có thể chậm hơn trong mùa cao điểm hoặc thời tiết xấu</em></p>
          </div>

          <div className="policy-section">
            <h2>💰 Phí Vận Chuyển</h2>
            <div className="shipping-fees">
              <div className="fee-table">
                <div className="fee-row header">
                  <span>Khu vực</span>
                  <span>Đơn {"<"}500k</span>
                  <span>Đơn ≥500k</span>
                </div>
                <div className="fee-row">
                  <span>Nội thành TP.HCM</span>
                  <span>25.000₫</span>
                  <span className="free">Miễn phí</span>
                </div>
                <div className="fee-row">
                  <span>Tỉnh lân cận</span>
                  <span>35.000₫</span>
                  <span className="free">Miễn phí</span>
                </div>
                <div className="fee-row">
                  <span>Miền Nam</span>
                  <span>45.000₫</span>
                  <span>25.000₫</span>
                </div>
                <div className="fee-row">
                  <span>Miền Trung & Bắc</span>
                  <span>60.000₫</span>
                  <span>35.000₫</span>
                </div>
              </div>
            </div>
            <div className="promo-box">
              <h4>🎁 Ưu đãi đặc biệt</h4>
              <p>✓ Miễn phí ship toàn quốc cho đơn hàng từ 1.000.000₫</p>
              <p>✓ Giảm 50% phí ship vào các ngày lễ, tết</p>
            </div>
          </div>

          <div className="policy-section">
            <h2>📦 Đóng Gói Sản Phẩm</h2>
            <div className="packaging-info">
              <div className="package-card">
                <span className="package-icon">🌿</span>
                <div>
                  <h3>Cây cảnh</h3>
                  <ul>
                    <li>Bọc nilon giữ ẩm cho rễ</li>
                    <li>Đệm mút bảo vệ thân cây</li>
                    <li>Thùng carton chắc chắn</li>
                    <li>Dán cảnh báo "Cây sống - Cẩn thận"</li>
                  </ul>
                </div>
              </div>
              <div className="package-card">
                <span className="package-icon">🏺</span>
                <div>
                  <h3>Chậu & Phụ kiện</h3>
                  <ul>
                    <li>Bọc xốp hơi nhiều lớp</li>
                    <li>Đệm giấy bên trong hộp</li>
                    <li>Niêm phong chống thấm nước</li>
                    <li>Dán cảnh báo "Dễ vỡ"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>🔍 Theo Dõi Đơn Hàng</h2>
            <div className="tracking-steps">
              <div className="tracking-step">
                <span className="status-icon">📋</span>
                <h3>Đã xác nhận</h3>
                <p>Đơn hàng đang được chuẩn bị</p>
              </div>
              <div className="arrow">→</div>
              <div className="tracking-step">
                <span className="status-icon">📦</span>
                <h3>Đã đóng gói</h3>
                <p>Sản phẩm đã sẵn sàng vận chuyển</p>
              </div>
              <div className="arrow">→</div>
              <div className="tracking-step">
                <span className="status-icon">🚚</span>
                <h3>Đang giao</h3>
                <p>Shipper đang trên đường giao hàng</p>
              </div>
              <div className="arrow">→</div>
              <div className="tracking-step">
                <span className="status-icon">✅</span>
                <h3>Hoàn thành</h3>
                <p>Đã giao hàng thành công</p>
              </div>
            </div>
            <p className="tracking-note">
              💡 Bạn sẽ nhận được SMS/Email thông báo khi đơn hàng thay đổi trạng thái. 
              Kiểm tra chi tiết tại <a href="/orders">Đơn hàng của tôi</a>
            </p>
          </div>

          <div className="policy-section">
            <h2>⚠️ Lưu Ý Khi Nhận Hàng</h2>
            <ul className="important-notes">
              <li>📹 <strong>Quay video unbox:</strong> Quay lại quá trình mở hàng để làm bằng chứng nếu có sự cố</li>
              <li>📸 <strong>Kiểm tra kỹ:</strong> Kiểm tra tình trạng cây, chậu trước khi ký nhận</li>
              <li>❌ <strong>Từ chối nhận:</strong> Có quyền từ chối nếu hàng bị hư hỏng nghiêm trọng</li>
              <li>📞 <strong>Liên hệ ngay:</strong> Báo với chúng tôi trong vòng 24h nếu có vấn đề</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>❓ Câu Hỏi Thường Gặp</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Tôi có thể thay đổi địa chỉ giao hàng không?</h3>
                <p>Có thể thay đổi nếu đơn hàng chưa được giao cho shipper. Vui lòng liên hệ ngay.</p>
              </div>
              <div className="faq-item">
                <h3>Shipper giao hàng lúc nào?</h3>
                <p>Thường từ 8:00 - 20:00. Shipper sẽ gọi trước khi giao 30 phút.</p>
              </div>
              <div className="faq-item">
                <h3>Nếu không có nhà khi shipper giao?</h3>
                <p>Shipper sẽ gọi lại và hẹn thời gian khác. Nếu không thể liên lạc, hàng sẽ được trả về.</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>📞 Hỗ Trợ Giao Hàng</h2>
            <div className="contact-info">
              <p><strong>Hotline:</strong> <a href="tel:0368920249">0368 920 249</a> (8:00 - 22:00)</p>
              <p><strong>Email:</strong> <a href="mailto:thesungarden.tvu@gmail.com">thesungarden.tvu@gmail.com</a></p>
              <p><strong>Zalo:</strong> <a href="https://zalo.me/0368920249" target="_blank" rel="noopener noreferrer">0368 920 249</a></p>
            </div>
          </div>

          <div className="policy-footer">
            <p><em>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</em></p>
          </div>
        </div>
      </div>
    </>
  )
}
