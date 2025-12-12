import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Kích thước ảnh không được vượt quá 5MB' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      
      // Upload avatar if changed
      let avatarUrl = user.avatar;
      if (avatarFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', avatarFile);
        
        const uploadRes = await axios.post('/api/upload', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        avatarUrl = uploadRes.data.path;
      }

      // Update profile
      const response = await axios.put('/api/profile/me', {
        ...formData,
        avatar: avatarUrl
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      updateUser(response.data.user);
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp!' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu phải có ít nhất 6 ký tự!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu' 
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setMessage({ type: '', text: '' });
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
          <div className="profile-header-overlay"></div>
          <div className="profile-avatar">
            {isEditing ? (
              <div className="avatar-upload">
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-input" className="avatar-circle clickable">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" />
                  ) : user.avatar ? (
                    <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="Avatar" />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                  <div className="avatar-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p>Thay đổi</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="avatar-circle">
                {user.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="Avatar" />
                ) : (
                  <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
              </div>
            )}
          </div>
          <div className="profile-info">
            <div className="profile-name-wrapper">
              <h1>{user.name || 'Người dùng'}</h1>
              <span className={`profile-badge ${user.role}`}>
                {user.role === 'admin' ? '👑 Quản trị viên' : user.role === 'collaborator' ? '🤝 Cộng tác viên' : '🌸 Khách hàng'}
              </span>
            </div>
            <p className="profile-email">✉️ {user.email}</p>
            <p className="profile-joined">📅 Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Account Stats */}
        <div className="account-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">Thành viên từ</span>
              <span className="stat-value">
                {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">Thời gian thành viên</span>
              <span className="stat-value">
                {(() => {
                  const days = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
                  if (days < 30) return `${days} ngày`;
                  if (days < 365) return `${Math.floor(days / 30)} tháng`;
                  return `${Math.floor(days / 365)} năm`;
                })()}
              </span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="stat-details">
              <span className="stat-label">Trạng thái tài khoản</span>
              <span className={`stat-value status ${user.isLocked ? 'locked' : 'active'}`}>
                {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
              </span>
            </div>
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
              
              {message.text && (
                <div className={`message ${message.type}`}>
                  {message.type === 'success' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Họ và tên *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Nhập email"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="phone">Số điện thoại</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label htmlFor="address">Địa chỉ</label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                            <polyline points="17 21 17 13 7 13 7 21"/>
                            <polyline points="7 3 7 8 15 8"/>
                          </svg>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                    <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={loading}>
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="info-table-wrapper">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td className="info-label">Họ và tên</td>
                          <td className="info-value">{user.name || 'Chưa cập nhật'}</td>
                        </tr>
                        <tr>
                          <td className="info-label">Email</td>
                          <td className="info-value">{user.email}</td>
                        </tr>
                        <tr>
                          <td className="info-label">Số điện thoại</td>
                          <td className="info-value">{user.phone || 'Chưa cập nhật'}</td>
                        </tr>
                        <tr>
                          <td className="info-label">Địa chỉ</td>
                          <td className="info-value">{user.address || 'Chưa cập nhật'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="profile-actions">
                    <button className="btn-primary" onClick={() => setIsEditing(true)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Chỉnh sửa thông tin
                    </button>
                  </div>
                </>
              )}
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
              
              {message.text && activeTab === 'security' && (
                <div className={`message ${message.type}`}>
                  {message.type === 'success' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  )}
                  <span>{message.text}</span>
                </div>
              )}

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
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setIsChangingPassword(!isChangingPassword);
                      setMessage({ type: '', text: '' });
                    }}
                  >
                    {isChangingPassword ? 'Hủy' : 'Đổi mật khẩu'}
                  </button>
                </div>

                {isChangingPassword && (
                  <form onSubmit={handleChangePassword} className="password-form">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Mật khẩu hiện tại *</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="newPassword">Mật khẩu mới *</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength="6"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Xác nhận mật khẩu mới *</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                    
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="btn-spinner"></div>
                          Đang xử lý...
                        </>
                      ) : (
                        'Cập nhật mật khẩu'
                      )}
                    </button>
                  </form>
                )}
                
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
