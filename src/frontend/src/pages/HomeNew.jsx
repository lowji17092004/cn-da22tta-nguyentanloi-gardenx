import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import { flyToCart } from '../utils/cartAnimation'
import './HomeNew.css'

const CATEGORIES = {
  'chau-cay': 'Chậu cây',
  'cay-canh': 'Cây cảnh',
  'hoa-kieng': 'Hoa kiểng',
  'phu-kien': 'Phụ kiện'
}

const normalizeCategorySlug = (category) => {
  if (!category) return ''
  const normalized = category.toLowerCase().trim()
  const mapping = {
    'chậu cây': 'chau-cay',
    'chau cay': 'chau-cay',
    'hoa kiểng': 'hoa-kieng',
    'hoa kieng': 'hoa-kieng',
    'cây cảnh': 'cay-canh',
    'cay canh': 'cay-canh',
    'phụ kiện': 'phu-kien',
    'phu kien': 'phu-kien'
  }
  return mapping[normalized] || category
}

const getCategoryName = (slug) => CATEGORIES[slug] || slug

// Dữ liệu đánh giá khách hàng
const TESTIMONIALS = [
  {
    id: 1,
    name: 'Nguyễn Thị Mai',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    text: 'Sản phẩm chất lượng tuyệt vời! Cây đến tay còn tươi xanh, đóng gói cẩn thận. Rất hài lòng với dịch vụ của shop.',
    date: '15/11/2025'
  },
  {
    id: 2,
    name: 'Trần Văn Hùng',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 5,
    text: 'Mình đã mua nhiều lần ở đây. Giá cả hợp lý, nhân viên tư vấn nhiệt tình. Sẽ tiếp tục ủng hộ!',
    date: '10/11/2025'
  },
  {
    id: 3,
    name: 'Lê Thị Hương',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    rating: 5,
    text: 'Shop giao hàng nhanh, cây khỏe mạnh. Đặc biệt thích cách đóng gói chắc chắn, cây không bị hư hại.',
    date: '05/11/2025'
  }
]

// Lý do chọn cửa hàng
const WHY_CHOOSE_US = [
  {
    icon: '🌿',
    title: 'Sản phẩm chất lượng',
    description: 'Chúng tôi cam kết cung cấp cây cảnh khỏe mạnh, được chăm sóc kỹ lưỡng trước khi đến tay khách hàng.'
  },
  {
    icon: '🚚',
    title: 'Giao hàng nhanh chóng',
    description: 'Đơn hàng được xử lý và giao trong 24-48h. Đóng gói cẩn thận, đảm bảo cây không bị hư hại.'
  },
  {
    icon: '💬',
    title: 'Tư vấn tận tình',
    description: 'Đội ngũ nhân viên giàu kinh nghiệm, sẵn sàng hỗ trợ bạn chọn cây phù hợp và cách chăm sóc.'
  },
  {
    icon: '🔄',
    title: 'Đổi trả dễ dàng',
    description: 'Chính sách đổi trả linh hoạt trong 7 ngày nếu cây không đạt chất lượng như mong đợi.'
  }
]

