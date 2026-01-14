import React from 'react';
import './About.css';

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Floréa</h1>
          <p className="hero-subtitle">Nơi thiên nhiên và yêu thương hòa quyện</p>
          <p className="hero-description">Chúng tôi mang đến những khoảnh khắc xanh mát, tươi đẹp cho cuộc sống của bạn</p>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-intro">
        <div className="container">
          <div className="intro-content">
            <div className="intro-text">
              <h2>Về Floréa</h2>
              <p className="intro-highlight">
                Floréa ra đời từ tình yêu với thiên nhiên và niềm đam mê mang vẻ đẹp xanh mát đến mọi không gian sống.
              </p>
              <p>
                Chúng tôi tin rằng mỗi cây xanh không chỉ là một món đồ trang trí, mà là người bạn đồng hành, 
                mang lại năng lượng tích cực, không khí trong lành và sự bình yên cho tâm hồn.
              </p>
              <p>
                Với đội ngũ chuyên gia giàu kinh nghiệm và tâm huyết, Floréa cam kết cung cấp những cây cảnh 
                chất lượng cao nhất cùng dịch vụ tư vấn, chăm sóc tận tâm, giúp bạn dễ dàng xây dựng 
                không gian xanh mơ ước của mình.
              </p>
            </div>
            <div className="intro-image">
              <div className="image-placeholder">
                <span>🌿</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card">
              <div className="mv-icon">🎯</div>
              <h3>Sứ mệnh</h3>
              <p>
                Lan tỏa tình yêu thiên nhiên, giúp mọi người dễ dàng tiếp cận và chăm sóc cây xanh, 
                từ đó xây dựng cuộc sống xanh - sạch - đẹp và bền vững hơn.
              </p>
            </div>
            <div className="mv-card">
              <div className="mv-icon">👁️</div>
              <h3>Tầm nhìn</h3>
              <p>
                Trở thành thương hiệu cây cảnh hàng đầu Việt Nam, được khách hàng tin tưởng và yêu mến 
                nhờ chất lượng sản phẩm vượt trội và dịch vụ chăm sóc tận tâm.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <div className="container">
          <h2 className="section-title">Giá trị cốt lõi</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">✨</div>
              <h3>Chất lượng đảm bảo</h3>
              <p>Mỗi cây xanh đều được tuyển chọn kỹ lưỡng, chăm sóc chu đáo trước khi đến tay khách hàng</p>
            </div>
            <div className="value-item">
              <div className="value-icon">❤️</div>
              <h3>Tận tâm phục vụ</h3>
              <p>Lắng nghe, thấu hiểu và đồng hành cùng khách hàng trong từng bước xây dựng không gian xanh</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🌍</div>
              <h3>Trách nhiệm xã hội</h3>
              <p>Cam kết bảo vệ môi trường, thực hành kinh doanh bền vững và đóng góp cho cộng đồng</p>
            </div>
            <div className="value-item">
              <div className="value-icon">🚀</div>
              <h3>Đổi mới sáng tạo</h3>
              <p>Không ngừng học hỏi, cập nhật xu hướng và cải tiến để mang đến trải nghiệm tốt nhất</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose">
        <div className="container">
          <h2 className="section-title">Tại sao chọn Floréa?</h2>
          <div className="reasons-grid">
            <div className="reason-card">
              <span className="reason-number">01</span>
              <h3>Đa dạng sản phẩm</h3>
              <p>Hơn 500+ loại cây cảnh từ trong nhà, ngoài trời đến cây phong thủy, phù hợp mọi không gian</p>
            </div>
            <div className="reason-card">
              <span className="reason-number">02</span>
              <h3>Tư vấn chuyên nghiệp</h3>
              <p>Đội ngũ chuyên gia nhiệt tình hướng dẫn chi tiết cách chăm sóc phù hợp cho từng loại cây</p>
            </div>
            <div className="reason-card">
              <span className="reason-number">03</span>
              <h3>Giá cả hợp lý</h3>
              <p>Cam kết giá tốt nhất thị trường với nhiều chương trình ưu đãi hấp dẫn quanh năm</p>
            </div>
            <div className="reason-card">
              <span className="reason-number">04</span>
              <h3>Giao hàng tận nơi</h3>
              <p>Dịch vụ vận chuyển nhanh chóng, cẩn thận, đảm bảo cây luôn tươi tốt khi đến tay bạn</p>
            </div>
            <div className="reason-card">
              <span className="reason-number">05</span>
              <h3>Chăm sóc sau bán</h3>
              <p>Hỗ trợ tư vấn miễn phí suốt quá trình chăm sóc cây, đổi trả linh hoạt nếu có vấn đề</p>
            </div>
            <div className="reason-card">
              <span className="reason-number">06</span>
              <h3>Cộng đồng yêu cây</h3>
              <p>Tham gia cộng đồng người yêu cây, chia sẻ kinh nghiệm và nhận thêm nhiều tips hữu ích</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Hãy để Floréa đồng hành cùng bạn</h2>
            <p>Liên hệ ngay với chúng tôi để được tư vấn và nhận ưu đãi đặc biệt</p>
            <div className="cta-info">
              <div className="cta-item">
                <span className="cta-icon">📍</span>
                <div>
                  <strong>Địa chỉ</strong>
                  <p>01 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM</p>
                </div>
              </div>
              <div className="cta-item">
                <span className="cta-icon">📞</span>
                <div>
                  <strong>Hotline</strong>
                  <p>(028) 3896 0652</p>
                </div>
              </div>
              <div className="cta-item">
                <span className="cta-icon">✉️</span>
                <div>
                  <strong>Email</strong>
                  <p>contact@florea.vn</p>
                </div>
              </div>
              <div className="cta-item">
                <span className="cta-icon">🕒</span>
                <div>
                  <strong>Giờ làm việc</strong>
                  <p>Thứ 2 - CN: 8:00 - 20:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
