import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useEffect, useState, useRef } from 'react'
import api from '../api'
import './Header.css'

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
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const adminMenuRef = useRef(null)
  const userMenuRef = useRef(null)

  const SEARCH_HISTORY_KEY = 'thesungarden_search_history'
  const MAX_SEARCH_HISTORY = 5

  const isAdmin = user?.role === 'admin'
  const isCollaborator = user?.role === 'collaborator'

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

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false)
      }
    }
    if (showAdminMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAdminMenu])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu])

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
      
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
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
        {/* Top Bar - Hotline & User Actions */}
        <div className="header-topbar">
          <div className="topbar-container">
            <div className="topbar-left">
              <a href="tel:0123456789" className="topbar-phone">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                <span>Hotline: 0123 456 789</span>
              </a>
              <span className="topbar-divider">|</span>
              <span className="topbar-promo">🎁 Miễn phí giao hàng cho đơn từ 500k</span>
            </div>
            <div className="topbar-right">
              <button className="topbar-theme" onClick={toggleTheme} aria-label={dark ? "Chế độ sáng" : "Chế độ tối"}>
                <span>{dark ? '🌙' : '☀️'}</span>
              </button>
              
              {/* Admin Dropdown Menu */}
              {(isAdmin || isCollaborator) && (
                <div className="admin-dropdown-wrapper" ref={adminMenuRef}>
                  <button 
                    className="topbar-admin-btn"
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                    <span>Admin</span>
                    <svg className={`admin-chevron ${showAdminMenu ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showAdminMenu && (
                    <div className="admin-dropdown-menu">
                      <div className="admin-dropdown-header">
                        <span className="admin-role-badge">{isAdmin ? '👑 Admin' : '👤 Nhân viên'}</span>
                      </div>
                      
                      <Link to={isCollaborator ? "/collaborator" : "/admin"} className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="3" y="3" width="7" height="7" rx="1"/>
                          <rect x="14" y="3" width="7" height="7" rx="1"/>
                          <rect x="3" y="14" width="7" height="7" rx="1"/>
                          <rect x="14" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        <span>Dashboard</span>
                      </Link>
                      
                      {isAdmin && (
                        <>
                          <Link to="/admin/products" className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M12 3c-1.2 0-2.4.6-3 1.7L3 14c-.6 1.1-.6 2.5 0 3.6.6 1.2 1.8 2.4 3 2.4h12c1.2 0 2.4-1.2 3-2.4.6-1.1.6-2.5 0-3.6l-6-9.3C14.4 3.6 13.2 3 12 3z"/>
                              <circle cx="12" cy="14" r="3"/>
                            </svg>
                            <span>Sản phẩm</span>
                          </Link>
                          
                          <Link to="/admin/categories" className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                              <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                              <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                              <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                            </svg>
                            <span>Danh mục</span>
                          </Link>
                          
                          <Link to="/admin/users" className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
                              <circle cx="17" cy="7" r="3"/>
                              <path d="M21 21v-2a4 4 0 00-3-3.87"/>
                            </svg>
                            <span>Người dùng</span>
                          </Link>
                        </>
                      )}
                      
                      <Link to="/admin/orders" className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                        </svg>
                        <span>Đơn hàng</span>
                      </Link>
                      
                      <Link to="/admin/messages" className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        <span>Tin nhắn</span>
                      </Link>
                      
                      <div className="admin-menu-divider"></div>
                      
                      <Link to="/admin/stats" className="admin-menu-item" onClick={() => setShowAdminMenu(false)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 20V10M12 20V4M6 20v-6"/>
                        </svg>
                        <span>Thống kê</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              {user ? (
                <div className="admin-dropdown-wrapper" ref={userMenuRef}>
                  <button 
                    className="topbar-user-btn"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>{user.name}</span>
                    <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showUserMenu && (
                    <div className="admin-dropdown-menu">
                      <Link to="/profile" className="admin-menu-item" onClick={() => setShowUserMenu(false)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        <span>Trang cá nhân</span>
                      </Link>
                      
                      <Link to="/orders" className="admin-menu-item" onClick={() => setShowUserMenu(false)}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                        <span>Đơn hàng</span>
                      </Link>
                      
                      <div className="admin-menu-divider"></div>
                      
                      <button className="admin-menu-item" onClick={() => { logout(); setShowUserMenu(false); }}>
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="topbar-login">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>Đăng nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Header Main - Navigation + Logo (centered) + Search + Cart */}
        <div className="header-main">
          <div className="header-container">
            {/* Left Navigation */}
            <nav className="nav-menu nav-left">
              <Link to="/" className="nav-item">
                <span>Trang chủ</span>
              </Link>

              <div className="nav-item nav-dropdown">
                <Link to="/shop" className="nav-dropdown-btn">
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
            </nav>

            {/* Center Logo */}
            <Link to="/" className="header-logo" aria-label="Về trang chủ">
              <div className="logo-text-wrapper">
                <span className="logo-brand">FLORÉA</span>
                <span className="logo-tagline">Botanica Way of Life</span>
              </div>
            </Link>

            {/* Right Navigation */}
            <nav className="nav-menu nav-right">
              <Link to="/articles" className="nav-item">
                <span>Hướng dẫn</span>
              </Link>
            </nav>

            {/* Search & Cart */}
            <div className="header-actions">
              <form className="header-search" onSubmit={handleSearch}>
                <input
                  type="search"
                  placeholder="Tìm kiếm sản"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchHistory(true)}
                  onBlur={() => setTimeout(() => setShowSearchHistory(false), 200)}
                  className="header-search-input"
                  aria-label="Tìm kiếm sản phẩm"
                />
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

              <Link to="/cart" className="cart-icon-btn" aria-label="Giỏ hàng" title="Giỏ hàng">
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {items.length > 0 && <span className="cart-icon-badge">{items.length}</span>}
              </Link>

              <Link to="/coupons" className="coupon-icon-btn" aria-label="Mã giảm giá" title="Mã giảm giá">
                <span className="coupon-icon">🎫</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div aria-live="polite" aria-atomic="true" className="sr-only" id="cart-announcer"></div>
    </>
  )
}
