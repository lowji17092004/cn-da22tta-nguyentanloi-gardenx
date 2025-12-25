import React, { useEffect, useState, useMemo } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import Toast from '../components/Toast'
import './AdminUsers.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [lockModal, setLockModal] = useState({ show: false, user: null, action: '' })
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null })
  const [orderCounts, setOrderCounts] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setUsers(res.data)
      
      // Load order counts for all users
      const counts = {}
      await Promise.all(res.data.map(async (user) => {
        try {
          const orderRes = await api.get(`/users/${user._id}/order-count`)
          counts[user._id] = orderRes.data.count
          console.log(`User ${user.name} (${user._id}) has ${orderRes.data.count} orders`)
        } catch (e) {
          console.error(`Failed to load order count for user ${user._id}:`, e)
          counts[user._id] = 0
        }
      }))
      setOrderCounts(counts)
      console.log('All order counts:', counts)
    } catch (e) {
      console.error('Failed to load users:', e)
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
      const matchStatus = !filterStatus || 
                         (filterStatus === 'locked' && user.isLocked) ||
                         (filterStatus === 'active' && !user.isLocked)
      return matchSearch && matchRole && matchStatus
    })
  }, [users, searchTerm, filterRole, filterStatus])

  const handleLockToggle = async (user, action) => {
    setLockModal({ show: true, user, action })
  }

  const confirmLockToggle = async () => {
    if (!lockModal.user) return
    try {
      const endpoint = lockModal.action === 'lock' ? 'lock' : 'unlock'
      await api.put(`/users/${lockModal.user._id}/${endpoint}`)
      load()
      setLockModal({ show: false, user: null, action: '' })
      showToast(lockModal.action === 'lock' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản', 'success')
    } catch (e) {
      showToast('Thao tác thất bại', 'error')
    }
  }

  const handleDeleteUser = (user) => {
    setDeleteModal({ show: true, user })
  }

  const confirmDeleteUser = async () => {
    if (!deleteModal.user) return
    try {
      await api.delete(`/users/${deleteModal.user._id}`)
      load()
      setDeleteModal({ show: false, user: null })
      showToast('Đã xóa người dùng thành công', 'success')
    } catch (e) {
      showToast(e.response?.data?.message || 'Xóa người dùng thất bại', 'error')
      setDeleteModal({ show: false, user: null })
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
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
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
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
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
              <option value="collaborator">Nhân viên</option>
              <option value="user">User</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Đã khóa</option>
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
            <div className="admin-stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Đã khóa</div>
                <div className="stat-value">{users.filter(u => u.isLocked).length}</div>
              </div>
            </div>
          </div>

          <div className="admin-results-info">
            <span>Hiển thị <strong>{filteredUsers.length}</strong> / {users.length} người dùng</span>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className={user.isLocked ? 'locked-row' : ''}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {user.avatar ? (
                            <img 
                              src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                              alt={user.name} 
                            />
                          ) : (
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || '—'}</td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="role-badge admin">
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Admin
                        </span>
                      ) : user.role === 'collaborator' ? (
                        <span className="role-badge collaborator">
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                          </svg>
                          CTV
                        </span>
                      ) : (
                        <span className="role-badge user">
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          User
                        </span>
                      )}
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString('vi-VN', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </td>
                    <td>
                      {user.isLocked ? (
                        <span className="status-badge locked">
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Đã khóa
                        </span>
                      ) : (
                        <span className="status-badge active">
                          <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Hoạt động
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/admin/users/${user._id}`} className="btn-icon" title="Đổi quyền">
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        {user.isLocked ? (
                          <button onClick={() => handleLockToggle(user, 'unlock')} className="btn-icon success" title="Mở khóa">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                          </button>
                        ) : (
                          <button onClick={() => handleLockToggle(user, 'lock')} className="btn-icon warning" title="Khóa">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                        )}
                        {user.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(user)} className="btn-icon danger" title="Xóa">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {lockModal.show && (
        <div className="modal-overlay" onClick={() => setLockModal({ show: false, user: null, action: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {lockModal.action === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </h3>
              <button className="modal-close" onClick={() => setLockModal({ show: false, user: null, action: '' })}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn {lockModal.action === 'lock' ? 'khóa' : 'mở khóa'} tài khoản <strong>{lockModal.user?.name}</strong>?
              </p>
              <p className="text-muted">
                {lockModal.action === 'lock' 
                  ? 'Người dùng sẽ không thể đăng nhập sau khi bị khóa.' 
                  : 'Người dùng sẽ có thể đăng nhập lại sau khi được mở khóa.'}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setLockModal({ show: false, user: null, action: '' })}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
              <button 
                className={`btn ${lockModal.action === 'lock' ? 'btn-warning' : 'btn-success'}`} 
                onClick={confirmLockToggle}
              >
                {lockModal.action === 'lock' ? (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Khóa tài khoản
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Mở khóa tài khoản
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ show: false, user: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Xóa người dùng</h3>
              <button className="modal-close" onClick={() => setDeleteModal({ show: false, user: null })}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa người dùng <strong>{deleteModal.user?.name}</strong>?
              </p>
              <p className="text-muted">
                Hành động này không thể hoàn tác. Người dùng có đơn hàng sẽ không thể bị xóa.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteModal({ show: false, user: null })}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </button>
              <button className="btn btn-danger" onClick={confirmDeleteUser}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Xóa người dùng
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AdminLayout>
  )
}
