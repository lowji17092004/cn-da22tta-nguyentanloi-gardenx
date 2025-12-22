import React, { useEffect, useState } from 'react'
import api from '../api'
import AdminLayout from '../components/AdminLayout'
import './AdminCategories.css'

export default function AdminCategories() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [activeTab, setActiveTab] = useState('product')
  const [searchTerm, setSearchTerm] = useState('')
  
  const [editModal, setEditModal] = useState({ show: false, item: null })
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null, type: 'category', parentId: null })
  const [subModal, setSubModal] = useState({ show: false, parentId: null, item: null, mode: 'add' })
  const [createModal, setCreateModal] = useState(false)
  
  const [newCat, setNewCat] = useState({ name: '' })
  const [errors, setErrors] = useState({})
  const [expandedCats, setExpandedCats] = useState({})

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await api.get('/categories/stats')
      setStats(res.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const productCategories = stats?.productCategories || []
  const blogCategories = stats?.blogCategories || []

  const generateSlug = (name) => {
    return name.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
  }

  const validate = (cat) => {
    if (!cat.name || cat.name.trim().length < 2) return { name: 'Tên phải có ít nhất 2 ký tự' }
    return {}
  }

  const createCategory = async () => {
    const errs = validate(newCat)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await api.post('/categories', { name: newCat.name.trim(), slug: generateSlug(newCat.name), type: activeTab })
      setNewCat({ name: '' }); setCreateModal(false); setErrors({}); loadData()
    } catch (e) { alert(e.response?.data?.message || 'Tạo thất bại') }
  }

  const saveEdit = async () => {
    const errs = validate(editModal.item)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      await api.put('/categories/' + editModal.item._id, { ...editModal.item, slug: generateSlug(editModal.item.name) })
      setEditModal({ show: false, item: null }); setErrors({}); loadData()
    } catch (e) { alert(e.response?.data?.message || 'Cập nhật thất bại') }
  }

  const confirmDelete = async () => {
    try {
      if (deleteModal.type === 'subcategory') {
        await api.delete(`/categories/${deleteModal.parentId}/subcategories/${deleteModal.item._id}`)
      } else {
        await api.delete('/categories/' + deleteModal.item._id)
      }
      setDeleteModal({ show: false, item: null, type: 'category', parentId: null }); loadData()
    } catch (e) { alert(e.response?.data?.message || 'Xóa thất bại') }
  }

  const toggleExpand = (id) => setExpandedCats(p => ({ ...p, [id]: !p[id] }))

  const saveSubcategory = async () => {
    const errs = validate(subModal.item)
    if (Object.keys(errs).length) { setErrors(errs); return }
    try {
      const data = { name: subModal.item.name.trim(), slug: generateSlug(subModal.item.name) }
      if (subModal.mode === 'add') {
        await api.post(`/categories/${subModal.parentId}/subcategories`, data)
      } else {
        await api.put(`/categories/${subModal.parentId}/subcategories/${subModal.item._id}`, data)
      }
      setSubModal({ show: false, parentId: null, item: null, mode: 'add' }); setErrors({}); loadData()
    } catch (e) { alert(e.response?.data?.message || 'Thao tác thất bại') }
  }

  const toggleVisibility = async (categoryId, currentVisibility) => {
    try {
      await api.put(`/categories/${categoryId}`, { isVisible: !currentVisibility })
      loadData()
    } catch (e) {
      alert(e.response?.data?.message || 'Cập nhật thất bại')
    }
  }

  const currentCategories = activeTab === 'product' ? productCategories : blogCategories
  const filtered = currentCategories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subcategories?.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalItems = currentCategories.reduce((s, c) => s + (activeTab === 'product' ? c.productCount || 0 : c.articleCount || 0), 0)
  const totalSubs = currentCategories.reduce((s, c) => s + (c.subcategories?.length || 0), 0)

  if (loading) return (
    <AdminLayout>
      <div className="ac-loading">
        <div className="ac-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="ac-page">
        {/* Hero Header */}
        <div className="ac-hero">
          <div className="ac-hero-content">
            <div className="ac-hero-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
              </svg>
            </div>
            <div>
              <h1>Quản lý Danh mục</h1>
              <p>Tổ chức và phân loại nội dung một cách hiệu quả</p>
            </div>
          </div>
          <button className="ac-btn-add" onClick={() => setCreateModal(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Thêm mới
          </button>
        </div>

        {/* Stats Cards */}
        <div className="ac-stats">
          <div className="ac-stat-card">
            <div className="ac-stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div className="ac-stat-info">
              <span className="ac-stat-num">{currentCategories.length}</span>
              <span className="ac-stat-label">Danh mục chính</span>
            </div>
          </div>
          <div className="ac-stat-card">
            <div className="ac-stat-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div className="ac-stat-info">
              <span className="ac-stat-num">{totalSubs}</span>
              <span className="ac-stat-label">Danh mục con</span>
            </div>
          </div>
          <div className="ac-stat-card">
            <div className="ac-stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div className="ac-stat-info">
              <span className="ac-stat-num">{totalItems}</span>
              <span className="ac-stat-label">{activeTab === 'product' ? 'Sản phẩm' : 'Bài viết'}</span>
            </div>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="ac-toolbar">
          <div className="ac-tabs">
            <button className={`ac-tab ${activeTab === 'product' ? 'active' : ''}`} onClick={() => setActiveTab('product')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Sản phẩm
              <span className="ac-tab-count">{productCategories.length}</span>
            </button>
            <button className={`ac-tab ${activeTab === 'blog' ? 'active' : ''}`} onClick={() => setActiveTab('blog')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
              </svg>
              Blog
              <span className="ac-tab-count">{blogCategories.length}</span>
            </button>
          </div>
          <div className="ac-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input placeholder="Tìm kiếm danh mục..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="ac-grid">
          {filtered.length === 0 ? (
            <div className="ac-empty">
              <div className="ac-empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
              </div>
              <h3>{searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có danh mục nào'}</h3>
              <p>{searchTerm ? 'Thử tìm với từ khóa khác' : 'Bắt đầu bằng cách tạo danh mục đầu tiên'}</p>
              {!searchTerm && (
                <button className="ac-btn-primary" onClick={() => setCreateModal(true)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Tạo danh mục
                </button>
              )}
            </div>
          ) : (
            filtered.map(cat => {
              const expanded = expandedCats[cat._id]
              const hasSubs = cat.subcategories?.length > 0
              const count = activeTab === 'product' ? cat.productCount : cat.articleCount

              return (
                <div key={cat._id} className={`ac-card ${expanded ? 'expanded' : ''} ${cat.isVisible === false ? 'hidden-category' : ''}`}>
                  <div className="ac-card-header">
                    <div className="ac-card-title">
                      <h3>
                        {cat.name}
                        {cat.isVisible === false && <span className="visibility-badge">Đã ẩn</span>}
                      </h3>
                      <div className="ac-card-meta">
                        <span className="ac-badge green">{count || 0} {activeTab === 'product' ? 'sản phẩm' : 'bài viết'}</span>
                        {hasSubs && <span className="ac-badge purple">{cat.subcategories.length} danh mục con</span>}
                      </div>
                    </div>
                    <div className="ac-card-actions">
                      <button 
                        className={`ac-action ${cat.isVisible === false ? 'show' : 'hide'}`} 
                        onClick={() => toggleVisibility(cat._id, cat.isVisible !== false)} 
                        title={cat.isVisible === false ? 'Hiện danh mục' : 'Ẩn danh mục'}
                      >
                        {cat.isVisible === false ? (
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
                      <button className="ac-action add" onClick={() => setSubModal({ show: true, parentId: cat._id, item: { name: '' }, mode: 'add' })} title="Thêm danh mục con">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                      <button className="ac-action edit" onClick={() => { setEditModal({ show: true, item: {...cat} }); setErrors({}) }} title="Chỉnh sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="ac-action delete" onClick={() => setDeleteModal({ show: true, item: cat, type: 'category', parentId: null })} title="Xóa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                      </button>
                    </div>
                  </div>
                  
                  {hasSubs && (
                    <>
                      <button className="ac-expand-btn" onClick={() => toggleExpand(cat._id)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d={expanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}/>
                        </svg>
                        {expanded ? 'Thu gọn' : 'Xem danh mục con'}
                      </button>
                      
                      {expanded && (
                        <div className="ac-subs">
                          {cat.subcategories.map(sub => (
                            <div key={sub._id} className="ac-sub-item">
                              <span className="ac-sub-name">{sub.name}</span>
                              <div className="ac-sub-actions">
                                <button className="ac-sub-btn edit" onClick={() => { setSubModal({ show: true, parentId: cat._id, item: {...sub}, mode: 'edit' }); setErrors({}) }} title="Chỉnh sửa">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                  <span>Sửa</span>
                                </button>
                                <button className="ac-sub-btn delete" onClick={() => setDeleteModal({ show: true, item: sub, type: 'subcategory', parentId: cat._id })} title="Xóa">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                  <span>Xóa</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Create Modal */}
        {createModal && (
          <div className="ac-overlay" onClick={() => setCreateModal(false)}>
            <div className="ac-modal" onClick={e => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h2>Tạo danh mục mới</h2>
                <button onClick={() => setCreateModal(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="ac-modal-body">
                <div className="ac-type-picker">
                  <button className={activeTab === 'product' ? 'active' : ''} onClick={() => setActiveTab('product')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <span>Sản phẩm</span>
                  </button>
                  <button className={activeTab === 'blog' ? 'active' : ''} onClick={() => setActiveTab('blog')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                    </svg>
                    <span>Blog</span>
                  </button>
                </div>
                <div className="ac-field">
                  <label>Tên danh mục</label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên danh mục..." 
                    value={newCat.name} 
                    onChange={e => setNewCat({ name: e.target.value })}
                    className={errors.name ? 'error' : ''}
                    autoFocus
                  />
                  {errors.name && <span className="ac-error">{errors.name}</span>}
                </div>
              </div>
              <div className="ac-modal-footer">
                <button className="ac-btn-cancel" onClick={() => setCreateModal(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  <span>Hủy</span>
                </button>
                <button className="ac-btn-primary" onClick={createCategory}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Tạo danh mục</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editModal.show && (
          <div className="ac-overlay" onClick={() => setEditModal({ show: false, item: null })}>
            <div className="ac-modal" onClick={e => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h2>Chỉnh sửa danh mục</h2>
                <button onClick={() => setEditModal({ show: false, item: null })}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="ac-modal-body">
                <div className="ac-field">
                  <label>Tên danh mục</label>
                  <input 
                    type="text" 
                    value={editModal.item?.name || ''} 
                    onChange={e => setEditModal({ ...editModal, item: { ...editModal.item, name: e.target.value }})}
                    className={errors.name ? 'error' : ''}
                    autoFocus
                  />
                  {errors.name && <span className="ac-error">{errors.name}</span>}
                </div>
              </div>
              <div className="ac-modal-footer">
                <button className="ac-btn-cancel" onClick={() => setEditModal({ show: false, item: null })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  <span>Hủy</span>
                </button>
                <button className="ac-btn-primary" onClick={saveEdit}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub Modal */}
        {subModal.show && (
          <div className="ac-overlay" onClick={() => setSubModal({ show: false, parentId: null, item: null, mode: 'add' })}>
            <div className="ac-modal" onClick={e => e.stopPropagation()}>
              <div className="ac-modal-header">
                <h2>{subModal.mode === 'add' ? 'Thêm danh mục con' : 'Sửa danh mục con'}</h2>
                <button onClick={() => setSubModal({ show: false, parentId: null, item: null, mode: 'add' })}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="ac-modal-body">
                <div className="ac-field">
                  <label>Tên danh mục con</label>
                  <input 
                    type="text" 
                    placeholder="Nhập tên danh mục con..."
                    value={subModal.item?.name || ''} 
                    onChange={e => setSubModal({ ...subModal, item: { ...subModal.item, name: e.target.value }})}
                    className={errors.name ? 'error' : ''}
                    autoFocus
                  />
                  {errors.name && <span className="ac-error">{errors.name}</span>}
                </div>
              </div>
              <div className="ac-modal-footer">
                <button className="ac-btn-cancel" onClick={() => setSubModal({ show: false, parentId: null, item: null, mode: 'add' })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  <span>Hủy</span>
                </button>
                <button className="ac-btn-primary" onClick={saveSubcategory}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>{subModal.mode === 'add' ? 'Thêm' : 'Lưu'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {deleteModal.show && (
          <div className="ac-overlay" onClick={() => setDeleteModal({ show: false, item: null, type: 'category', parentId: null })}>
            <div className="ac-modal ac-modal-delete" onClick={e => e.stopPropagation()}>
              <div className="ac-delete-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h2>Xác nhận xóa</h2>
              <p>Bạn có chắc muốn xóa <strong>"{deleteModal.item?.name}"</strong>?</p>
              {deleteModal.type === 'category' && deleteModal.item?.subcategories?.length > 0 && (
                <div className="ac-warning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                  {deleteModal.item.subcategories.length} danh mục con sẽ bị xóa theo!
                </div>
              )}
              <div className="ac-delete-actions">
                <button className="ac-btn-cancel" onClick={() => setDeleteModal({ show: false, item: null, type: 'category', parentId: null })}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  <span>Hủy</span>
                </button>
                <button className="ac-btn-danger" onClick={confirmDelete}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                  </svg>
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
