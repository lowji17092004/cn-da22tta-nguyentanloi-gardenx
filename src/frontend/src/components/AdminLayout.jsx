import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  const menuItems = [
    { 
      path: '/admin/products', 
      label: 'Sản phẩm', 
      desc: 'Danh sách, thêm, sửa, xóa',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      )
    },
    { 
      path: '/admin/categories', 
      label: 'Danh mục', 
      desc: 'Thống kê theo danh mục',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l-5.5 9h11z"/>
          <circle cx="17.5" cy="17.5" r="4.5"/>
          <path d="M3 13.5h8v8H3z"/>
        </svg>
      )
    },
    { 
      path: '/admin/articles', 
      label: 'Bài viết', 
      desc: 'Kiến thức chăm sóc',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      )
    },
    { 
      path: '/admin/orders', 
      label: 'Đơn hàng', 
      desc: 'Theo dõi và xử lý',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      )
    },
    { 
      path: '/admin/users', 
      label: 'Người dùng', 
      desc: 'Tài khoản và phân quyền',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
      )
    },
    { 
      path: '/admin/stats', 
      label: 'Thống kê', 
      desc: 'Báo cáo doanh thu',
      icon: (
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
        </svg>
      )
    },
  ]

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <div className="admin-logo-content">
              <span className="admin-logo-text">Hoa Kiểng</span>
              {!collapsed && <span className="admin-logo-badge">Admin Panel</span>}
            </div>
          </Link>
          <button 
            className="sidebar-toggle" 
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed ? (
                <path d="M9 18l6-6-6-6" />
              ) : (
                <path d="M15 18l-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        {!collapsed && (
          <div className="admin-user-section" ref={menuRef}>
            <button 
              className="admin-user-card"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-expanded={showUserMenu}
            >
              <div className="admin-user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="admin-user-info">
                <div className="admin-user-name">{user?.name}</div>
                <div className="admin-user-role">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style={{marginRight: '4px'}}>
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                  Quản trị viên
                </div>
              </div>
              <svg 
                className={`admin-dropdown-icon ${showUserMenu ? 'open' : ''}`}
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className="admin-user-dropdown">
                <div className="admin-dropdown-header">
                  <div className="admin-dropdown-name">{user?.name}</div>
                  <div className="admin-dropdown-email">{user?.email}</div>
                  <div className="admin-dropdown-badge">Admin</div>
                </div>
                <div className="admin-dropdown-divider"></div>
                <Link 
                  to="/profile" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                  <span>Cài đặt</span>
                </Link>
                <Link 
                  to="/" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                  <span>Về trang chủ</span>
                </Link>
                <div className="admin-dropdown-divider"></div>
                <button 
                  className="admin-dropdown-item danger"
                  onClick={() => {
                    logout()
                    setShowUserMenu(false)
                    navigate('/login')
                  }}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  <span>Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        )}

        <nav className="admin-nav">
          <div className="admin-nav-section">
            {!collapsed && <div className="admin-nav-title">QUẢN LÝ</div>}
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <div className="admin-nav-content">
                  <span className="admin-nav-label">{item.label}</span>
                  {!collapsed && <span className="admin-nav-desc">{item.desc}</span>}
                </div>
              </Link>
            ))}
          </div>

          <div className="admin-nav-section">
            {!collapsed && <div className="admin-nav-title">HỆ THỐNG</div>}
            <Link to="/" className="admin-nav-item" title={collapsed ? 'Về trang chủ' : ''}>
              <span className="admin-nav-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </span>
              <div className="admin-nav-content">
                <span className="admin-nav-label">Về trang chủ</span>
                {!collapsed && <span className="admin-nav-desc">Xem giao diện người dùng</span>}
              </div>
            </Link>
            <button 
              onClick={handleLogout} 
              className="admin-nav-item admin-nav-logout"
              title={collapsed ? 'Đăng xuất' : ''}
            >
              <span className="admin-nav-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              </span>
              <div className="admin-nav-content">
                <span className="admin-nav-label">Đăng xuất</span>
                {!collapsed && <span className="admin-nav-desc">Thoát khỏi hệ thống</span>}
              </div>
            </button>
          </div>
        </nav>
      </aside>

      <main className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  )
}
