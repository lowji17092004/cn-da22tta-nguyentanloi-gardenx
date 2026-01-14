import React, { useState, useEffect } from 'react';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import Toast from '../components/Toast';
import './AdminCoupons.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Assign coupon states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningCoupon, setAssigningCoupon] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount: '',
    minOrder: '',
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    quantity: '',
    active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (err) {
      setToast({ type: 'error', message: 'Không thể tải danh sách mã giảm giá' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discount || !formData.validTo) {
      setToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData);
        setToast({ type: 'success', message: 'Cập nhật mã giảm giá thành công' });
      } else {
        await api.post('/coupons', formData);
        setToast({ type: 'success', message: 'Tạo mã giảm giá thành công' });
      }
      
      fetchCoupons();
      closeModal();
    } catch (err) {
      setToast({ 
        type: 'error', 
        message: err.response?.data?.message || 'Có lỗi xảy ra' 
      });
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount: coupon.discount,
      minOrder: coupon.minOrder || '',
      maxDiscount: coupon.maxDiscount || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().slice(0, 16) : '',
      validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().slice(0, 16) : '',
      usageLimit: coupon.usageLimit || '',
      quantity: coupon.quantity || '',
      active: coupon.active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
    
    try {
      await api.delete(`/coupons/${id}`);
      setToast({ type: 'success', message: 'Đã xóa mã giảm giá' });
      fetchCoupons();
    } catch (err) {
      setToast({ type: 'error', message: 'Không thể xóa mã giảm giá' });
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/coupons/${id}/toggle`);
      fetchCoupons();
      setToast({ type: 'success', message: 'Đã cập nhật trạng thái' });
    } catch (err) {
      setToast({ type: 'error', message: 'Không thể cập nhật trạng thái' });
    }
  };

  // Fetch users for assign modal
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const normalUsers = res.data.filter(u => u.role !== 'admin');
      setUsers(normalUsers);
    } catch (err) {
      setToast({ type: 'error', message: 'Không thể tải danh sách người dùng' });
    }
  };

  const openAssignModal = (coupon) => {
    setAssigningCoupon(coupon);
    setSelectedUsers([]);
    setUserSearchTerm('');
    fetchUsers();
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setAssigningCoupon(null);
    setSelectedUsers([]);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter(user => 
    userSearchTerm === '' ||
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleAssignCoupon = async () => {
    if (selectedUsers.length === 0) {
      setToast({ type: 'warning', message: 'Vui lòng chọn ít nhất một người dùng' });
      return;
    }

    setAssignLoading(true);
    try {
      const res = await api.post('/coupons/assign', {
        couponId: assigningCoupon._id,
        userIds: selectedUsers
      });
      
      setToast({ type: 'success', message: res.data.message || `Đã gán mã cho ${selectedUsers.length} người dùng` });
      closeAssignModal();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Không thể gán mã giảm giá' });
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignToAll = async () => {
    if (!window.confirm(`Bạn có chắc muốn gán mã "${assigningCoupon.code}" cho TẤT CẢ người dùng?`)) return;

    setAssignLoading(true);
    try {
      const res = await api.post('/coupons/assign-all', { couponId: assigningCoupon._id });
      setToast({ type: 'success', message: res.data.message || 'Đã gán mã cho tất cả người dùng' });
      closeAssignModal();
    } catch (err) {
      setToast({ type: 'error', message: err.response?.data?.message || 'Không thể gán mã giảm giá' });
    } finally {
      setAssignLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      description: '',
      discount: '',
      minOrder: '',
      maxDiscount: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      quantity: '',
      active: true
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + '₫';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isExpired = (validTo) => new Date(validTo) < new Date();
  const isNotYetValid = (validFrom) => validFrom && new Date(validFrom) > new Date();

  const getStatus = (coupon) => {
    if (isExpired(coupon.validTo)) return { label: 'Hết hạn', class: 'expired' };
    if (isNotYetValid(coupon.validFrom)) return { label: 'Sắp tới', class: 'upcoming' };
    if (!coupon.active) return { label: 'Tạm dừng', class: 'inactive' };
    return { label: 'Hoạt động', class: 'active' };
  };

  // Filter coupons
  const filteredCoupons = coupons.filter(coupon => {
    const matchSearch = searchTerm === '' || 
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchStatus = true;
    if (statusFilter === 'active') matchStatus = coupon.active && !isExpired(coupon.validTo);
    else if (statusFilter === 'expired') matchStatus = isExpired(coupon.validTo);
    else if (statusFilter === 'inactive') matchStatus = !coupon.active;
    
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="ac-loading">
          <div className="ac-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="ac-page">
        {/* Header */}
        <div className="ac-header">
          <div className="ac-title">
            <span className="ac-icon">🎫</span>
            <div>
              <h1>Quản lý mã giảm giá</h1>
              <p>Tạo và quản lý các mã khuyến mãi</p>
            </div>
          </div>
          <button className="ac-btn-create" onClick={() => setShowModal(true)}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tạo mã mới
          </button>
        </div>

        {/* Stats */}
        <div className="ac-stats">
          <div className={`ac-stat ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
            <div className="ac-stat-icon total">📊</div>
            <div className="ac-stat-info">
              <span className="ac-stat-value">{coupons.length}</span>
              <span className="ac-stat-label">Tổng số</span>
            </div>
          </div>
          <div className={`ac-stat ${statusFilter === 'active' ? 'active' : ''}`} onClick={() => setStatusFilter('active')}>
            <div className="ac-stat-icon success">✅</div>
            <div className="ac-stat-info">
              <span className="ac-stat-value">{coupons.filter(c => c.active && !isExpired(c.validTo)).length}</span>
              <span className="ac-stat-label">Hoạt động</span>
            </div>
          </div>
          <div className={`ac-stat ${statusFilter === 'expired' ? 'active' : ''}`} onClick={() => setStatusFilter('expired')}>
            <div className="ac-stat-icon warning">⏰</div>
            <div className="ac-stat-info">
              <span className="ac-stat-value">{coupons.filter(c => isExpired(c.validTo)).length}</span>
              <span className="ac-stat-label">Hết hạn</span>
            </div>
          </div>
          <div className={`ac-stat ${statusFilter === 'inactive' ? 'active' : ''}`} onClick={() => setStatusFilter('inactive')}>
            <div className="ac-stat-icon danger">🚫</div>
            <div className="ac-stat-info">
              <span className="ac-stat-value">{coupons.filter(c => !c.active).length}</span>
              <span className="ac-stat-label">Tạm dừng</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="ac-search-bar">
          <div className="ac-search">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm mã giảm giá..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="ac-search-clear" onClick={() => setSearchTerm('')}>×</button>
            )}
          </div>
          {(searchTerm || statusFilter !== 'all') && (
            <span className="ac-result-count">
              Hiển thị {filteredCoupons.length} / {coupons.length} mã
            </span>
          )}
        </div>

        {/* Table */}
        <div className="ac-table-wrapper">
          {filteredCoupons.length === 0 ? (
            <div className="ac-empty">
              <span className="ac-empty-icon">🎫</span>
              <h3>{coupons.length === 0 ? 'Chưa có mã giảm giá nào' : 'Không tìm thấy mã giảm giá'}</h3>
              <p>{coupons.length === 0 ? 'Tạo mã giảm giá đầu tiên để khuyến mãi cho khách hàng' : 'Thử thay đổi từ khóa tìm kiếm'}</p>
              {coupons.length === 0 && (
                <button className="ac-btn-create-first" onClick={() => setShowModal(true)}>Tạo mã ngay</button>
              )}
            </div>
          ) : (
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Mã giảm giá</th>
                  <th>Giảm giá</th>
                  <th>Điều kiện</th>
                  <th>Số lượng</th>
                  <th>Thời hạn</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.map(coupon => {
                  const status = getStatus(coupon);
                  return (
                    <tr key={coupon._id} className={status.class === 'expired' ? 'row-expired' : ''}>
                      <td>
                        <div className="ac-code-cell">
                          <strong className="ac-code">{coupon.code}</strong>
                          {coupon.description && <span className="ac-desc">{coupon.description}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="ac-discount-cell">
                          <span className="ac-discount">-{coupon.discount}%</span>
                          {coupon.maxDiscount > 0 && <small>Tối đa {formatPrice(coupon.maxDiscount)}</small>}
                        </div>
                      </td>
                      <td>
                        <div className="ac-condition-cell">
                          {coupon.minOrder > 0 ? (
                            <span>Đơn từ {formatPrice(coupon.minOrder)}</span>
                          ) : (
                            <span className="ac-no-condition">Không giới hạn</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ac-quantity-cell">
                          <span>Còn: <strong>{coupon.quantity || 0}</strong></span>
                          <small>Đã dùng: {coupon.usedCount || 0}</small>
                        </div>
                      </td>
                      <td>
                        <div className="ac-date-cell">
                          <span>{formatDate(coupon.validTo)}</span>
                          {coupon.validFrom && <small>Từ {formatDate(coupon.validFrom)}</small>}
                        </div>
                      </td>
                      <td>
                        <span className={`ac-status ${status.class}`}>{status.label}</span>
                      </td>
                      <td>
                        <div className="ac-actions">
                          <button className="ac-btn ac-btn-assign" onClick={() => openAssignModal(coupon)} title="Gán cho người dùng">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                              <circle cx="9" cy="7" r="4"/>
                              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                            </svg>
                          </button>
                          <button className="ac-btn ac-btn-edit" onClick={() => handleEdit(coupon)} title="Sửa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            className={`ac-btn ac-btn-toggle ${coupon.active ? 'on' : 'off'}`}
                            onClick={() => handleToggleActive(coupon._id)}
                            title={coupon.active ? 'Tắt' : 'Bật'}
                          >
                            {coupon.active ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                              </svg>
                            )}
                          </button>
                          <button className="ac-btn ac-btn-delete" onClick={() => handleDelete(coupon._id)} title="Xóa">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="ac-modal-overlay" onClick={closeModal}>
            <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h2>{editingCoupon ? '✏️ Sửa mã giảm giá' : '🎫 Tạo mã giảm giá mới'}</h2>
                <button className="ac-modal-close" onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="ac-form">
                <div className="ac-form-row">
                  <div className="ac-form-group">
                    <label>Mã giảm giá <span className="required">*</span></label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="VD: SUMMER2024"
                      disabled={editingCoupon}
                      required
                    />
                  </div>
                  <div className="ac-form-group">
                    <label>Phần trăm giảm <span className="required">*</span></label>
                    <div className="ac-input-unit">
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                        placeholder="10"
                        min="1"
                        max="100"
                        required
                      />
                      <span>%</span>
                    </div>
                  </div>
                </div>

                <div className="ac-form-group">
                  <label>Mô tả</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="VD: Giảm giá mùa hè cho khách hàng thân thiết"
                  />
                </div>

                <div className="ac-form-row">
                  <div className="ac-form-group">
                    <label>Đơn tối thiểu</label>
                    <div className="ac-input-unit">
                      <input
                        type="number"
                        value={formData.minOrder}
                        onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                      <span>₫</span>
                    </div>
                  </div>
                  <div className="ac-form-group">
                    <label>Giảm tối đa</label>
                    <div className="ac-input-unit">
                      <input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="Không giới hạn"
                        min="0"
                      />
                      <span>₫</span>
                    </div>
                  </div>
                </div>

                <div className="ac-form-row">
                  <div className="ac-form-group">
                    <label>Bắt đầu</label>
                    <input
                      type="datetime-local"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    />
                  </div>
                  <div className="ac-form-group">
                    <label>Hết hạn <span className="required">*</span></label>
                    <input
                      type="datetime-local"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="ac-form-row">
                  <div className="ac-form-group">
                    <label>Số lượng mã</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="100"
                      min="1"
                    />
                  </div>
                  <div className="ac-form-group">
                    <label>Giới hạn sử dụng</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                      placeholder="Không giới hạn"
                      min="0"
                    />
                  </div>
                </div>

                <div className="ac-form-group">
                  <label className="ac-toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <span className="ac-toggle-slider"></span>
                    <span>{formData.active ? 'Đang kích hoạt' : 'Tạm dừng'}</span>
                  </label>
                </div>

                <div className="ac-form-actions">
                  <button type="button" className="ac-btn-cancel" onClick={closeModal}>Hủy</button>
                  <button type="submit" className="ac-btn-submit">
                    {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Modal */}
        {showAssignModal && assigningCoupon && (
          <div className="ac-modal-overlay" onClick={closeAssignModal}>
            <div className="ac-modal ac-assign-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ac-modal-header">
                <div>
                  <h2>🎁 Gán mã giảm giá</h2>
                  <p>Mã: <strong>{assigningCoupon.code}</strong> (-{assigningCoupon.discount}%)</p>
                </div>
                <button className="ac-modal-close" onClick={closeAssignModal}>×</button>
              </div>

              <div className="ac-assign-body">
                <div className="ac-assign-search">
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                </div>

                <div className="ac-assign-info">
                  <span>Đã chọn: <strong>{selectedUsers.length}</strong></span>
                  <span>Tổng: {filteredUsers.length} người dùng</span>
                </div>

                <div className="ac-users-list">
                  {filteredUsers.length === 0 ? (
                    <div className="ac-no-users">Không tìm thấy người dùng</div>
                  ) : (
                    filteredUsers.map(user => (
                      <div 
                        key={user._id} 
                        className={`ac-user-item ${selectedUsers.includes(user._id) ? 'selected' : ''}`}
                        onClick={() => toggleUserSelection(user._id)}
                      >
                        <div className="ac-user-checkbox">
                          {selectedUsers.includes(user._id) ? '✓' : ''}
                        </div>
                        <div className="ac-user-avatar">
                          {user.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="ac-user-info">
                          <span className="ac-user-name">{user.name || 'Không có tên'}</span>
                          <span className="ac-user-email">{user.email}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="ac-assign-footer">
                <button className="ac-btn-assign-all" onClick={handleAssignToAll} disabled={assignLoading}>
                  Gán tất cả
                </button>
                <div className="ac-assign-actions">
                  <button className="ac-btn-cancel" onClick={closeAssignModal}>Hủy</button>
                  <button 
                    className="ac-btn-submit" 
                    onClick={handleAssignCoupon}
                    disabled={assignLoading || selectedUsers.length === 0}
                  >
                    {assignLoading ? 'Đang gán...' : `Gán cho ${selectedUsers.length} người`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
