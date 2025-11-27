import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.name || 'Người dùng'}</h1>
            <p className="profile-email">{user.email}</p>
            <span className={`profile-role ${user.role}`}>
              {user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
            </span>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Thông tin cá nhân
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
            </svg>
            Đơn hàng của tôi
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Bảo mật
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {activeTab === 'info' && (
            <div className="tab-panel">
              <h2>Thông tin cá nhân</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Họ và tên</label>
                  <div className="info-value">{user.name || 'Chưa cập nhật'}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-item">
                  <label>Số điện thoại</label>
                  <div className="info-value">{user.phone || 'Chưa cập nhật'}</div>
                </div>
                <div className="info-item">
                  <label>Địa chỉ</label>
                  <div className="info-value">{user.address || 'Chưa cập nhật'}</div>
                </div>
              </div>
              <div className="profile-actions">
                <button className="btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="tab-panel">
              <h2>Đơn hàng của tôi</h2>
              <div className="orders-redirect">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                </svg>
                <p>Xem và quản lý đơn hàng của bạn</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/orders')}
                >
                  Xem đơn hàng
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-panel">
              <h2>Bảo mật tài khoản</h2>
              <div className="security-section">
                <div className="security-item">
                  <div className="security-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div className="security-info">
                    <h3>Mật khẩu</h3>
                    <p>Thay đổi mật khẩu để bảo vệ tài khoản</p>
                  </div>
                  <button className="btn-secondary">Đổi mật khẩu</button>
                </div>
                
                <div className="security-item">
                  <div className="security-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <div className="security-info">
                    <h3>Xác thực hai yếu tố</h3>
                    <p>Tăng cường bảo mật cho tài khoản</p>
                  </div>
                  <button className="btn-secondary" disabled>Sắp ra mắt</button>
                </div>

                <div className="security-item danger">
                  <div className="security-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                  </div>
                  <div className="security-info">
                    <h3>Đăng xuất</h3>
                    <p>Đăng xuất khỏi tài khoản trên thiết bị này</p>
                  </div>
                  <button className="btn-danger" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
