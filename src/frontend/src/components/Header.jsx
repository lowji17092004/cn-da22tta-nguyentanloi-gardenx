import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useEffect, useState } from 'react'
import api from '../api'

const BLOG_CATEGORIES = [
  { id: 'about', title: 'FLORANA', desc: 'Giới thiệu về Florana - Cửa hàng hoa và cây cảnh uy tín.', fallback: '/images/hoakieng.jpg' },
  { id: 'info', title: 'THÔNG TIN VỀ CÂY', desc: 'Hồ sơ thông tin về các loại cây cảnh, hình ảnh, đặc điểm.', fallback: '/images/caycanh.jpg' },
  { id: 'care', title: 'KIẾN THỨC & CHĂM SÓC', desc: 'Hướng dẫn chăm sóc & thông tin hữu ích về cây cảnh.', fallback: '/images/caythuycanh.jpg' },
  { id: 'inspiration', title: 'CẢM HỨNG & Ý TƯỞNG', desc: 'Mẹo và ý tưởng về cây giúp bạn có không gian lý tưởng.', fallback: '/images/senda.jpg' }
]

export default function Header(){
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [productCategories, setProductCategories] = useState([])
  const [blogCategories, setBlogCategories] = useState([])
  const [blogImages, setBlogImages] = useState({})

  useEffect(() => {
    const pref = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const isDark = pref === 'dark'
    setDark(isDark)
    document.body.classList.toggle('dark-theme', isDark)

    loadCategories()
    loadBlogImages()
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories')
      const cats = res.data
      setProductCategories(cats.filter(c => c.type === 'product' || !c.type))
      setBlogCategories(cats.filter(c => c.type === 'blog'))
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadBlogImages = async () => {
    try {
      const images = {}
      for (const cat of BLOG_CATEGORIES) {
        const res = await api.get(`/articles?category=${cat.id}&limit=1`)
        if (res.data.articles && res.data.articles.length > 0 && res.data.articles[0].thumbnail) {
          images[cat.id] = res.data.articles[0].thumbnail
        }
      }
      setBlogImages(images)
    } catch (err) {
      console.error('Error loading blog images:', err)
    }
  }

  function toggleTheme(){
    const next = !dark
    setDark(next)
    document.body.classList.toggle('dark-theme', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  function handleSearch(e){
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Bỏ qua tới nội dung</a>

      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="header-top header-top--premium">
          <div className="header-container header-top-inner">
            <Link to="/" className="header-logo-center" aria-label="Về trang chủ">
              <img 
                src="/images/logo.png" 
                alt="The Sun Garden Logo" 
                className="logo-img logo-large" 
                onError={(e) => { e.target.src = '/images/hoakieng.jpg'; }} 
              />
            </Link>
          </div>
        </div>

        <div className="header-main header-main--premium">
          <div className="header-container">
            <nav className="nav-menu">
              <Link to="/" className="nav-item nav-item--premium">
                <span>Trang chủ</span>
              </Link>

              <div className="nav-item nav-dropdown nav-item--premium">
                <Link to="/shop" className="nav-dropdown-btn nav-dropdown-btn--premium">
                  <span>Sản phẩm</span>
                  <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </Link>

                <div className="nav-dropdown-menu nav-dropdown-simple">
                  {productCategories.length > 0 ? (
                    productCategories.map(cat => (
                      <div key={cat._id} className="dropdown-category-group">
                        <Link to={`/category/${cat.slug}`} className="dropdown-category-link main-category">
                          {cat.name}
                        </Link>
                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="dropdown-subcategories">
                            {cat.subcategories.map(sub => (
                              <Link
                                key={sub._id}
                                to={`/category/${cat.slug}/${sub.slug}`}
                                className="dropdown-category-link sub-category"
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="dropdown-category-group">
                        <Link to="/category/hoa-kieng" className="dropdown-category-link main-category">Hoa Kiểng</Link>
                      </div>
                      <div className="dropdown-category-group">
                        <Link to="/category/cay-canh" className="dropdown-category-link main-category">Cây Cảnh</Link>
                      </div>
                      <div className="dropdown-category-group">
                        <Link to="/category/cay-thuy-canh" className="dropdown-category-link main-category">Cây Thủy Canh</Link>
                      </div>
                      <div className="dropdown-category-group">
                        <Link to="/category/sen-da" className="dropdown-category-link main-category">Sen Đá</Link>
                      </div>
                    </>
                  )}

                  <div className="dropdown-menu-image">
                    <img src="/images/caycanh.jpg" alt="Sản phẩm cây cảnh" />
                    <div className="dropdown-image-overlay">
                      <span className="dropdown-image-text">Khám phá bộ sưu tập</span>
                      <span className="dropdown-image-cta">Xem tất cả →</span>
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/articles" className="nav-item nav-item--premium">
                <span>Blog</span>
              </Link>
            </nav>

            <form className="header-search header-search--premium" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
                aria-label="Tìm kiếm sản phẩm"
              />
              <button type="submit" className="header-search-btn" aria-label="Tìm kiếm">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>

            <div className="header-actions">
              <Link to="/cart" className="cart-icon-btn" aria-label="Giỏ hàng" title="Giỏ hàng">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {items.length > 0 && <span className="cart-icon-badge">{items.length}</span>}
              </Link>

              <button className="theme-toggle" aria-pressed={dark} aria-label="Bật/Tắt chế độ tối" title={dark ? "Chế độ sáng" : "Chế độ tối"} onClick={toggleTheme}>
                <span className="theme-icon">{dark ? '🌙' : '☀️'}</span>
              </button>

              {user ? (
                <div className="user-menu">
                  <Link to="/profile" className="user-avatar-link" title={`${user.name} - Xem hồ sơ`}>
                    {user.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                        alt={user.name}
                        className="user-avatar"
                      />
                    ) : (
                      <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </Link>

                  <div className="user-dropdown">
                    <div className="user-info-header">
                      {user.avatar ? (
                        <img
                          src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`}
                          alt={user.name}
                          className="user-avatar"
                        />
                      ) : (
                        <span className="user-avatar-large">{user.name.charAt(0).toUpperCase()}</span>
                      )}

                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                    </div>

                    <div className="user-dropdown-menu">
                      <Link to="/profile" className="user-dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Trang cá nhân</span>
                      </Link>

                      <Link to="/orders" className="user-dropdown-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        <span>Đơn hàng của tôi</span>
                      </Link>

                      {(user.role === 'admin' || user.role === 'collaborator') && (
                        <Link to={user.role === 'admin' ? '/admin/products' : '/admin/orders'} className="user-dropdown-item">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span>{user.role === 'admin' ? 'Trang quản trị' : 'Quản lý đơn hàng'}</span>
                        </Link>
                      )}

                      <div className="user-dropdown-divider"></div>

                      <button className="user-dropdown-item logout-btn" onClick={logout}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
                        </svg>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-ghost">
                    <span>Đăng nhập</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div aria-live="polite" aria-atomic="true" className="sr-only" id="cart-announcer"></div>
    </>
  )
}
