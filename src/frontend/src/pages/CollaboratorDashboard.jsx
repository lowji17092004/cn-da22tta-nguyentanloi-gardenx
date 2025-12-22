import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';
import './CollaboratorDashboard.css';

const CollaboratorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingOrders: 0,
    pendingReviews: 0,
    unreadMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    let pendingOrders = 0;
    let pendingReviews = 0;
    let unreadMessages = 0;

    try {
      // Fetch pending orders count
      const ordersRes = await api.get('/orders');
      const ordersData = Array.isArray(ordersRes.data) ? ordersRes.data : [];
      pendingOrders = ordersData.filter(o => o.status === 'pending').length;
    } catch (error) {
      console.error('Error fetching orders:', error);
    }

    try {
      // Fetch pending reviews count
      const reviewsRes = await api.get('/reviews');
      const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      pendingReviews = reviewsData.filter(r => !r.reply).length;
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }

    try {
      // Fetch unread messages count
      const messagesRes = await api.get('/messages');
      const messagesData = Array.isArray(messagesRes.data) ? messagesRes.data : [];
      unreadMessages = messagesData.filter(m => !m.isRead).length;
    } catch (error) {
      console.error('Error fetching messages:', error);
    }

    setStats({
      pendingOrders,
      pendingReviews,
      unreadMessages
    });
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Quản lý đơn hàng',
      description: 'Xem và duyệt đơn hàng từ khách hàng',
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      link: '/admin/orders',
      badge: stats.pendingOrders,
      color: '#0ea5e9'
    },
    {
      title: 'Quản lý đánh giá',
      description: 'Phản hồi đánh giá từ khách hàng',
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      link: '/admin/reviews',
      badge: stats.pendingReviews,
      color: '#f59e0b'
    },
    {
      title: 'Tin nhắn',
      description: 'Trả lời tin nhắn từ khách hàng',
      icon: (
        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      link: '/admin/messages',
      badge: stats.unreadMessages,
      color: '#10b981'
    }
  ];

  if (loading) {
    return (
      <div className="collab-dashboard">
        <div className="collab-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="collab-dashboard">
      {/* Header */}
      <header className="collab-header">
        <div className="collab-header-left">
          <div className="collab-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Florana</span>
          </div>
          <div className="collab-badge">Nhân viên</div>
        </div>
        <div className="collab-header-right">
          <div className="collab-user-info">
            {user?.avatar ? (
              <img 
                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                alt="Avatar" 
                className="collab-avatar"
              />
            ) : (
              <div className="collab-avatar-placeholder">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <span className="collab-username">{user?.name || 'Nhân viên'}</span>
          </div>
          <button className="collab-logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="collab-main">
        <div className="collab-welcome">
          <h1>Xin chào, {user?.name || 'Nhân viên'}! 👋</h1>
          <p>Chọn chức năng bạn muốn thực hiện</p>
        </div>

        {/* Stats Overview */}
        <div className="collab-stats">
          <div className="collab-stat-item">
            <div className="stat-icon orders">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.pendingOrders}</span>
              <span className="stat-label">Đơn hàng chờ duyệt</span>
            </div>
          </div>
          <div className="collab-stat-item">
            <div className="stat-icon reviews">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.pendingReviews}</span>
              <span className="stat-label">Đánh giá chờ phản hồi</span>
            </div>
          </div>
          <div className="collab-stat-item">
            <div className="stat-icon messages">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.unreadMessages}</span>
              <span className="stat-label">Tin nhắn chưa đọc</span>
            </div>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="collab-menu">
          {menuItems.map((item, index) => (
            <Link to={item.link} key={index} className="collab-menu-card">
              <div className="menu-card-icon" style={{ background: `${item.color}15`, color: item.color }}>
                {item.icon}
              </div>
              <div className="menu-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              {item.badge > 0 && (
                <div className="menu-card-badge" style={{ background: item.color }}>
                  {item.badge}
                </div>
              )}
              <div className="menu-card-arrow">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="collab-tips">
          <h3>💡 Mẹo nhanh</h3>
          <ul>
            <li>Kiểm tra đơn hàng mới thường xuyên để xử lý kịp thời</li>
            <li>Phản hồi đánh giá sẽ giúp khách hàng cảm thấy được quan tâm</li>
            <li>Trả lời tin nhắn nhanh chóng để tăng trải nghiệm khách hàng</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default CollaboratorDashboard;
