import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
    color: '',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false
    }
  });

  const calculatePasswordStrength = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;
    
    let label = '';
    let color = '';
    
    if (score === 0 || password.length === 0) {
      label = '';
      color = '';
    } else if (score <= 2) {
      label = 'Yếu';
      color = '#ef4444';
    } else if (score === 3) {
      label = 'Trung bình';
      color = '#f59e0b';
    } else if (score === 4) {
      label = 'Mạnh';
      color = '#10b981';
    } else {
      label = 'Rất mạnh';
      color = '#166534';
    }

    return { score, label, color, requirements };
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      // Load user coupons
      loadUserCoupons();
    }
  }, [user]);

  const loadUserCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/coupons/my-coupons', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Error loading coupons:', err);
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
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    if (name === 'newPassword') {
      const strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
    }
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
      setPasswordStrength({
        score: 0,
        label: '',
        color: '',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false
        }
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
    <div className="profile-container-modern">
      {/* Profile Header - Compact */}
      <div className="profile-header-compact">
        <div className="profile-avatar-compact">
          {user.avatar ? (
            <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} alt="Avatar" />
          ) : (
            <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="profile-info-compact">
          <h1>{user.name || 'Người dùng'}</h1>
          <p>{user.email}</p>
          <span className={`profile-badge-compact ${user.role}`}>
            {user.role === 'admin' ? 'Quản trị viên' : user.role === 'collaborator' ? 'Nhân viên' : 'Khách hàng'}
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="profile-content-grid">
        {/* Left Column - Personal Info */}
        <div className="profile-column">
          <div className="profile-card-modern">
            <div className="card-header-modern">
              <h2>
                Thông tin cá nhân
              </h2>
            </div>
            
            {message.text && !isChangingPassword && (
              <div className={`message-modern ${message.type}`}>
                <span>{message.text}</span>
              </div>
            )}

            {!isEditing ? (
              <>
                <div className="profile-display">
                  <div className="display-item">
                    <label>Họ và tên</label>
                    <p>{user.name || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="display-item">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="display-item">
                    <label>Số điện thoại</label>
                    <p>{user.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div className="display-item">
                    <label>Địa chỉ</label>
                    <p>{user.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>
                <button className="btn-primary-modern" onClick={() => setIsEditing(true)}>
                  Chỉnh sửa thông tin
                </button>
              </>
            ) : (
              <form onSubmit={handleUpdateProfile} className="edit-form-modern">
                <div className="form-group-modern">
                  <label htmlFor="avatar">Ảnh đại diện</label>
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="file-input-modern"
                  />
                  {avatarPreview && (
                    <div className="avatar-preview">
                      <img src={avatarPreview} alt="Preview" />
                    </div>
                  )}
                </div>
                
                <div className="form-group-modern">
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
                
                <div className="form-group-modern">
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
                
                <div className="form-group-modern">
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
                
                <div className="form-group-modern">
                  <label htmlFor="address">Địa chỉ</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Nhập địa chỉ"
                  ></textarea>
                </div>
                
                <div className="form-actions-modern">
                  <button type="submit" className="btn-primary-modern" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Đang cập nhật...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </button>
                  <button type="button" className="btn-secondary-modern" onClick={cancelEdit}>
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Orders Section */}
          <div className="profile-card-modern">
            <div className="card-header-modern">
              <h2>
                Đơn hàng của tôi
              </h2>
            </div>
            <div className="quick-action">
              <p>Xem và quản lý tất cả đơn hàng của bạn</p>
              <button className="btn-primary-modern" onClick={() => navigate('/orders')}>
                Xem đơn hàng
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Security & Coupons */}
        <div className="profile-column">
          {/* Security Section */}
          <div className="profile-card-modern">
            <div className="card-header-modern">
              <h2>
                Bảo mật tài khoản
              </h2>
            </div>

            {message.text && isChangingPassword && (
              <div className={`message-modern ${message.type}`}>
                <span>{message.text}</span>
              </div>
            )}

            {!isChangingPassword ? (
              <div className="quick-action">
                <p>Thay đổi mật khẩu để bảo vệ tài khoản</p>
                <button 
                  className="btn-primary-modern"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setMessage({ type: '', text: '' });
                  }}
                >
                  Đổi mật khẩu
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="edit-form-modern">
                <div className="form-group-modern">
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
                
                <div className="form-group-modern">
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
                  
                  {passwordData.newPassword && (
                    <div className="password-strength-container">
                      <div className="strength-bar-wrapper">
                        <div 
                          className="strength-bar" 
                          style={{ 
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        ></div>
                      </div>
                      {passwordStrength.label && (
                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                          {passwordStrength.label}
                        </span>
                      )}
                      
                      <div className="password-requirements">
                        <p className="requirements-title">Yêu cầu mật khẩu:</p>
                        <ul className="requirements-list">
                          <li className={passwordStrength.requirements.length ? 'met' : ''}>
                            {passwordStrength.requirements.length ? '✓' : '○'} Ít nhất 8 ký tự
                          </li>
                          <li className={passwordStrength.requirements.uppercase ? 'met' : ''}>
                            {passwordStrength.requirements.uppercase ? '✓' : '○'} Chữ hoa (A-Z)
                          </li>
                          <li className={passwordStrength.requirements.lowercase ? 'met' : ''}>
                            {passwordStrength.requirements.lowercase ? '✓' : '○'} Chữ thường (a-z)
                          </li>
                          <li className={passwordStrength.requirements.number ? 'met' : ''}>
                            {passwordStrength.requirements.number ? '✓' : '○'} Số (0-9)
                          </li>
                          <li className={passwordStrength.requirements.special ? 'met' : ''}>
                            {passwordStrength.requirements.special ? '✓' : '○'} Ký tự đặc biệt (!@#$%...)
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="form-group-modern">
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
                
                <div className="form-actions-modern">
                  <button type="submit" className="btn-primary-modern" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      'Cập nhật mật khẩu'
                    )}
                  </button>
                  <button type="button" className="btn-secondary-modern" onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setMessage({ type: '', text: '' });
                  }}>
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Coupons Section */}
          <div className="profile-card-modern">
            <div className="card-header-modern">
              <h2>
                Mã khuyến mãi của tôi
              </h2>
            </div>
            
            <div className="coupons-list">
              {coupons.length > 0 ? (
                coupons.map((coupon, idx) => (
                  <div key={idx} className={`coupon-item ${coupon.used ? 'used' : 'available'}`}>
                    <div className="coupon-badge">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `${coupon.discountValue}K`}
                    </div>
                    <div className="coupon-info">
                      <h4>{coupon.title}</h4>
                      <p>{coupon.description}</p>
                      <div className="coupon-code-box">
                        <code>{coupon.code}</code>
                        {!coupon.used && (
                          <button 
                            className="copy-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(coupon.code);
                              alert('Đã sao chép mã!');
                            }}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                      <span className="coupon-expiry">
                        {coupon.used ? 'Đã sử dụng' : `HSD: ${new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-coupons">
                  <p>Bạn chưa có mã khuyến mãi nào. Hãy theo dõi để nhận ưu đãi!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
