import React, { useEffect, useState } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function AdminArticles(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📝 Quản lý Bài viết</h1>
          <p className="admin-page-desc">Tạo và quản lý kiến thức chăm sóc hoa, mẹo vặt làm vườn</p>
        </div>
        <Link to="/admin/articles/new">
          <button className="btn btn-primary">✨ Tạo bài viết mới</button>
        </Link>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <span>Đang tải bài viết...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📝</div>
          <h3>Chưa có bài viết nào</h3>
          <p>Hãy tạo bài viết đầu tiên của bạn</p>
          <Link to="/admin/articles/new">
            <button className="btn btn-primary">✨ Tạo bài viết mới</button>
          </Link>
        </div>
      ) : (
        <div className="admin-list">
          {items.map(it=> (
            <div key={it._id} className="admin-article-card">
              <div className="admin-article-icon">📝</div>
              <div className="admin-article-body">
                <h3 className="admin-article-title">{it.title}</h3>
                <p className="admin-article-summary">{it.summary}</p>
              </div>
              <div className="admin-article-actions">
                <Link to={`/admin/articles/${it._id}`}>
                  <button className="btn btn-secondary">✏️ Sửa</button>
                </Link>
                <button onClick={()=>remove(it._id)} className="btn btn-danger">🗑️ Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
