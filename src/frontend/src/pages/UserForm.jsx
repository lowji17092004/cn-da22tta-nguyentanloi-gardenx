import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import AdminLayout from '../components/AdminLayout'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      const loadUser = async () => {
        try {
          const res = await api.get(`/users/${id}`)
          setFormData({
            name: res.data.name,
            email: res.data.email,
            password: '',
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
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password
        }
        await api.put(`/users/${id}`, updateData)
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
            {isNew ? '✨ Tạo người dùng mới' : '✏️ Chỉnh sửa người dùng'}
          </h1>
          <p className="admin-page-desc">
            {isNew ? 'Thêm người dùng mới vào hệ thống' : 'Cập nhật thông tin người dùng'}
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
            <label htmlFor="password">
              Mật khẩu {!isNew && '(Để trống nếu không đổi)'}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={isNew}
              placeholder={isNew ? 'Nhập mật khẩu' : 'Nhập mật khẩu mới (nếu muốn đổi)'}
            />
            {isNew && (
              <small className="form-hint">Tối thiểu 6 ký tự</small>
            )}
          </div>

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
              <option value="admin">👑 Admin (Quản trị viên)</option>
            </select>
            <small className="form-hint">
              Admin có quyền truy cập toàn bộ hệ thống
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
