import React, { useEffect, useState, useMemo } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null })

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchRole = !filterRole || user.role === filterRole
      return matchSearch && matchRole
    })
  }, [users, searchTerm, filterRole])

  const handleDelete = async (user) => {
    setDeleteModal({ show: true, user })
  }

  const confirmDelete = async () => {
    if (!deleteModal.user) return
    try {
      await api.delete(`/users/${deleteModal.user._id}`)
      load()
      setDeleteModal({ show: false, user: null })
    } catch (e) {
      alert('Xóa thất bại')
    }
  }

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <span className="role-badge admin">👑 Admin</span>
    ) : (
      <span className="role-badge user">👤 User</span>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">👥 Quản lý Người dùng</h1>
          <p className="admin-page-desc">Thêm, sửa, xóa và quản lý tài khoản người dùng</p>
        </div>
        <Link to="/admin/users/new">
          <button className="btn btn-primary">
            <span className="btn-icon">✨</span>
            <span>Thêm người dùng</span>
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải người dùng...</span>
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">👥</div>
          <h3>Chưa có người dùng nào</h3>
          <p>Hãy tạo người dùng đầu tiên</p>
          <Link to="/admin/users/new">
            <button className="btn btn-primary">
              <span className="btn-icon">✨</span>
              <span>Thêm người dùng</span>
            </button>
          </Link>
        </div>
      ) : (
        <>
          <div className="admin-filter-bar">
            <div className="filter-search">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
              />
            </div>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
              <option value="">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="admin-stats-row">
            <div className="admin-stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-label">Tổng người dùng</div>
                <div className="stat-value">{users.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <div className="stat-label">Admin</div>
                <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-content">
                <div className="stat-label">Khách hàng</div>
                <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
              </div>
            </div>
          </div>

          <div className="admin-results-info">
            <span>Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} người dùng</span>
          </div>

          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-name-cell">{user.name}</span>
                      </div>
                    </td>
                    <td className="user-email-cell">{user.email}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="role-badge admin">👑 Admin</span>
                      ) : (
                        <span className="role-badge user">👤 User</span>
                      )}
                    </td>
                    <td className="user-date-cell">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/users/${user._id}`}>
                          <button className="btn-icon-action" title="Chỉnh sửa">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                            </svg>
                          </button>
                        </Link>
                        <button onClick={() => handleDelete(user)} className="btn-icon-action danger" title="Xóa">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, user: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Xác nhận xóa</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, user: null })}>×</button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn xóa người dùng <strong>{deleteModal.user?.name}</strong>?</p>
              <p className="text-muted">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteModal({ show: false, user: null })}>Hủy</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Xóa người dùng</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
