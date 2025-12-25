import React from 'react'
import PageBanner from '../components/PageBanner'
import './Policy.css'

export default function PolicyPrivacy() {
  return (
    <>
      <PageBanner page="policy" title="Chính sách bảo mật" subtitle="Cam kết bảo vệ thông tin khách hàng" />
      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-intro">
            <p>
              <strong>The Sun Garden</strong> cam kết bảo mật thông tin cá nhân của khách hàng. 
              Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
            </p>
          </div>

          <div className="policy-section">
            <h2>📋 Thu Thập Thông Tin</h2>
            <p>Chúng tôi thu thập các thông tin sau:</p>
            <ul>
              <li>Họ tên, số điện thoại, email</li>
              <li>Địa chỉ giao hàng</li>
              <li>Thông tin thanh toán (được mã hóa)</li>
              <li>Lịch sử mua hàng</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>🔒 Bảo Mật Thông Tin</h2>
            <div className="security-features">
              <div className="security-item">
                <span className="icon">🛡️</span>
                <div>
                  <h3>Mã hóa SSL</h3>
                  <p>Tất cả thông tin được mã hóa khi truyền tải</p>
                </div>
              </div>
              <div className="security-item">
                <span className="icon">🔐</span>
                <div>
                  <h3>Lưu trữ an toàn</h3>
                  <p>Dữ liệu được lưu trữ trên máy chủ bảo mật</p>
                </div>
              </div>
              <div className="security-item">
                <span className="icon">👥</span>
                <div>
                  <h3>Kiểm soát truy cập</h3>
                  <p>Chỉ nhân viên được ủy quyền mới có quyền truy cập</p>
                </div>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>📌 Sử Dụng Thông Tin</h2>
            <p>Thông tin của bạn được sử dụng để:</p>
            <ul>
              <li>Xử lý và giao hàng đơn hàng</li>
              <li>Gửi thông báo về đơn hàng</li>
              <li>Hỗ trợ khách hàng</li>
              <li>Cải thiện dịch vụ và trải nghiệm mua sắm</li>
              <li>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>🚫 Không Chia Sẻ Thông Tin</h2>
            <p>
              Chúng tôi <strong>KHÔNG BAO GIỜ</strong> bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn 
              với bên thứ ba cho mục đích marketing mà không có sự đồng ý của bạn.
            </p>
            <p>Thông tin chỉ được chia sẻ với:</p>
            <ul>
              <li>Đơn vị vận chuyển (chỉ thông tin cần thiết)</li>
              <li>Cổng thanh toán (được mã hóa)</li>
              <li>Cơ quan nhà nước khi có yêu cầu pháp lý</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>🍪 Cookie và Công Nghệ Theo Dõi</h2>
            <p>
              Website sử dụng cookie để cải thiện trải nghiệm người dùng. Bạn có thể tắt cookie 
              trong cài đặt trình duyệt nhưng một số tính năng có thể bị ảnh hưởng.
            </p>
          </div>

          <div className="policy-section">
            <h2>✏️ Quyền Của Bạn</h2>
            <p>Bạn có quyền:</p>
            <ul>
              <li>Truy cập và xem thông tin cá nhân</li>
              <li>Yêu cầu chỉnh sửa thông tin không chính xác</li>
              <li>Yêu cầu xóa tài khoản và dữ liệu</li>
              <li>Từ chối nhận email marketing</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>📧 Liên Hệ</h2>
            <p>Nếu có thắc mắc về chính sách bảo mật, vui lòng liên hệ:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> <a href="mailto:thesungarden.tvu@gmail.com">thesungarden.tvu@gmail.com</a></p>
              <p><strong>Hotline:</strong> <a href="tel:0368920249">0368 920 249</a></p>
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
