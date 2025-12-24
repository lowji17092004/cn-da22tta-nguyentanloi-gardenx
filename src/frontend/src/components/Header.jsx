import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useEffect, useState } from 'react'
import api from '../api'
import './Header.css'

// Icon map cho các danh mục
const CATEGORY_ICONS = {
  'chau-cay': '🪴',
  'cay-canh': '🌱',
  'hoa-kieng': '🌸',
  'phu-kien': '🛠️',
  'default': '🌿'
}

const getCategoryIcon = (slug) => CATEGORY_ICONS[slug] || CATEGORY_ICONS['default']

export default function Header(){
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [productCategories, setProductCategories] = useState([])
  const [searchHistory, setSearchHistory] = useState([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)

  const SEARCH_HISTORY_KEY = 'thesungarden_search_history'
  const MAX_SEARCH_HISTORY = 5

  useEffect(() => {
    const pref = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const isDark = pref === 'dark'
    setDark(isDark)
    document.body.classList.toggle('dark-theme', isDark)

    loadCategories()
    
    // Load search history
    const saved = localStorage.getItem(SEARCH_HISTORY_KEY)
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved))
      } catch (e) {
        console.error('Error parsing search history', e)
      }
    }
  }, [])

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories/stats')
      setProductCategories(res.data.productCategories || [])
    } catch (err) {
      console.error('Error loading categories:', err)
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
      // Save to history
      const newHistory = [searchQuery.trim(), ...searchHistory.filter(h => h !== searchQuery.trim())].slice(0, MAX_SEARCH_HISTORY)
      setSearchHistory(newHistory)
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory))
      
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearchHistory(false)
    }
  }

  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  return (
    <>
      <a href="#main-content" className="skip-link">Bỏ qua tới nội dung</a>

      <header className={`site-header ${isScrolled ? 'is-scrolled' : ''}`}>
        {/* Marquee Text */}
        <div className="header-marquee">
          <div className="marquee-content">
            <span>🌿 Cây xanh - Sống khỏe • </span>
            <span>🌱 Miễn phí giao hàng cho đơn từ 500k • </span>
            <span>🌺 Chăm sóc cây trọn đời • </span>
            <span>🎁 Quà tặng hấp dẫn cho khách mới • </span>
            <span>🌿 Cây xanh - Sống khỏe • </span>
            <span>🌱 Miễn phí giao hàng cho đơn từ 500k • </span>
            <span>🌺 Chăm sóc cây trọn đời • </span>
            <span>🎁 Quà tặng hấp dẫn cho khách mới • </span>
          </div>
        </div>

        {/* Header Main - Logo + Navigation */}
        <div className="header-main">
          <div className="header-container">
            {/* Logo with Text */}
            <Link to="/" className="header-logo" aria-label="Về trang chủ">
              <img 
                src="/images/logo.png" 
                alt="The Sun Garden Logo" 
                className="logo-img" 
                onError={(e) => { e.target.src = '/images/hoakieng.jpg'; }} 
              />
              <div className="logo-text-wrapper">
                <span className="logo-title">The Sun Garden</span>
                <span className="logo-tagline">Hoa & Cây Cảnh</span>
              </div>
            </Link>

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

                <div className="nav-dropdown-menu mega-menu">
                  <div className="mega-menu-container">
                    {/* Left: Categories */}
                    <div className="mega-menu-categories">
                      {/* Mega Menu Columns */}
                      <div className="mega-menu-columns">
                        {productCategories.length > 0 ? (
                          productCategories.map(cat => (
                            <div key={cat._id} className="mega-menu-column">
                              <Link to={`/category/${cat.slug}`} className="mega-column-title">
                                {cat.name}
                              </Link>
                              {cat.subcategories && cat.subcategories.length > 0 && (
                                <div className="mega-column-links">
                                  {cat.subcategories.map(sub => (
                                    <Link
                                      key={sub._id}
                                      to={`/category/${cat.slug}/${sub.slug}`}
                                      className="mega-sub-link"
                                    >
                                      &gt; {sub.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          // Fallback khi chưa load được API
                          <>
                            <div className="mega-menu-column">
                              <Link to="/category/chau-cay" className="mega-column-title">Chậu cây</Link>
                              <div className="mega-column-links">
                                <Link to="/category/chau-cay/chau-xi-mang" className="mega-sub-link">&gt; Chậu xi măng</Link>
                                <Link to="/category/chau-cay/chau-nhua" className="mega-sub-link">&gt; Chậu nhựa</Link>
                                <Link to="/category/chau-cay/chau-dat-nung" className="mega-sub-link">&gt; Chậu đất nung</Link>
                                <Link to="/category/chau-cay/chau-gom" className="mega-sub-link">&gt; Chậu gốm</Link>
                              </div>
                            </div>
                            <div className="mega-menu-column">
                              <Link to="/category/cay-canh" className="mega-column-title">Cây cảnh</Link>
                              <div className="mega-column-links">
                                <Link to="/category/cay-canh/cay-van-phong" className="mega-sub-link">&gt; Cây văn phòng</Link>
                                <Link to="/category/cay-canh/cay-ngoai-troi" className="mega-sub-link">&gt; Cây ngoại trời</Link>
                                <Link to="/category/cay-canh/cay-phong-thuy" className="mega-sub-link">&gt; Cây phong thủy</Link>
                              </div>
                            </div>
                            <div className="mega-menu-column">
                              <Link to="/category/hoa-kieng" className="mega-column-title">Hoa kiểng</Link>
                              <div className="mega-column-links">
                                <Link to="/category/hoa-kieng/hoa-hong" className="mega-sub-link">&gt; Hoa hồng</Link>
                                <Link to="/category/hoa-kieng/hoa-lan" className="mega-sub-link">&gt; Hoa lan</Link>
                                <Link to="/category/hoa-kieng/hoa-cuc" className="mega-sub-link">&gt; Hoa cúc</Link>
                              </div>
                            </div>
                            <div className="mega-menu-column">
                              <Link to="/category/phu-kien" className="mega-column-title">Phụ kiện</Link>
                              <div className="mega-column-links">
                                <Link to="/category/phu-kien/phan-bon" className="mega-sub-link">&gt; Phân bón</Link>
                                <Link to="/category/phu-kien/dat-trong" className="mega-sub-link">&gt; Đất trồng</Link>
                                <Link to="/category/phu-kien/dung-cu" className="mega-sub-link">&gt; Dụng cụ</Link>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Right: Featured Image */}
                    <div className="mega-menu-image">
                      <img 
                        src="/images/caycanh.jpg" 
                        alt="Cây cảnh đa dạng" 
                        onError={(e) => { e.target.src = '/images/hoakieng.jpg'; }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Link to="/articles" className="nav-item nav-item--premium">
                <span>Hướng dẫn</span>
              </Link>
            </nav>

            <form className="header-search header-search--premium" onSubmit={handleSearch}>
              <svg className="search-icon-header" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchHistory(true)}
                onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                className="header-search-input"
                aria-label="Tìm kiếm sản phẩm"
              />
              {searchQuery && (
                <button type="button" className="search-clear-header" onClick={() => setSearchQuery('')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
              <button type="submit" className="header-search-btn" aria-label="Tìm kiếm">
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {/* Search History Dropdown */}
              {showSearchHistory && searchHistory.length > 0 && !searchQuery && (
                <div className="header-search-history">
                  <div className="search-history-header">
                    <span>Tìm kiếm gần đây</span>
                    <button type="button" onClick={clearSearchHistory}>Xóa</button>
                  </div>
                  {searchHistory.map((term, idx) => (
                    <div 
                      key={idx} 
                      className="search-history-item"
                      onMouseDown={() => {
                        setSearchQuery(term)
                        setShowSearchHistory(false)
                        navigate(`/shop?search=${encodeURIComponent(term)}`)
                      }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              )}
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
