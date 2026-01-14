import React from 'react'
import PageBanner from '../components/PageBanner'
import './Policy.css'

export default function PolicyWarranty() {
  return (
    <>
      <PageBanner page="policy" title="Chính sách bảo hành" subtitle="Cam kết chất lượng sản phẩm" />
      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-intro">
            <p>
              <strong>Floréa</strong> cam kết đảm bảo chất lượng sản phẩm và cung cấp chính sách bảo hành 
              rõ ràng, minh bạch để khách hàng yên tâm mua sắm.
            </p>
          </div>

          <div className="policy-section">
            <h2>🌱 Điều Kiện Bảo Hành</h2>
            <div className="warranty-terms">
              <div className="term-item">
                <h3>✓ Cây cảnh & Hoa kiểng</h3>
                <ul>
                  <li>Bảo hành 7 ngày kể từ ngày nhận hàng</li>
                  <li>Cây bị héo, vàng lá hoặc chết trong vòng 7 ngày</li>
                  <li>Cây đúng mô tả, không bị sâu bệnh khi giao</li>
                  <li>Khách hàng phải có video unbox làm bằng chứng</li>
                </ul>
              </div>
              <div className="term-item">
                <h3>✓ Chậu cây & Phụ kiện</h3>
                <ul>
                  <li>Bảo hành 30 ngày đối với lỗi sản xuất</li>
                  <li>Chậu bị nứt, vỡ khi nhận hàng</li>
                  <li>Sản phẩm không đúng mô tả</li>
                  <li>Thiếu phụ kiện đi kèm</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>❌ Không Bảo Hành Khi</h2>
            <ul className="excluded-list">
              <li>Cây chết do không chăm sóc đúng cách</li>
              <li>Cây bị sâu bệnh sau khi nhận (do môi trường)</li>
              <li>Chậu bị vỡ do va đập sau khi nhận</li>
              <li>Sản phẩm đã qua sửa chữa bởi bên thứ ba</li>
              <li>Không có hóa đơn hoặc bằng chứng mua hàng</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>🔄 Quy Trình Bảo Hành</h2>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Liên hệ</h3>
                <p>Gọi hotline hoặc nhắn tin qua Zalo/Facebook</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Cung cấp thông tin</h3>
                <p>Gửi ảnh/video sản phẩm, mã đơn hàng, hóa đơn</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Kiểm tra</h3>
                <p>Đội ngũ kỹ thuật kiểm tra và xác nhận</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Giải quyết</h3>
                <p>Đổi mới hoặc hoàn tiền trong 2-3 ngày</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>💡 Lưu Ý Quan Trọng</h2>
            <div className="important-notes">
              <div className="note-card">
                <span className="note-icon">📹</span>
                <div>
                  <h3>Video unbox</h3>
                  <p>Quay video khi mở hàng để làm bằng chứng nếu có vấn đề</p>
                </div>
              </div>
              <div className="note-card">
                <span className="note-icon">📸</span>
                <div>
                  <h3>Chụp ảnh ngay</h3>
                  <p>Chụp ảnh cây và bao bì ngay khi nhận nếu phát hiện lỗi</p>
                </div>
              </div>
              <div className="note-card">
                <span className="note-icon">⏰</span>
                <div>
                  <h3>Báo sớm</h3>
                  <p>Thông báo trong 24h nếu phát hiện sản phẩm có vấn đề</p>
                </div>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>🎁 Chính Sách Đổi Trả</h2>
            <p>Ngoài bảo hành, chúng tôi chấp nhận đổi trả trong các trường hợp sau:</p>
            <ul>
              <li><strong>Đổi hàng:</strong> Trong vòng 7 ngày nếu không vừa ý (áp dụng với chậu, phụ kiện)</li>
              <li><strong>Hoàn tiền:</strong> 100% nếu sản phẩm lỗi nghiêm trọng không thể đổi</li>
              <li><strong>Điều kiện:</strong> Sản phẩm còn nguyên tem, chưa qua sử dụng</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>📞 Hỗ Trợ Bảo Hành</h2>
            <div className="contact-info">
              <p><strong>Hotline:</strong> <a href="tel:0368920249">0368 920 249</a> (8:00 - 22:00)</p>
              <p><strong>Email:</strong> <a href="mailto:thesungarden.tvu@gmail.com">thesungarden.tvu@gmail.com</a></p>
              <p><strong>Zalo:</strong> <a href="https://zalo.me/0368920249" target="_blank" rel="noopener noreferrer">0368 920 249</a></p>
              <p><strong>Facebook:</strong> <a href="https://www.facebook.com/florea" target="_blank" rel="noopener noreferrer">Floréa</a></p>
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
