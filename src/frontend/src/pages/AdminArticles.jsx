import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

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
  const [activeCategory, setActiveCategory] = useState('all')

  const load = async ()=>{
    setLoading(true)
    try{ const res = await api.get('/articles'); setItems(res.data) }catch(e){}
    setLoading(false)
  }

  useEffect(()=>{ load() }, [])

  const remove = async id => {
    if (!confirm('Xóa bài viết này?')) return
    try{ await api.delete('/articles/' + id); load() }catch(e){ alert('Xóa thất bại') }
  }

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(it => it.category === activeCategory)

  const getCategoryInfo = (cat) => categories.find(c => c.value === cat) || { label: cat }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý Bài viết</h1>
          <p className="admin-page-desc">Tạo và quản lý kiến thức chăm sóc hoa, mẹo vặt làm vườn</p>
        </div>
        <Link to="/admin/articles/new">
          <button className="btn btn-primary">Tạo bài viết mới</button>
        </Link>
      </div>

      {/* Category Filter Tabs */}
      <div className="admin-category-tabs">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`category-tab ${activeCategory === cat.value ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.value)}
          >
            <span className="tab-label">{cat.label}</span>
            <span className="tab-count">
              {cat.value === 'all' 
                ? items.length 
                : items.filter(it => it.category === cat.value).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải bài viết...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3>Chưa có bài viết nào</h3>
          <p>{activeCategory === 'all' ? 'Hãy tạo bài viết đầu tiên của bạn' : `Chưa có bài viết trong danh mục "${getCategoryInfo(activeCategory).label}"`}</p>
          <Link to="/admin/articles/new">
            <button className="btn btn-primary">Tạo bài viết mới</button>
          </Link>
        </div>
      ) : (
        <div className="admin-articles-grid">
          {filteredItems.map(it=> {
            const catInfo = getCategoryInfo(it.category)
            return (
              <div key={it._id} className="admin-article-card-new">
                <div className="article-card-image">
                  {it.featuredImage ? (
                    <img src={it.featuredImage} alt={it.title} />
                  ) : (
                    <div className="article-card-placeholder">
                      <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  <span className="article-card-category">{catInfo.label}</span>
                </div>
                <div className="article-card-body">
                  <h3 className="article-card-title">{it.title}</h3>
                  <p className="article-card-summary">{it.summary || 'Chưa có mô tả'}</p>
                  <div className="article-card-meta">
                    <span className="article-date">
                      {new Date(it.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="article-card-actions">
                  <Link to={`/article/${it.slug}`} className="btn-action btn-view" title="Xem">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                  <Link to={`/admin/articles/${it._id}`} className="btn-action btn-edit" title="Sửa">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                  <button onClick={()=>remove(it._id)} className="btn-action btn-delete" title="Xóa">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
