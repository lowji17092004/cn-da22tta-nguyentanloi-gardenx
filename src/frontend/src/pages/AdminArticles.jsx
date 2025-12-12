import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { matchesSearchTerm } from '../utils/searchUtils'
import './AdminArticles.css'

const categories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'about', label: 'Florana' },
  { value: 'info', label: 'Thông tin cây hoa' },
  { value: 'care', label: 'Kiến thức chăm sóc' },
  { value: 'inspiration', label: 'Cảm hứng & Ý tưởng' }
]

export default function AdminArticles(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')

  const load = async ()=>{
    setLoading(true)
    try{ 
      const res = await api.get('/articles')
      setItems(Array.isArray(res.data?.articles) ? res.data.articles : Array.isArray(res.data) ? res.data : [])
    }catch(e){
      console.error('Load articles failed:', e)
    }
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  const remove = async id => {
    if (!confirm('Xóa bài viết này?')) return
    try{ await api.delete('/articles/' + id); load() }catch(e){ alert('Xóa thất bại') }
  }

  const getCategoryInfo = (cat) => categories.find(c => c.value === cat) || { label: cat || 'Khác' }

  const filteredItems = items
    .filter(it => {
      const matchSearch = !searchTerm ||
        matchesSearchTerm(it.title, searchTerm) ||
        matchesSearchTerm(it.summary, searchTerm)
      const matchCategory = !filterCategory || it.category === filterCategory
      return matchSearch && matchCategory
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'date-desc': return new Date(b.createdAt) - new Date(a.createdAt)
        case 'date-asc': return new Date(a.createdAt) - new Date(b.createdAt)
        case 'title': return (a.title || '').localeCompare(b.title || '')
        default: return 0
      }
    })

  const stats = {
    total: items.length,
    about: items.filter(it => it.category === 'about').length,
    info: items.filter(it => it.category === 'info').length,
    care: items.filter(it => it.category === 'care').length,
    inspiration: items.filter(it => it.category === 'inspiration').length
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  return (
    <AdminLayout>
      <div className="aa-page">
        {/* Hero Header */}
        <div className="aa-hero">
          <div className="aa-hero-content">
            <div className="aa-hero-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1>Quản lý Bài viết</h1>
              <p>Tạo và quản lý kiến thức chăm sóc hoa, mẹo vặt làm vườn</p>
            </div>
          </div>
          <Link to="/admin/articles/new">
            <button className="aa-btn-add">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Tạo bài viết mới</span>
            </button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="aa-stats">
          <div className="aa-stat-card">
            <div className="aa-stat-icon" style={{background: 'linear-gradient(135deg, #d4a574 0%, #c9965f 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="aa-stat-content">
              <div className="aa-stat-value">{stats.total}</div>
              <div className="aa-stat-label">Tổng bài viết</div>
            </div>
          </div>
          <div className="aa-stat-card">
            <div className="aa-stat-icon" style={{background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="aa-stat-content">
              <div className="aa-stat-value">{stats.about}</div>
              <div className="aa-stat-label">Về Florana</div>
            </div>
          </div>
          <div className="aa-stat-card">
            <div className="aa-stat-icon" style={{background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="aa-stat-content">
              <div className="aa-stat-value">{stats.info}</div>
              <div className="aa-stat-label">Thông tin cây</div>
            </div>
          </div>
          <div className="aa-stat-card">
            <div className="aa-stat-icon" style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="aa-stat-content">
              <div className="aa-stat-value">{stats.care}</div>
              <div className="aa-stat-label">Kiến thức chăm sóc</div>
            </div>
          </div>
          <div className="aa-stat-card">
            <div className="aa-stat-icon" style={{background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="aa-stat-content">
              <div className="aa-stat-value">{stats.inspiration}</div>
              <div className="aa-stat-label">Cảm hứng</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="aa-filters">
          <div className="aa-search">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="aa-filter-group">
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="aa-select"
            >
              <option value="">Tất cả danh mục</option>
              {categories.filter(c => c.value !== 'all').map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="aa-select"
            >
              <option value="date-desc">Mới nhất trước</option>
              <option value="date-asc">Cũ nhất trước</option>
              <option value="title">Tên A-Z</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="aa-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="aa-empty">
            <div className="empty-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3>Không tìm thấy bài viết</h3>
            <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="aa-table-wrapper">
            <table className="aa-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Tóm tắt</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(it => {
                  const catInfo = getCategoryInfo(it.category)
                  return (
                    <tr key={it._id}>
                      <td>
                        <div className="aa-table-image">
                          {it.featuredImage ? (
                            <img src={it.featuredImage} alt={it.title} />
                          ) : (
                            <div className="aa-image-placeholder">
                              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="aa-article-title">{it.title}</div>
                      </td>
                      <td>
                        <span className={`aa-category-badge cat-${it.category}`}>
                          {catInfo.label}
                        </span>
                      </td>
                      <td>
                        <div className="aa-summary">{it.summary || 'Chưa có tóm tắt'}</div>
                      </td>
                      <td>
                        <div className="aa-date">{formatDate(it.createdAt)}</div>
                      </td>
                      <td>
                        <div className="aa-table-actions">
                          <Link to={`/article/${it.slug}`}>
                            <button className="aa-action-btn view" title="Xem">
                              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Link>
                          <Link to={`/admin/articles/${it._id}`}>
                            <button className="aa-action-btn edit" title="Sửa">
                              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          </Link>
                          <button onClick={()=>remove(it._id)} className="aa-action-btn delete" title="Xóa">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
