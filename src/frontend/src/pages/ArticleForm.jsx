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
    rawContent: '', // Nội dung thô (plain text)
    featuredImage: '',
    images: [],
    layout: 'standard'
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showTemplates, setShowTemplates] = useState(false)
  const [galleryImages, setGalleryImages] = useState([])
  const [editorMode, setEditorMode] = useState('smart') // 'smart' hoặc 'html'

  const categories = [
    { value: 'about', label: 'The Sun Garden - Giới thiệu', icon: '🏪' },
    { value: 'info', label: 'Thông tin cây hoa', icon: '🌸' },
    { value: 'care', label: 'Kiến thức chăm sóc', icon: '💧' },
    { value: 'inspiration', label: 'Cảm hứng & Ý tưởng', icon: '💡' }
  ]

  const layouts = [
    { value: 'standard', label: 'Tiêu chuẩn', icon: '📄', desc: 'Bố cục thông thường với ảnh và văn bản' },
    { value: 'gallery', label: 'Thư viện ảnh', icon: '🖼️', desc: 'Nhiều ảnh với bố cục dạng gallery' },
    { value: 'full-width', label: 'Toàn chiều rộng', icon: '🌐', desc: 'Ảnh lớn, phù hợp landing page' }
  ]

  // Hàm tự động format nội dung plain text thành HTML đẹp
  const autoFormatContent = (text) => {
    if (!text || text.trim() === '') return ''
    
    // Tách thành các đoạn văn theo dòng trống
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
    
    let html = ''
    let isFirstParagraph = true
    let currentList = []
    let inList = false
    
    paragraphs.forEach((para, index) => {
      const lines = para.split('\n').map(l => l.trim()).filter(l => l)
      
      lines.forEach((line, lineIndex) => {
        // Kiểm tra các pattern đặc biệt
        
        // Tiêu đề chính (bắt đầu bằng # hoặc dòng ngắn đứng một mình ở đầu)
        if (line.startsWith('# ')) {
          if (inList) { html += formatList(currentList); currentList = []; inList = false }
          html += `<h2 style="font-size: 1.75rem; font-weight: 700; color: #2d5a3d; margin: 2rem 0 1rem; border-bottom: 2px solid #d4a574; padding-bottom: 0.5rem;">${line.slice(2)}</h2>\n`
        }
        // Tiêu đề phụ (bắt đầu bằng ## hoặc dòng kết thúc bằng :)
        else if (line.startsWith('## ') || (line.endsWith(':') && line.length < 60 && !line.includes('.'))) {
          if (inList) { html += formatList(currentList); currentList = []; inList = false }
          const title = line.startsWith('## ') ? line.slice(3) : line.slice(0, -1)
          html += `<h3 style="font-size: 1.35rem; font-weight: 600; color: #4a5568; margin: 1.5rem 0 0.75rem; display: flex; align-items: center; gap: 0.5rem;">${getAutoIcon(title)} ${title}</h3>\n`
        }
        // Danh sách (bắt đầu bằng - hoặc * hoặc số.)
        else if (/^[-*•]\s/.test(line) || /^\d+[.)]\s/.test(line)) {
          const content = line.replace(/^[-*•]\s|^\d+[.)]\s/, '').trim()
          currentList.push(content)
          inList = true
        }
        // Trích dẫn (bắt đầu bằng > hoặc nội dung trong "")
        else if (line.startsWith('>') || (line.startsWith('"') && line.endsWith('"'))) {
          if (inList) { html += formatList(currentList); currentList = []; inList = false }
          const quote = line.startsWith('>') ? line.slice(1).trim() : line.slice(1, -1)
          html += `<blockquote style="margin: 1.5rem 0; padding: 1rem 1.5rem; background: linear-gradient(135deg, #f0f7f0, #e8f5e9); border-left: 4px solid #2d5a3d; border-radius: 0 12px 12px 0; font-style: italic; color: #2d5a3d;">💡 ${quote}</blockquote>\n`
        }
        // Mẹo / Lưu ý (chứa từ khóa đặc biệt)
        else if (/^(mẹo|lưu ý|chú ý|tip|note|quan trọng)/i.test(line)) {
          if (inList) { html += formatList(currentList); currentList = []; inList = false }
          html += `<div style="margin: 1.5rem 0; padding: 1rem 1.5rem; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; border-left: 4px solid #f59e0b;"><strong>💡 ${line}</strong></div>\n`
        }
        // Đoạn văn thường
        else {
          if (inList) { html += formatList(currentList); currentList = []; inList = false }
          // Đoạn đầu tiên được style đặc biệt
          if (isFirstParagraph && index === 0 && lineIndex === 0) {
            html += `<p style="font-size: 1.15rem; line-height: 1.8; color: #374151; margin-bottom: 1.5rem; text-align: justify;">${formatInlineText(line)}</p>\n`
            isFirstParagraph = false
          } else {
            html += `<p style="line-height: 1.8; color: #4a5568; margin-bottom: 1rem; text-align: justify;">${formatInlineText(line)}</p>\n`
          }
        }
      })
    })
    
    // Kết thúc list nếu còn
    if (inList) { html += formatList(currentList) }
    
    return html
  }
  
  // Format danh sách
  const formatList = (items) => {
    if (items.length === 0) return ''
    const listItems = items.map((item, i) => 
      `<li style="margin-bottom: 0.5rem; padding-left: 0.5rem; position: relative;">${formatInlineText(item)}</li>`
    ).join('\n')
    return `<ul style="margin: 1rem 0 1.5rem; padding-left: 1.5rem; list-style: none;">\n${listItems}\n</ul>\n`
  }
  
  // Format inline text (in đậm, in nghiêng)
  const formatInlineText = (text) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #2d5a3d;">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__(.+?)__/g, '<strong style="color: #2d5a3d;">$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
  }
  
  // Tự động thêm icon dựa trên tiêu đề
  const getAutoIcon = (title) => {
    const titleLower = title.toLowerCase()
    if (titleLower.includes('giới thiệu') || titleLower.includes('mở đầu')) return '🌟'
    if (titleLower.includes('đặc điểm') || titleLower.includes('tính năng')) return '✨'
    if (titleLower.includes('hướng dẫn') || titleLower.includes('cách')) return '📝'
    if (titleLower.includes('chăm sóc') || titleLower.includes('bảo quản')) return '💧'
    if (titleLower.includes('lưu ý') || titleLower.includes('chú ý')) return '⚠️'
    if (titleLower.includes('mẹo') || titleLower.includes('tip')) return '💡'
    if (titleLower.includes('kết luận') || titleLower.includes('tổng kết')) return '🎯'
    if (titleLower.includes('ưu điểm')) return '✅'
    if (titleLower.includes('nhược điểm')) return '❌'
    if (titleLower.includes('giá') || titleLower.includes('chi phí')) return '💰'
    if (titleLower.includes('thời gian')) return '⏰'
    if (titleLower.includes('địa điểm') || titleLower.includes('nơi')) return '📍'
    if (titleLower.includes('liên hệ')) return '📞'
    if (titleLower.includes('bước')) return '👉'
    return '🌿'
  }

  // Xử lý khi nhập nội dung
  const handleContentChange = (e) => {
    const newRawContent = e.target.value
    setData(prev => ({ 
      ...prev, 
      rawContent: newRawContent,
      content: editorMode === 'smart' ? autoFormatContent(newRawContent) : newRawContent
    }))
  }

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
      name: 'Gallery ảnh',
      icon: '🖼️',
      content: `<h2>Bộ sưu tập hình ảnh</h2>
<p>Khám phá bộ sưu tập ấn tượng của chúng tôi.</p>

<div class="article-gallery">
  <!-- Các ảnh sẽ được chèn tự động ở đây -->
</div>

<h3>Mô tả chi tiết</h3>
<p>Thêm mô tả về bộ sưu tập...</p>`
    },
    {
      name: 'Video hướng dẫn',
      icon: '🎬',
      content: `<h2>Video hướng dẫn</h2>
<p>Xem video để hiểu rõ hơn về chủ đề này.</p>

<div class="video-container">
  <!-- Chèn embed YouTube/video ở đây -->
</div>

<h3>Tóm tắt nội dung</h3>
<ul>
  <li>Điểm quan trọng 1</li>
  <li>Điểm quan trọng 2</li>
  <li>Điểm quan trọng 3</li>
</ul>`
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
    api.get('/articles/slug/' + id).then(r => {
      setData(r.data)
      if (r.data.images) setGalleryImages(r.data.images)
    }).catch(() => {
      api.get('/articles').then(r => {
        const a = r.data.find(x => x._id === id)
        if (a) {
          setData(a)
          if (a.images) setGalleryImages(a.images)
        }
      })
    })
  }, [id])

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const submitData = { ...data, images: galleryImages }
      if (!id || id === 'new') await api.post('/articles', submitData)
      else await api.put('/articles/' + id, submitData)
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

  // Upload nhiều ảnh cho gallery
  const handleGalleryImages = async e => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    
    const uploadedImages = []
    for (const file of files) {
      try {
        const form = new FormData()
        form.append('file', file)
        const res = await api.post('/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        uploadedImages.push(res.data.path)
      } catch (e) {
        console.error('Upload failed for:', file.name)
      }
    }
    
    setGalleryImages(prev => [...prev, ...uploadedImages])
    setUploading(false)
  }

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  // Chèn video YouTube
  const insertVideo = () => {
    const url = prompt('Nhập URL video YouTube:')
    if (!url) return
    
    // Extract video ID from YouTube URL
    let videoId = ''
    if (url.includes('youtube.com/watch')) {
      videoId = new URL(url).searchParams.get('v')
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    }
    
    if (videoId) {
      const embedCode = `
<div class="video-wrapper" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; margin: 20px 0;">
  <iframe 
    src="https://www.youtube.com/embed/${videoId}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen>
  </iframe>
</div>
`
      setData(prev => ({ ...prev, content: prev.content + embedCode }))
    } else {
      alert('URL không hợp lệ. Vui lòng nhập URL YouTube.')
    }
  }

  // Tạo gallery HTML từ ảnh đã upload
  const insertGallery = () => {
    if (galleryImages.length === 0) {
      alert('Vui lòng thêm ảnh vào gallery trước')
      return
    }
    
    const galleryHtml = `
<div class="article-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; margin: 24px 0;">
  ${galleryImages.map(img => `
  <div class="gallery-item" style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <img src="${img}" alt="Gallery image" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" />
  </div>`).join('')}
</div>
`
    setData(prev => ({ ...prev, content: prev.content + galleryHtml }))
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
      const imgTag = `
<figure style="margin: 24px 0; text-align: center;">
  <img src="${res.data.path}" alt="Hình ảnh" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
  <figcaption style="margin-top: 12px; color: #6b7280; font-style: italic;">Chú thích ảnh</figcaption>
</figure>
`
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

            {/* Gallery Images Section */}
            <div className="editor-section">
              <h2>🖼️ Thư viện ảnh</h2>
              <p className="section-desc">Thêm nhiều ảnh để tạo gallery hoặc chèn vào nội dung</p>
              
              <div className="gallery-upload-section">
                <label className="upload-zone gallery-upload">
                  <input type="file" onChange={handleGalleryImages} accept="image/*" multiple disabled={uploading} />
                  <div className="upload-content">
                    <span className="upload-icon">🖼️</span>
                    <span>{uploading ? 'Đang tải...' : 'Chọn nhiều ảnh (giữ Ctrl/Cmd)'}</span>
                  </div>
                </label>
                
                {galleryImages.length > 0 && (
                  <div className="gallery-preview-grid">
                    {galleryImages.map((img, idx) => (
                      <div key={idx} className="gallery-preview-item">
                        <img src={img} alt={`Gallery ${idx + 1}`} />
                        <button type="button" className="gallery-remove-btn" onClick={() => removeGalleryImage(idx)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                
                {galleryImages.length > 0 && (
                  <button type="button" onClick={insertGallery} className="btn-insert-gallery">
                    ➕ Chèn Gallery vào nội dung ({galleryImages.length} ảnh)
                  </button>
                )}
              </div>
            </div>

            {/* Layout Selection */}
            <div className="editor-section">
              <h2>📐 Bố cục bài viết</h2>
              <p className="section-desc">Chọn kiểu bố cục phù hợp với nội dung</p>
              
              <div className="layout-select-grid">
                {layouts.map(layout => (
                  <button 
                    key={layout.value} 
                    type="button"
                    className={`layout-option ${data.layout === layout.value ? 'active' : ''}`}
                    onClick={() => setData({ ...data, layout: layout.value })}
                  >
                    <span className="layout-icon">{layout.icon}</span>
                    <span className="layout-label">{layout.label}</span>
                    <span className="layout-desc">{layout.desc}</span>
                  </button>
                ))}
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
                  <div className="editor-mode-toggle">
                    <button 
                      type="button"
                      className={`mode-btn ${editorMode === 'smart' ? 'active' : ''}`}
                      onClick={() => setEditorMode('smart')}
                    >
                      ✨ Tự động format
                    </button>
                    <button 
                      type="button"
                      className={`mode-btn ${editorMode === 'html' ? 'active' : ''}`}
                      onClick={() => setEditorMode('html')}
                    >
                      &lt;/&gt; HTML
                    </button>
                  </div>
                </div>
              </div>

              {editorMode === 'smart' ? (
                <>
                  <div className="smart-editor-tips">
                    <div className="tip-item">
                      <span className="tip-label"># Tiêu đề</span>
                      <span className="tip-desc">Tiêu đề chính</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-label">## Tiêu đề</span>
                      <span className="tip-desc">Tiêu đề phụ</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-label">Kết thúc bằng :</span>
                      <span className="tip-desc">Cũng là tiêu đề</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-label">- hoặc *</span>
                      <span className="tip-desc">Danh sách</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-label">&gt; text</span>
                      <span className="tip-desc">Trích dẫn</span>
                    </div>
                    <div className="tip-item">
                      <span className="tip-label">**text**</span>
                      <span className="tip-desc">In đậm</span>
                    </div>
                  </div>
                  
                  <textarea 
                    ref={editorRef}
                    value={data.rawContent} 
                    onChange={handleContentChange}
                    placeholder={`Chỉ cần nhập nội dung bình thường, hệ thống sẽ tự động format đẹp!

Ví dụ:
# Giới thiệu về Hoa Hồng

Hoa hồng là loài hoa được yêu thích nhất trên thế giới. Với vẻ đẹp kiêu sa và hương thơm quyến rũ, hoa hồng luôn là lựa chọn hàng đầu cho các dịp đặc biệt.

Đặc điểm nổi bật:
- Màu sắc đa dạng từ đỏ, hồng, trắng đến vàng
- Hương thơm nhẹ nhàng, quyến rũ
- Tuổi thọ lâu khi được chăm sóc đúng cách

## Cách chăm sóc

Mẹo: Cắt tỉa gốc hoa mỗi 2 ngày để hoa tươi lâu hơn.

> "Hoa hồng - Nữ hoàng của các loài hoa"

Lưu ý: Tránh đặt hoa dưới ánh nắng trực tiếp.`}
                    className="content-textarea smart-textarea"
                  />
                </>
              ) : (
                <>
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
                      <button type="button" onClick={insertVideo} className="toolbar-btn video-btn" title="Chèn video YouTube">
                        🎬 Video
                      </button>
                      {galleryImages.length > 0 && (
                        <button type="button" onClick={insertGallery} className="toolbar-btn gallery-btn" title="Chèn gallery">
                          🖼️ Gallery
                        </button>
                      )}
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
                </>
              )}

              <div className="editor-tips">
                <span className="tip-icon">💡</span>
                {editorMode === 'smart' ? (
                  <span><strong>Mẹo:</strong> Chỉ cần nhập văn bản bình thường, hệ thống sẽ tự động tạo bố cục HTML đẹp mắt. Bấm "Xem trước" để kiểm tra kết quả.</span>
                ) : (
                  <span><strong>Mẹo:</strong> Chọn văn bản rồi bấm các nút H2, H3, B, I để định dạng nhanh. Bấm tab "Xem trước" để kiểm tra kết quả.</span>
                )}
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
