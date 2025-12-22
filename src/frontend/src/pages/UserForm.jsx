import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import './AdminUsers.css'

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      const loadUser = async () => {
        try {
          const res = await api.get(`/users/${id}`)
          setUserData(res.data)
          setFormData({
            role: res.data.role
          })
        } catch (e) {
          setError('Không thể tải thông tin người dùng')
        }
      }
      loadUser()
    }
  }, [id, isNew])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isNew) {
        await api.post('/users', formData)
      } else {
        // Only send role for edit
        await api.put(`/users/${id}`, { role: formData.role })
      }
      navigate('/admin/users')
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi lưu người dùng')
    }
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">
            {isNew ? '✨ Tạo người dùng mới' : '🔑 Thay đổi quyền người dùng'}
          </h1>
          <p className="admin-page-desc">
            {isNew ? 'Thêm người dùng mới vào hệ thống' : 'Chỉ có thể thay đổi vai trò (role) của người dùng'}
          </p>
        </div>
        <Link to="/admin/users">
          <button className="btn btn-secondary">← Quay lại</button>
        </Link>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          {error && (
            <div className="alert alert-error">
              ⚠️ {error}
            </div>
          )}

          {!isNew && userData && (
            <div className="user-info-display">
              <h3>Thông tin người dùng</h3>
              <div className="info-row">
                <span className="info-label">Tên:</span>
                <span className="info-value">{userData.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{userData.email}</span>
              </div>
              {userData.phoneNumber && (
                <div className="info-row">
                  <span className="info-label">Số điện thoại:</span>
                  <span className="info-value">{userData.phoneNumber}</span>
                </div>
              )}
              <p className="info-note">
                ℹ️ Người dùng có thể tự cập nhật thông tin cá nhân của họ. Admin chỉ có thể thay đổi quyền.
              </p>
            </div>
          )}

          {isNew && (
            <>
              <div className="form-group">
                <label htmlFor="name">Tên người dùng *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên người dùng"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Nhập mật khẩu"
                />
                <small className="form-hint">Tối thiểu 6 ký tự</small>
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="role">Vai trò *</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="user">👤 User (Người dùng)</option>
              <option value="collaborator">💼 Nhân viên</option>
              <option value="admin">👑 Admin (Quản trị viên)</option>
            </select>
            <small className="form-hint">
              • User: Khách hàng thông thường<br/>
              • Nhân viên: Duyệt đơn, phản hồi đánh giá, trả lời tin nhắn<br/>
              • Admin: Toàn quyền quản trị
            </small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Đang lưu...' : isNew ? '✨ Tạo người dùng' : '💾 Lưu thay đổi'}
            </button>
            <Link to="/admin/users">
              <button type="button" className="btn btn-secondary">
                Hủy
              </button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