export default function HomeNew(){
  const [featured, setFeatured] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const { user } = useAuth()
  const navigate = useNavigate()
  const { add, announce } = useCart()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products')
        const products = res.data
        
        // Chỉ lấy sản phẩm được gắn tag nổi bật (isFeatured = true)
        const featuredProducts = products.filter(p => p.isFeatured === true)
        setFeatured(featuredProducts.slice(0, 10))
        
        // Chỉ lấy sản phẩm đã bán >= 10 (bestsellers)
        const bestSellerProducts = products.filter(p => (p.sold || 0) >= 10)
        setBestsellers(bestSellerProducts.slice(0, 10))
      } catch(e) {
        console.error('Failed to load products', e)
      }
    }
    loadProducts()
  }, [])

  function handleAdd(p, event){
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    
    if (p.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    
    const productElement = event?.target?.closest('.product-card-minimal')
    if (productElement) {
      const productImage = p.images && p.images[0] ? p.images[0] : '/images/placeholder.png'
      flyToCart(productElement, productImage, p.name)
    }
    
    add(p, 1)
    try { announce && announce(`${p.name} đã được thêm vào giỏ`) } catch(e){}
  }

  function handleBuyNow(p, event){
    event?.preventDefault()
    if (!user) {
      navigate('/login', { state: { from: '/' } })
      return
    }
    if (p.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng')
      return
    }
    add(p, 1)
    navigate('/checkout')
  }

  // Render product card
  const renderProductCard = (p) => (
    <article key={p._id} className="product-card-minimal">
      <Link to={`/product/${p._id}`} className="product-image-link-minimal">
        <div className="product-image-wrapper-minimal">
          {p.images && p.images[0] ? (
            <img src={p.images[0]} alt={p.name} className="product-image-minimal" loading="lazy" />
          ) : (
            <div className="product-image-placeholder">
              <span className="placeholder-icon">🌿</span>
            </div>
          )}
          
          <div className="product-badges-minimal">
            {p.stock === 0 && (
              <span className="product-badge out-of-stock">Hết hàng</span>
            )}
            {p.isFeatured && p.stock > 0 && (
              <span className="product-badge featured">⭐ Nổi bật</span>
            )}
            {(p.sold || 0) >= 10 && p.stock > 0 && (
              <span className="product-badge bestseller">🔥 Bán chạy</span>
            )}
          </div>

          <div className="product-hover-action">
            <button 
              className="btn-add-to-cart-hover" 
              onClick={(e) => {
                e.preventDefault()
                handleAdd(p, e)
              }}
              disabled={p.stock === 0}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </Link>
      
      <div className="product-info-minimal">
        {p.category && (
          <span className="product-category-tag">
            {getCategoryName(normalizeCategorySlug(p.category))}
          </span>
        )}
        
        <Link to={`/product/${p._id}`} className="product-name-link">
          <h3 className="product-name-minimal">{p.name}</h3>
        </Link>
        
        <div className="product-price-minimal">
          <span className="price-amount">{p.price?.toLocaleString('vi-VN')}₫</span>
          {p.stock > 0 && p.stock < 10 && (
            <span className="stock-indicator">Còn {p.stock}</span>
          )}
        </div>
      </div>
    </article>
  )

  return (
    <main id="main-content">
      {/* Hero Banner */}
      <div className="home-hero">
        <div className="single-banner">
          <img src="/images/banner.jpg" alt="Cửa hàng hoa kiểng" className="banner-image" />
        </div>
      </div>

      {/* Featured Products - Chỉ hiển thị nếu có sản phẩm được gắn tag nổi bật */}
      {featured.length > 0 && (
        <section className="home-section container">
          <div className="section-header-home">
            <div className="section-title-wrap">
              <h2 className="section-title-home">⭐ Sản phẩm nổi bật</h2>
              <p className="section-subtitle-home">Những sản phẩm được tuyển chọn đặc biệt dành cho bạn</p>
            </div>
            <Link to="/featured" className="section-view-all-btn">
              Xem tất cả
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </div>
          <div className="products-grid">
            {featured.map(renderProductCard)}
          </div>
        </section>
      )}

      {/* Bestsellers - Chỉ hiển thị nếu có sản phẩm bán >= 10 */}
      {bestsellers.length > 0 && (
        <section className="home-section home-section-alt container">
          <div className="section-header-home">
            <div className="section-title-wrap">
              <h2 className="section-title-home">🔥 Sản phẩm bán chạy</h2>
              <p className="section-subtitle-home">Những sản phẩm được khách hàng yêu thích nhất (đã bán trên 10 sản phẩm)</p>
            </div>
            <Link to="/bestsellers" className="section-view-all-btn">
              Xem tất cả
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          </div>
          <div className="products-grid">
            {bestsellers.map(renderProductCard)}
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="home-section why-choose-section">
        <div className="container">
          <div className="section-header-home center">
            <h2 className="section-title-home">🏆 Tại sao chọn chúng tôi?</h2>
            <p className="section-subtitle-home">Những lý do khiến The Sun Garden trở thành lựa chọn hàng đầu của bạn</p>
          </div>
          
          <div className="why-choose-grid">
            {WHY_CHOOSE_US.map((item, index) => (
              <div key={index} className="why-choose-card">
                <div className="why-choose-icon">{item.icon}</div>
                <h3 className="why-choose-title">{item.title}</h3>
                <p className="why-choose-desc">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="home-section testimonials-section">
        <div className="container">
          <div className="section-header-home center">
            <h2 className="section-title-home">💬 Khách hàng nói gì về chúng tôi?</h2>
            <p className="section-subtitle-home">Những đánh giá chân thực từ khách hàng đã mua sắm tại The Sun Garden</p>
          </div>
          
          <div className="testimonials-grid">
            {TESTIMONIALS.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar-img" />
                  <div className="testimonial-info">
                    <h4 className="testimonial-name">{testimonial.name}</h4>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="star">⭐</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <span className="testimonial-date">{testimonial.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="home-section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Tạo không gian sống xanh - Tận hưởng cuộc sống khỏe</h2>
            <p className="cta-desc">Mang thiên nhiên vào nhà bạn với bộ sưu tập cây cảnh đa dạng. Ưu đãi đặc biệt cho đơn hàng đầu tiên!</p>
            <Link to="/shop" className="cta-button">
              Khám phá ngay
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
