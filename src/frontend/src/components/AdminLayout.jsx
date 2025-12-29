import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Footer from './Footer'

export default function AdminLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  const isCollaborator = user?.role === 'collaborator'

  // Menu items cho Admin với icon đẹp và badge màu sắc
  const adminMenuItems = [
    { 
      path: '/admin/products', 
      label: 'Sản phẩm', 
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V12M12 12C12 12 9 9 7 7M12 12C12 12 15 9 17 7M5 21h14M12 6a3 3 0 100-6 3 3 0 000 6z"/>
        </svg>
      )
    },
    { 
      path: '/admin/categories', 
      label: 'Danh mục', 
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      )
    },
    { 
      path: '/admin/articles', 
      label: 'Bài viết', 
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
      )
    },
    { 
      path: '/admin/orders', 
      label: 'Đơn hàng', 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          <circle cx="9" cy="17" r="1" fill="currentColor"/>
          <circle cx="15" cy="17" r="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      path: '/admin/reviews', 
      label: 'Đánh giá', 
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      )
    },
    { 
      path: '/admin/messages', 
      label: 'Tin nhắn', 
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6"/>
        </svg>
      )
    },
    { 
      path: '/admin/coupons', 
      label: 'Mã giảm giá', 
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
        </svg>
      )
    },
    { 
      path: '/admin/users', 
      label: 'Người dùng', 
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="9" cy="7" r="4"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
          <circle cx="17" cy="7" r="3"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21v-2a4 4 0 00-3-3.87"/>
        </svg>
      )
    },
    { 
      path: '/admin/stats', 
      label: 'Thống kê', 
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      )
    },
  ]

  // Menu items cho Collaborator
  const collaboratorMenuItems = [
    { 
      path: '/collaborator', 
      label: 'Dashboard', 
      color: '#1a472a',
      bgColor: 'rgba(26, 71, 42, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
        </svg>
      )
    },
    { 
      path: '/admin/orders', 
      label: 'Đơn hàng', 
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          <circle cx="9" cy="17" r="1" fill="currentColor"/>
          <circle cx="15" cy="17" r="1" fill="currentColor"/>
        </svg>
      )
    },
    { 
      path: '/admin/reviews', 
      label: 'Đánh giá', 
      color: '#eab308',
      bgColor: 'rgba(234, 179, 8, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      )
    },
    { 
      path: '/admin/messages', 
      label: 'Tin nhắn', 
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>
          <path strokeLinecap="round" strokeLinejoin="round" d="M22 6l-10 7L2 6"/>
        </svg>
      )
    },
  ]

  const menuItems = isCollaborator ? collaboratorMenuItems : adminMenuItems

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
              <span className="admin-logo-icon">🌿</span>
              <div className="admin-logo-text-wrap">
                <span className="admin-logo-name">FLORÉA</span>
                <span className="admin-logo-tagline">Botanica Way of Life</span>
              </div>
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
              <div className="admin-user-info-simple">
                <span className="admin-badge-icon">�</span>
                <span className="admin-role-text">{user?.name || 'Người dùng'}</span>
              </div>
              <svg 
                className={`admin-dropdown-icon ${showUserMenu ? 'open' : ''}`}
                width="16" 
                height="16" 
                fill="none" 
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className="admin-user-dropdown">
                <div className="admin-dropdown-header">
                  <div className="admin-dropdown-name">{user?.name}</div>
                  <div className="admin-dropdown-email">{user?.email}</div>
                  <div className="admin-dropdown-badge">{isCollaborator ? 'Collaborator' : 'Admin'}</div>
                </div>
                <div className="admin-dropdown-divider"></div>
                <Link 
                  to="/profile" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <span>Hồ sơ cá nhân</span>
                </Link>
                <Link 
                  to="/settings" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span>Cài đặt</span>
                </Link>
                <Link 
                  to="/" 
                  className="admin-dropdown-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
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
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
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
                title={item.label}
                style={{
                  '--item-color': item.color,
                  '--item-bg': item.bgColor
                }}
              >
                <span className="admin-nav-icon" style={{ color: location.pathname === item.path ? item.color : 'inherit' }}>
                  {item.icon}
                </span>
                {!collapsed && <span className="admin-nav-label">{item.label}</span>}
                {!collapsed && location.pathname === item.path && (
                  <span className="admin-nav-indicator" style={{ background: item.color }}></span>
                )}
              </Link>
            ))}
          </div>

          <div className="admin-nav-section">
            {!collapsed && <div className="admin-nav-title">HỆ THỐNG</div>}
            <Link to="/" className="admin-nav-item system-item" title="Về trang chủ">
              <span className="admin-nav-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </span>
              {!collapsed && <span className="admin-nav-label">Trang chủ</span>}
            </Link>
            <button 
              onClick={handleLogout} 
              className="admin-nav-item admin-nav-logout"
              title="Đăng xuất"
            >
              <span className="admin-nav-icon">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </span>
              {!collapsed && <span className="admin-nav-label">Đăng xuất</span>}
            </button>
          </div>
        </nav>
      </aside>

      <main className={`admin-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="admin-content">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  )
}
