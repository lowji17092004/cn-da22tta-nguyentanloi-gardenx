import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function ArticleForm(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState({ title:'', slug:'', summary:'', content:'', images:[] })
  const [uploading, setUploading] = useState(false)
  const [progressMap, setProgressMap] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    if (!id || id === 'new') return
    api.get('/articles/slug/' + id).then(r=> setData(r.data)).catch(()=>{
      api.get('/articles').then(r=>{
        const a = r.data.find(x => x._id === id)
        if (a) setData(a)
      })
    })
  }, [id])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try{
      if (!id || id === 'new') await api.post('/articles', data)
      else await api.put('/articles/' + id, data)
      navigate('/admin/articles')
    }catch(e){ 
      alert('Lưu thất bại') 
    } finally {
      setSaving(false)
    }
  }

  const handleFile = async e => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try{
      for (const file of files){
        const form = new FormData(); form.append('file', file)
        const res = await api.post('/upload', form, {
          headers: {'Content-Type':'multipart/form-data'},
          onUploadProgress: (e) => {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgressMap(prev => ({...prev, [file.name]: pct}))
          }
        })
        setData(prev => ({...prev, images: [...(prev.images||[]), res.data.path]}))
        setProgressMap(prev => ({...prev, [file.name]: 100}))
      }
    }catch(e){ alert('Upload lỗi') }
    setUploading(false)
  }

  const removeImage = async (img, index) => {
    const fname = img.split('/').pop()
    try{ await api.delete('/upload/' + fname) }catch(e){ }
    setData(prev => ({...prev, images: prev.images.filter((_,k)=>k!==index)}))
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{id && id !== 'new' ? 'Chỉnh sửa' : 'Tạo mới'} Bài viết</h1>
          <p className="admin-page-desc">Quản lý nội dung và hình ảnh bài viết</p>
        </div>
        <div className="admin-page-actions">
          <button 
            type="button" 
            onClick={() => navigate('/admin/articles')} 
            className="btn-secondary"
          >
            Hủy bỏ
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="article-form">
        <div className="form-grid">
          <div className="form-main">
            <div className="form-group">
              <h3>Thông tin cơ bản</h3>
              <div className="form-row">
                <label>
                  Tiêu đề bài viết
                  <input 
                    value={data.title} 
                    onChange={e=>setData({...data, title:e.target.value})} 
                    placeholder="Nhập tiêu đề bài viết..."
                    required 
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Đường dẫn (Slug)
                  <input 
                    value={data.slug} 
                    onChange={e=>setData({...data, slug:e.target.value})}
                    placeholder="vd: huong-dan-cham-soc-hoa-hong"
                  />
                  <span className="form-hint">URL thân thiện cho SEO. Để trống để tự động tạo.</span>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Tóm tắt
                  <textarea 
                    value={data.summary} 
                    onChange={e=>setData({...data, summary:e.target.value})}
                    placeholder="Viết tóm tắt ngắn gọn về bài viết..."
                    rows={3}
                  />
                </label>
              </div>
            </div>

            <div className="form-group">
              <h3>Nội dung chi tiết</h3>
              <div className="form-row">
                <label>
                  Nội dung bài viết
                  <textarea 
                    value={data.content} 
                    onChange={e=>setData({...data, content:e.target.value})}
                    placeholder="Viết nội dung đầy đủ của bài viết..."
                    rows={12}
                    className="content-editor"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="form-sidebar">
            <div className="form-group">
              <h3>Hình ảnh</h3>
              <div className="upload-area">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFile}
                  id="file-upload"
                  className="file-input"
                  accept="image/*"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <span>Chọn ảnh để tải lên</span>
                  <span className="upload-hint">Hỗ trợ JPG, PNG, GIF</span>
                </label>
                {uploading && (
                  <div className="upload-status">
                    <div className="spinner-small"></div>
                    <span>Đang tải lên...</span>
                  </div>
                )}
              </div>

              {Object.keys(progressMap).length > 0 && (
                <div className="upload-progress">
                  {Object.keys(progressMap).map((k)=> (
                    <div key={k} className="progress-item">
                      <div className="progress-name">{k}</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: `${progressMap[k]}%`}} />
                      </div>
                      <div className="progress-percent">{progressMap[k]}%</div>
                    </div>
                  ))}
                </div>
              )}

              {(data.images && data.images.length > 0) && (
                <div className="image-gallery">
                  <h4>{data.images.length} ảnh đã tải lên</h4>
                  <div className="gallery-grid">
                    {data.images.map((img, i) => (
                      <div key={i} className="gallery-item">
                        <img src={img} alt={`Ảnh ${i+1}`} />
                        <button 
                          type="button" 
                          onClick={() => removeImage(img, i)}
                          className="remove-image"
                          aria-label="Xóa ảnh"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions-sticky">
              <button 
                type="submit" 
                className="btn-primary btn-block"
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <div className="spinner-small"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <path d="M17 21v-8H7v8M7 3v5h8"/>
                    </svg>
                    <span>Lưu bài viết</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
