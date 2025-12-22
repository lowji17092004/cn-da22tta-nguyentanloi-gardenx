import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfileNew.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coupons, setCoupons] = useState([]);
  
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
    if (activeTab === 'coupons') {
      loadCoupons();
    }
  }, [user, activeTab]);

  const loadCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/coupons', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(response.data.filter(c => c.isActive));
    } catch (err) {
      console.error('Lỗi tải mã giảm giá:', err);
    }
  };

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

      const response = await axios.put('/api/profile/me', {
        ...formData,
        avatar: avatarUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      updateUser(response.data);
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
      setMessage({ type: 'error', text: 'Mật khẩu mới không khớp' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
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
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu' 
      });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div>
            <div className="profile-content-header">
              <h2 className="profile-content-title">Thông tin cá nhân</h2>
              <p className="profile-content-subtitle">Quản lý thông tin cá nhân của bạn</p>
            </div>

            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.type === 'success' ? '✓' : '✕'} {message.text}
              </div>
            )}

            {isEditing && (
              <div className="profile-avatar-upload">
                <div className="profile-avatar-preview">
                  {avatarPreview || user?.avatar ? (
                    <img src={avatarPreview || user.avatar} alt="Avatar" />
                  ) : (
                    <div className="profile-avatar-fallback">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="profile-avatar-upload-info">
                  <h4>Ảnh đại diện</h4>
                  <p>Chọn ảnh JPG, PNG hoặc GIF có kích thước tối đa 5MB</p>
                  <label className="btn-upload-avatar">
                    Chọn ảnh
                    <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display: 'none'}} />
                  </label>
                </div>
              </div>
            )}

            <form className="profile-form" onSubmit={handleUpdateProfile}>
              <div className="profile-form-group">
                <label className="profile-form-label">Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  className="profile-form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="profile-form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  className="profile-form-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  className="profile-form-input"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="profile-form-actions">
                {isEditing ? (
                  <>
                    <button type="submit" className="btn-save-profile" disabled={loading}>
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                    <button 
                      type="button" 
                      className="btn-cancel-edit" 
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || ''
                        });
                      }}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-save-profile" onClick={() => setIsEditing(true)}>
                    Chỉnh sửa thông tin
                  </button>
                )}
              </div>
            </form>
          </div>
        );

      case 'password':
        return (
          <div>
            <div className="profile-content-header">
              <h2 className="profile-content-title">Đổi mật khẩu</h2>
              <p className="profile-content-subtitle">Cập nhật mật khẩu để bảo vệ tài khoản</p>
            </div>

            {message.text && (
              <div className={`profile-message ${message.type}`}>
                {message.type === 'success' ? '✓' : '✕'} {message.text}
              </div>
            )}

            <form className="profile-form" onSubmit={handleChangePassword}>
              <div className="profile-form-group">
                <label className="profile-form-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="currentPassword"
                  className="profile-form-input"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Mật khẩu mới</label>
                <input
                  type="password"
                  name="newPassword"
                  className="profile-form-input"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="profile-form-input"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <div className="profile-form-actions">
                <button type="submit" className="btn-save-profile" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'coupons':
        return (
          <div>
            <div className="profile-content-header">
              <h2 className="profile-content-title">Mã giảm giá</h2>
              <p className="profile-content-subtitle">Các mã giảm giá hiện có</p>
            </div>

            {coupons.length === 0 ? (
              <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
                <p>Chưa có mã giảm giá nào</p>
              </div>
            ) : (
              <div className="coupons-grid">
                {coupons.map(coupon => (
                  <div key={coupon._id} className="coupon-card">
                    <div className="coupon-code">{coupon.code}</div>
                    <div className="coupon-desc">{coupon.description}</div>
                    <div className="coupon-discount">-{coupon.discount}%</div>
                    {coupon.expiryDate && (
                      <div className="coupon-expiry">
                        Hết hạn: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-user-card">
            <div className="profile-avatar-wrapper">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="profile-avatar-fallback">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <h3 className="profile-user-name">{user.name}</h3>
            <p className="profile-user-email">{user.email}</p>
          </div>

          <ul className="profile-menu">
            <li className="profile-menu-item">
              <button
                className={`profile-menu-btn ${activeTab === 'info' ? 'active' : ''}`}
                onClick={() => setActiveTab('info')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin cá nhân
              </button>
            </li>
            <li className="profile-menu-item">
              <button
                className={`profile-menu-btn ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Đổi mật khẩu
              </button>
            </li>
            <li className="profile-menu-item">
              <button
                className={`profile-menu-btn ${activeTab === 'coupons' ? 'active' : ''}`}
                onClick={() => setActiveTab('coupons')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Mã giảm giá
              </button>
            </li>
            <li className="profile-menu-item">
              <button className="profile-menu-btn logout" onClick={handleLogout}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Profile;
