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
      <span className="role-badge admin">Admin</span>
    ) : (
      <span className="role-badge user">User</span>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Người dùng</h1>
          <p className="admin-page-desc">Thêm, sửa, xóa và quản lý tài khoản người dùng</p>
        </div>
        <Link to="/admin/users/new">
          <button className="btn btn-primary">
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
          <div className="admin-empty-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3>Chưa có người dùng nào</h3>
          <p>Hãy tạo người dùng đầu tiên</p>
          <Link to="/admin/users/new">
            <button className="btn btn-primary">
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
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Tổng người dùng</div>
                <div className="stat-value">{users.length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Admin</div>
                <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
              </div>
            </div>
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
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
                        <span className="role-badge admin">Admin</span>
                      ) : (
                        <span className="role-badge user">User</span>
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
              <h3 className="modal-title">Xác nhận xóa</h3>
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
