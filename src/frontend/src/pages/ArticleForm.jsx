import React, { useEffect, useState, useRef } from 'react'
import api from '../api'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'

export default function ArticleForm(){
  const { id } = useParams()
  const navigate = useNavigate()
  const editorRef = useRef(null)
  
  const [data, setData] = useState({ 
    title: '', 
    slug: '', 
    category: 'info', 
    summary: '', 
    content: '', 
    featuredImage: '',
    images: [] 
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showTemplates, setShowTemplates] = useState(false)

  const categories = [
    { value: 'about', label: 'Florana - Giới thiệu', icon: '🏪' },
    { value: 'info', label: 'Thông tin cây hoa', icon: '🌸' },
    { value: 'care', label: 'Kiến thức chăm sóc', icon: '💧' },
    { value: 'inspiration', label: 'Cảm hứng & Ý tưởng', icon: '💡' }
  ]

  const templates = [
    {
      name: 'Giới thiệu sản phẩm',
      icon: '🌷',
      content: `<h2>Giới thiệu</h2>
<p>Mô tả ngắn gọn về sản phẩm hoặc chủ đề bài viết.</p>

<h3>Đặc điểm nổi bật</h3>
<ul>
  <li>Đặc điểm 1</li>
  <li>Đặc điểm 2</li>
  <li>Đặc điểm 3</li>
</ul>

<h3>Lưu ý khi sử dụng</h3>
<p>Thông tin hữu ích cho người đọc...</p>`
    },
    {
      name: 'Hướng dẫn chăm sóc',
      icon: '📖',
      content: `<h2>Hướng dẫn chăm sóc</h2>
<p>Giới thiệu ngắn về hướng dẫn này.</p>

<h3>Bước 1: Chuẩn bị</h3>
<p>Mô tả bước đầu tiên...</p>

<h3>Bước 2: Thực hiện</h3>
<p>Mô tả bước tiếp theo...</p>

<h3>Bước 3: Hoàn thành</h3>
<p>Mô tả bước cuối cùng...</p>

<blockquote>Mẹo: Thêm lưu ý quan trọng ở đây</blockquote>`
    },
    {
      name: 'Tin tức / Khuyến mãi',
      icon: '📢',
      content: `<h2>Tiêu đề chính</h2>
<p>Nội dung chính của thông báo hoặc tin tức.</p>

<h3>Chi tiết</h3>
<p>Thông tin chi tiết về chương trình, sự kiện...</p>

<h3>Điều kiện áp dụng</h3>
<ul>
  <li>Điều kiện 1</li>
  <li>Điều kiện 2</li>
</ul>

<p><strong>Thời gian:</strong> Từ ngày... đến ngày...</p>`
    }
  ]

  useEffect(() => {
    if (!id || id === 'new') return
    api.get('/articles/slug/' + id).then(r => setData(r.data)).catch(() => {
      api.get('/articles').then(r => {
        const a = r.data.find(x => x._id === id)
        if (a) setData(a)
      })
    })
  }, [id])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      if (!id || id === 'new') await api.post('/articles', data)
      else await api.put('/articles/' + id, data)
      navigate('/admin/articles')
    } catch (e) { 
      alert('Lưu thất bại') 
    } finally {
      setSaving(false)
    }
  }

  const handleFeaturedImage = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setData(prev => ({ ...prev, featuredImage: res.data.path }))
    } catch (e) { 
      alert('Upload lỗi') 
    }
    setUploading(false)
  }

  const handleContentImage = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      const imgTag = `\n<img src="${res.data.path}" alt="Hình ảnh" />\n`
      setData(prev => ({ ...prev, content: prev.content + imgTag }))
    } catch (e) { 
      alert('Upload lỗi') 
    }
    setUploading(false)
  }

  const insertFormat = (tag, wrap = false) => {
    const textarea = editorRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = data.content.substring(start, end)
    
    let newText = ''
    if (wrap && selectedText) {
      newText = `<${tag}>${selectedText}</${tag}>`
    } else {
      newText = `<${tag}>${selectedText || 'Nội dung'}</${tag}>`
    }
    
    const newContent = data.content.substring(0, start) + newText + data.content.substring(end)
    setData(prev => ({ ...prev, content: newContent }))
  }

  const removeFeaturedImage = async () => {
    if (data.featuredImage) {
      const fname = data.featuredImage.split('/').pop()
      try { await api.delete('/upload/' + fname) } catch (e) { }
    }
    setData(prev => ({ ...prev, featuredImage: '' }))
  }

  const applyTemplate = (template) => {
    if (data.content && !window.confirm('Áp dụng mẫu sẽ thay thế nội dung hiện tại. Tiếp tục?')) {
      return
    }
    setData(prev => ({ ...prev, content: template.content }))
    setShowTemplates(false)
    setActiveTab('content')
  }

  const generateSlug = () => {
    if (!data.title) return
    const slug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    setData(prev => ({ ...prev, slug }))
  }

  return (
    <AdminLayout>
      <div className="article-editor">
        <div className="editor-header">
          <div className="editor-header-left">
            <button type="button" onClick={() => navigate('/admin/articles')} className="btn-back">
              ← Quay lại
            </button>
            <h1>{id && id !== 'new' ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h1>
          </div>
          <div className="editor-header-right">
            <button type="button" onClick={submit} className="btn-save" disabled={saving || uploading || !data.title}>
              {saving ? 'Đang lưu...' : 'Lưu bài viết'}
            </button>
          </div>
        </div>

        <div className="editor-tabs">
          <button className={`editor-tab ${activeTab === 'basic' ? 'active' : ''}`} onClick={() => setActiveTab('basic')}>
            <span className="tab-icon">📝</span> Thông tin
          </button>
          <button className={`editor-tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            <span className="tab-icon">✏️</span> Nội dung
          </button>
          <button className={`editor-tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
            <span className="tab-icon">👁️</span> Xem trước
          </button>
        </div>

        {activeTab === 'basic' && (
          <div className="editor-panel">
            <div className="editor-section">
              <h2>📷 Ảnh đại diện</h2>
              <p className="section-desc">Ảnh này sẽ hiển thị trong danh sách bài viết</p>
              
              <div className="featured-image-upload">
                {data.featuredImage ? (
                  <div className="featured-image-preview">
                    <img src={data.featuredImage} alt="Ảnh đại diện" />
                    <button type="button" onClick={removeFeaturedImage} className="btn-remove-image">
                      ✕ Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <label className="upload-zone">
                    <input type="file" onChange={handleFeaturedImage} accept="image/*" disabled={uploading} />
                    <div className="upload-content">
                      <span className="upload-icon">📷</span>
                      <span>{uploading ? 'Đang tải...' : 'Nhấn để chọn ảnh đại diện'}</span>
                      <span className="upload-hint">JPG, PNG - Khuyến nghị 800x600px</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="editor-section">
              <h2>📋 Thông tin bài viết</h2>
              
              <div className="form-field">
                <label>Tiêu đề <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={data.title} 
                  onChange={e => setData({ ...data, title: e.target.value })} 
                  placeholder="Nhập tiêu đề bài viết..." 
                  className="input-title" 
                />
              </div>

              <div className="form-field">
                <label>Danh mục</label>
                <div className="category-select-grid">
                  {categories.map(cat => (
                    <button 
                      key={cat.value} 
                      type="button"
                      className={`category-option ${data.category === cat.value ? 'active' : ''}`}
                      onClick={() => setData({ ...data, category: cat.value })}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-label">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Đường dẫn (Slug)</label>
                <div className="slug-input-wrapper">
                  <input 
                    type="text" 
                    value={data.slug} 
                    onChange={e => setData({ ...data, slug: e.target.value })} 
                    placeholder="tu-dong-tao-tu-tieu-de" 
                  />
                  <button type="button" onClick={generateSlug} className="btn-generate-slug" title="Tạo từ tiêu đề">
                    🔄 Tạo tự động
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label>Mô tả ngắn</label>
                <textarea 
                  value={data.summary} 
                  onChange={e => setData({ ...data, summary: e.target.value })} 
                  placeholder="Viết mô tả ngắn gọn về bài viết (hiển thị trong danh sách)..." 
                  rows={3} 
                />
                <span className="char-count">{data.summary?.length || 0}/200 ký tự</span>
              </div>
            </div>

            {/* Template suggestions for new articles */}
            {(!id || id === 'new') && !data.content && (
              <div className="editor-section templates-section">
                <h2>🎨 Bắt đầu với mẫu có sẵn</h2>
                <p className="section-desc">Chọn một mẫu để bắt đầu nhanh hơn</p>
                <div className="templates-grid">
                  {templates.map((tpl, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      className="template-card"
                      onClick={() => applyTemplate(tpl)}
                    >
                      <span className="template-icon">{tpl.icon}</span>
                      <span className="template-name">{tpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="editor-panel">
            <div className="editor-section full-height">
              <div className="content-editor-header">
                <h2>✏️ Nội dung chi tiết</h2>
                <div className="content-actions">
                  <button 
                    type="button" 
                    className="btn-templates"
                    onClick={() => setShowTemplates(!showTemplates)}
                  >
                    🎨 Mẫu có sẵn
                  </button>
                </div>
              </div>

              {showTemplates && (
                <div className="templates-dropdown">
                  {templates.map((tpl, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      className="template-item"
                      onClick={() => applyTemplate(tpl)}
                    >
                      <span>{tpl.icon}</span>
                      <span>{tpl.name}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="editor-toolbar">
                <div className="toolbar-group">
                  <button type="button" onClick={() => insertFormat('h2', true)} title="Tiêu đề lớn">H2</button>
                  <button type="button" onClick={() => insertFormat('h3', true)} title="Tiêu đề vừa">H3</button>
                  <button type="button" onClick={() => insertFormat('h4', true)} title="Tiêu đề nhỏ">H4</button>
                </div>
                <div className="toolbar-divider"></div>
                <div className="toolbar-group">
                  <button type="button" onClick={() => insertFormat('p', true)} title="Đoạn văn">P</button>
                  <button type="button" onClick={() => insertFormat('strong', true)} title="In đậm">B</button>
                  <button type="button" onClick={() => insertFormat('em', true)} title="In nghiêng">I</button>
                </div>
                <div className="toolbar-divider"></div>
                <div className="toolbar-group">
                  <button type="button" onClick={() => insertFormat('ul', false)} title="Danh sách">UL</button>
                  <button type="button" onClick={() => insertFormat('blockquote', true)} title="Trích dẫn">Quote</button>
                </div>
                <div className="toolbar-divider"></div>
                <div className="toolbar-group">
                  <label className="toolbar-upload">
                    <input type="file" onChange={handleContentImage} accept="image/*" disabled={uploading} />
                    <span>📷 {uploading ? 'Đang tải...' : 'Thêm ảnh'}</span>
                  </label>
                </div>
              </div>

              <textarea 
                ref={editorRef}
                value={data.content} 
                onChange={e => setData({ ...data, content: e.target.value })}
                placeholder={`Viết nội dung HTML cho bài viết...

💡 Ví dụ:
<h2>Giới thiệu</h2>
<p>Đây là đoạn văn mô tả...</p>

<h3>Hướng dẫn chăm sóc</h3>
<ul>
  <li>Bước 1: Tưới nước đều đặn</li>
  <li>Bước 2: Đặt nơi có ánh sáng</li>
</ul>

💡 Mẹo: Bấm nút "🎨 Mẫu có sẵn" để sử dụng mẫu nội dung`}
                className="content-textarea"
              />

              <div className="editor-tips">
                <span className="tip-icon">💡</span>
                <strong>Mẹo:</strong> Chọn văn bản rồi bấm các nút H2, H3, B, I để định dạng nhanh. Bấm tab "Xem trước" để kiểm tra kết quả.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="editor-panel">
            <div className="preview-container">
              <div className="preview-header">
                <span className="preview-badge">Xem trước</span>
              </div>
              
              <article className="article-preview">
                {data.featuredImage && (
                  <div className="preview-featured-image">
                    <img src={data.featuredImage} alt={data.title} />
                  </div>
                )}
                
                <div className="preview-meta">
                  <span className="preview-category">
                    {categories.find(c => c.value === data.category)?.label || data.category}
                  </span>
                </div>

                <h1 className="preview-title">{data.title || 'Tiêu đề bài viết'}</h1>
                
                {data.summary && <p className="preview-summary">{data.summary}</p>}

                <div className="preview-content" dangerouslySetInnerHTML={{ __html: data.content || '<p>Nội dung bài viết sẽ hiển thị ở đây...</p>' }} />
              </article>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
