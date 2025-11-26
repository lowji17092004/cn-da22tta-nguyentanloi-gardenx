import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useEffect, useState } from 'react'

export default function Header(){
  const { user, logout } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const pref = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    const isDark = pref === 'dark'
    setDark(isDark)
    document.body.classList.toggle('dark-theme', isDark)
  }, [])

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
      <header className="site-header">
        <div className="header-top">
          <div className="header-container">
            <div className="header-top-left">
              <a href="tel:+84368920249" className="header-info">
                <svg className="info-icon" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                <span><strong>0368 920 249</strong></span>
              </a>
              <span className="header-info header-divider">|</span>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
              </div>
            </div>
            <Link to="/" className="logo header-logo">
              <div className="logo-icon">
                <img src="/images/logo.png" alt="Logo" />
              </div>
            </Link>
            <div className="header-top-right">
              <a href="mailto:info@hoakieng.vn" className="header-info">
                <span className="info-icon">📧</span>
                <span>info@hoakieng.vn</span>
              </a>
            </div>
          </div>
        </div>
        <div className="header-main">
          <div className="header-container">
            <nav className="nav-menu">
              <Link to="/" className="nav-item">
                <span>Trang chủ</span>
              </Link>
              <div className="nav-item nav-dropdown">
                <button className="nav-dropdown-btn">
                  <span>Sản phẩm</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                <div className="nav-dropdown-menu nav-dropdown-grid">
                  <Link to="/shop?category=hoa-kieng" className="dropdown-item">
                    <span>Hoa kiểng</span>
                  </Link>
                  <Link to="/shop?category=cay-canh" className="dropdown-item">
                    <span>Cây cảnh</span>
                  </Link>
                  <Link to="/shop?category=cay-thuy-canh" className="dropdown-item">
                    <span>Cây thủy cảnh</span>
                  </Link>
                  <Link to="/shop?category=sen-da" className="dropdown-item">
                    <span>Sen đá</span>
                  </Link>
                </div>
              </div>
              <Link to="/articles" className="nav-item">
                <span>Giới thiệu</span>
              </Link>
              <Link to="/blog" className="nav-item">
                <span>Blog</span>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/products" className="nav-item admin-link">
                  <span>Quản trị</span>
                </Link>
              )}
            </nav>

            <form className="header-search" onSubmit={handleSearch}>
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
              {user && (
                <Link to="/orders" className="cart-icon-btn" aria-label="Đơn hàng của tôi" title="Đơn hàng của tôi">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </Link>
              )}
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
                <>
                  <div className="user-menu">
                    <div className="user-info">
                      <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                      <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-role">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span>
                      </div>
                    </div>
                    <button className="btn-logout" onClick={logout}>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn-ghost">
                    <span>Đăng nhập</span>
                  </Link>
                  <Link to="/register" className="btn-primary btn-sm">
                    <span>Đăng ký</span>
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
