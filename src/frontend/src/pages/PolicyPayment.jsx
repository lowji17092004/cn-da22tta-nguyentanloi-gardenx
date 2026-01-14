import React from 'react'
import PageBanner from '../components/PageBanner'
import './Policy.css'

export default function PolicyPayment() {
  return (
    <>
      <PageBanner page="policy" title="Phương thức thanh toán" subtitle="Đa dạng hình thức thanh toán" />
      <div className="policy-container">
        <div className="policy-content">
          <div className="policy-intro">
            <p>
              <strong>Floréa</strong> hỗ trợ nhiều phương thức thanh toán linh hoạt, 
              giúp khách hàng dễ dàng và an toàn khi mua sắm.
            </p>
          </div>

          <div className="policy-section">
            <h2>💳 Các Phương Thức Thanh Toán</h2>
            
            <div className="payment-methods">
              <div className="payment-card">
                <div className="payment-icon">💵</div>
                <h3>Thanh toán khi nhận hàng (COD)</h3>
                <p className="payment-desc">Thanh toán tiền mặt cho shipper khi nhận hàng</p>
                <ul>
                  <li>✓ Không cần tài khoản ngân hàng</li>
                  <li>✓ Kiểm tra hàng trước khi thanh toán</li>
                  <li>✓ Phí COD: Miễn phí (đơn ≥300k), 15k (đơn &lt;300k)</li>
                  <li>✓ Áp dụng: Toàn quốc</li>
                </ul>
              </div>

              <div className="payment-card">
                <div className="payment-icon">🏦</div>
                <h3>Chuyển khoản ngân hàng</h3>
                <p className="payment-desc">Chuyển khoản trực tiếp qua thông tin tài khoản</p>
                <div className="bank-info">
                  <p><strong>Ngân hàng:</strong> MB Bank</p>
                  <p><strong>Số tài khoản:</strong> 0368920249</p>
                  <p><strong>Chủ tài khoản:</strong> NGUYEN TAN LOI</p>
                  <p><strong>Nội dung:</strong> [Mã đơn hàng] [Số điện thoại]</p>
                </div>
                <ul>
                  <li>✓ Chuyển khoản 24/7</li>
                  <li>✓ Không phí giao dịch</li>
                  <li>✓ Xác nhận tự động</li>
                  <li>✓ Ưu tiên xử lý đơn hàng</li>
                </ul>
              </div>

              <div className="payment-card">
                <div className="payment-icon">📱</div>
                <h3>Ví điện tử</h3>
                <p className="payment-desc">Thanh toán nhanh qua ví MoMo, ZaloPay</p>
                <ul>
                  <li>✓ Thanh toán trong vài giây</li>
                  <li>✓ Tích lũy điểm thưởng</li>
                  <li>✓ Bảo mật cao</li>
                  <li>✓ Ưu đãi từ ví điện tử</li>
                </ul>
              </div>

              <div className="payment-card">
                <div className="payment-icon">💳</div>
                <h3>Thẻ ATM/Visa/Mastercard</h3>
                <p className="payment-desc">Thanh toán trực tuyến qua cổng thanh toán</p>
                <ul>
                  <li>✓ Hỗ trợ hầu hết các ngân hàng</li>
                  <li>✓ Bảo mật SSL 256-bit</li>
                  <li>✓ Xác thực 3D Secure</li>
                  <li>✓ Tự động xác nhận đơn hàng</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>🔐 Bảo Mật Thanh Toán</h2>
            <div className="security-features">
              <div className="security-item">
                <span className="icon">🛡️</span>
                <div>
                  <h3>Mã hóa SSL</h3>
                  <p>Mọi giao dịch được mã hóa bảo mật cao</p>
                </div>
              </div>
              <div className="security-item">
                <span className="icon">✅</span>
                <div>
                  <h3>Xác thực 2 lớp</h3>
                  <p>Yêu cầu OTP để xác nhận giao dịch</p>
                </div>
              </div>
              <div className="security-item">
                <span className="icon">🔒</span>
                <div>
                  <h3>Không lưu thẻ</h3>
                  <p>Không lưu trữ thông tin thẻ của bạn</p>
                </div>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>📝 Quy Trình Thanh Toán</h2>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Thêm vào giỏ</h3>
                <p>Chọn sản phẩm và thêm vào giỏ hàng</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Điền thông tin</h3>
                <p>Nhập địa chỉ giao hàng và liên hệ</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Chọn thanh toán</h3>
                <p>Chọn phương thức thanh toán phù hợp</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Xác nhận</h3>
                <p>Hoàn tất và nhận xác nhận đơn hàng</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>❓ Câu Hỏi Thường Gặp</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h3>Tôi có thể thanh toán một phần không?</h3>
                <p>Hiện tại chưa hỗ trợ thanh toán từng phần. Vui lòng thanh toán toàn bộ giá trị đơn hàng.</p>
              </div>
              <div className="faq-item">
                <h3>Khi nào tôi được hoàn tiền nếu hủy đơn?</h3>
                <p>
                  - Chuyển khoản/Ví điện tử: Hoàn trong 3-5 ngày làm việc<br/>
                  - Thẻ tín dụng: 7-15 ngày tùy ngân hàng<br/>
                  - COD: Không phát sinh hoàn tiền
                </p>
              </div>
              <div className="faq-item">
                <h3>Tôi có nhận được hóa đơn VAT không?</h3>
                <p>Có, vui lòng yêu cầu xuất hóa đơn VAT khi đặt hàng hoặc liên hệ bộ phận CSKH.</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>💡 Lưu Ý</h2>
            <ul>
              <li>Vui lòng kiểm tra kỹ thông tin chuyển khoản trước khi giao dịch</li>
              <li>Ghi rõ nội dung chuyển khoản để tự động xác nhận đơn hàng</li>
              <li>Liên hệ ngay nếu chuyển khoản sai thông tin</li>
              <li>Giữ lại biên lai/ảnh chụp màn hình giao dịch</li>
            </ul>
          </div>

          <div className="policy-section">
            <h2>📞 Hỗ Trợ Thanh Toán</h2>
            <div className="contact-info">
              <p><strong>Hotline:</strong> <a href="tel:0368920249">0368 920 249</a></p>
              <p><strong>Email:</strong> <a href="mailto:thesungarden.tvu@gmail.com">thesungarden.tvu@gmail.com</a></p>
              <p>Làm việc: 8:00 - 22:00 hàng ngày</p>
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
