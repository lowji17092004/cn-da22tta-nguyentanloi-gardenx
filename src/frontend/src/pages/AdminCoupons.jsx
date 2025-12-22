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
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
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
    category: '',
    active: true
  });

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Lấy danh mục blog type và tìm danh mục Khuyến mãi
      const res = await api.get('/categories?type=blog');
      const allCategories = res.data || [];
      // Tìm danh mục "Khuyến mãi" hoặc "khuyen-mai"
      const promoCategory = allCategories.find(cat => 
        cat.slug === 'khuyen-mai' || 
        cat.name.toLowerCase().includes('khuyến mãi') ||
        cat.name.toLowerCase().includes('khuyen mai')
      );
      if (promoCategory) {
        // Nếu có subcategories, dùng nó làm categories
        if (promoCategory.subcategories && promoCategory.subcategories.length > 0) {
          setCategories(promoCategory.subcategories);
        } else {
          // Nếu không có subcategories, dùng chính nó
          setCategories([promoCategory]);
        }
      } else {
        // Fallback: lấy tất cả categories
        setCategories(allCategories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, category: categoryId, subcategory: '' });
    
    // Find category and load subcategories
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    if (selectedCategory && selectedCategory.subcategories) {
      setSubcategories(selectedCategory.subcategories || []);
    } else {
      setSubcategories([]);
    }
  };

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
      category: coupon.category || '',
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
    } catch (err) {
      setToast({ type: 'error', message: 'Không thể cập nhật trạng thái' });
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
      category: '',
      active: true
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price || 0) + '₫';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (validTo) => {
    return new Date(validTo) < new Date();
  };

  const isNotYetValid = (validFrom) => {
    return new Date(validFrom) > new Date();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-coupons-loading">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-coupons-page">
        {/* Header */}
        <div className="ac-hero">
          <div className="ac-hero-content">
            <div className="ac-hero-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h1>🎫 Quản lý mã giảm giá</h1>
              <p>Tạo và quản lý các mã giảm giá cho khách hàng</p>
            </div>
          </div>
          <button className="btn-create-coupon" onClick={() => setShowModal(true)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tạo mã mới
          </button>
        </div>

        {/* Stats */}
        <div className="ac-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{coupons.length}</h3>
              <p>Tổng số mã</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{coupons.filter(c => c.active && !isExpired(c.validTo)).length}</h3>
              <p>Đang hoạt động</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{coupons.filter(c => isExpired(c.validTo)).length}</h3>
              <p>Đã hết hạn</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3>{coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)}</h3>
              <p>Lượt sử dụng</p>
            </div>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="coupons-table-wrapper">
          {coupons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎫</div>
              <h3>Chưa có mã giảm giá nào</h3>
              <p>Tạo mã giảm giá đầu tiên để khuyến mãi cho khách hàng</p>
              <button className="btn-create-first" onClick={() => setShowModal(true)}>
                Tạo mã ngay
              </button>
            </div>
          ) : (
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Mã giảm giá</th>
                  <th>Mô tả</th>
                  <th>Giảm giá</th>
                  <th>Số lượng</th>
                  <th>Danh mục</th>
                  <th>Hạn dùng</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr 
                    key={coupon._id} 
                    className={`${!coupon.active ? 'inactive' : ''} ${isExpired(coupon.validTo) ? 'expired' : ''}`}
                  >
                    <td>
                      <div className="code-cell">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <strong>{coupon.code}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="description-cell">
                        {coupon.description || <span className="no-data">—</span>}
                      </div>
                    </td>
                    <td>
                      <div className="discount-cell">
                        <strong>{coupon.discount}%</strong>
                        {coupon.maxDiscount && (
                          <small>Tối đa {formatPrice(coupon.maxDiscount)}</small>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="quantity-cell">
                        <div>Tồn: <strong>{coupon.quantity || 0}</strong></div>
                        <small>Dùng: {coupon.usedCount || 0}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</small>
                      </div>
                    </td>
                    <td>
                      <div className="category-cell">
                        {coupon.category ? (
                          <div className="category-main">{coupon.category}</div>
                        ) : (
                          <span className="no-data">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        {formatDate(coupon.validTo)}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        {isExpired(coupon.validTo) ? (
                          <span className="status-badge expired">Hết hạn</span>
                        ) : isNotYetValid(coupon.validFrom) ? (
                          <span className="status-badge upcoming">Sắp tới</span>
                        ) : coupon.active ? (
                          <span className="status-badge active">Hoạt động</span>
                        ) : (
                          <span className="status-badge inactive">Tạm dừng</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-action btn-edit" onClick={() => handleEdit(coupon)} title="Sửa">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className={`btn-action btn-toggle ${coupon.active ? 'active' : ''}`}
                          onClick={() => handleToggleActive(coupon._id)}
                          title={coupon.active ? 'Tắt' : 'Bật'}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button className="btn-action btn-delete" onClick={() => handleDelete(coupon._id)} title="Xóa">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingCoupon ? 'Sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
                <button className="btn-close" onClick={closeModal}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="coupon-form-pro">
                {/* Basic Info */}
                <div className="form-section-pro">
                  <div className="section-header-pro">
                    <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3>Thông tin cơ bản</h3>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group-pro">
                      <label>Mã giảm giá <span className="req">*</span></label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="VD: SUMMER2024"
                        disabled={editingCoupon}
                        required
                      />
                      <small>Mã viết hoa, không dấu</small>
                    </div>
                    <div className="form-group-pro">
                      <label>Phần trăm giảm <span className="req">*</span></label>
                      <div className="input-unit-wrapper">
                        <input
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          placeholder="10"
                          min="0"
                          max="100"
                          required
                        />
                        <span className="unit">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group-pro">
                    <label>Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="VD: Giảm giá mùa hè cho khách hàng thân thiết"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="form-section-pro">
                  <div className="section-header-pro">
                    <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <h3>Phân loại</h3>
                  </div>
                  
                  <div className="form-group-pro">
                    <label>Danh mục</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conditions */}
                <div className="form-section-pro">
                  <div className="section-header-pro">
                    <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3>Điều kiện áp dụng</h3>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group-pro">
                      <label>Đơn hàng tối thiểu</label>
                      <div className="input-unit-wrapper">
                        <input
                          type="number"
                          value={formData.minOrder}
                          onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                          placeholder="0"
                          min="0"
                        />
                        <span className="unit">₫</span>
                      </div>
                      <small>Để trống = áp dụng mọi đơn</small>
                    </div>
                    <div className="form-group-pro">
                      <label>Giảm tối đa</label>
                      <div className="input-unit-wrapper">
                        <input
                          type="number"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                          placeholder="Không giới hạn"
                          min="0"
                        />
                        <span className="unit">₫</span>
                      </div>
                      <small>Để trống = không giới hạn</small>
                    </div>
                  </div>
                </div>

                {/* Time & Quantity */}
                <div className="form-section-pro">
                  <div className="section-header-pro">
                    <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3>Thời gian & Số lượng</h3>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group-pro">
                      <label>Có hiệu lực từ</label>
                      <input
                        type="datetime-local"
                        value={formData.validFrom}
                        onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      />
                      <small>Để trống = ngay lập tức</small>
                    </div>
                    <div className="form-group-pro">
                      <label>Hết hạn <span className="req">*</span></label>
                      <input
                        type="datetime-local"
                        value={formData.validTo}
                        onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group-pro">
                      <label>Số lượng mã <span className="req">*</span></label>
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="100"
                        min="1"
                        required
                      />
                      <small>Số lượng mã có sẵn</small>
                    </div>
                    <div className="form-group-pro">
                      <label>Giới hạn sử dụng</label>
                      <input
                        type="number"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        placeholder="Không giới hạn"
                        min="0"
                      />
                      <small>Số lần tối đa 1 mã được dùng</small>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="form-section-pro">
                  <div className="section-header-pro">
                    <svg className="section-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3>Trạng thái</h3>
                  </div>
                  
                  <div className="form-group-pro">
                    <label className="toggle-label">
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="toggle-checkbox"
                      />
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">{formData.active ? 'Đang kích hoạt' : 'Tạm dừng'}</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="form-actions-pro">
                  <button type="button" className="btn-cancel-pro" onClick={closeModal}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Hủy
                  </button>
                  <button type="submit" className="btn-submit-pro">
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {editingCoupon ? 'Cập nhật' : 'Tạo mã'}
                  </button>
                </div>
              </form>
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
