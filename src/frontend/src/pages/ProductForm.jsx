import React, { useEffect, useState } from 'react'
import api from '../api'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/AdminLayout'
import { suggestCategory, getSuggestionLabel, shouldAutoApply } from '../utils/autoCategorize'
import './ProductForm.css'

export default function ProductForm(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState({ 
    name:'', 
    description:'', 
    price:0, 
    category:'',
    subcategory:'', 
    stock:0,
    sold: 0, // Số lượng đã bán 
    images: [],
    isFeatured: false
  })
  const [uploading, setUploading] = useState(false)
  const [progressMap, setProgressMap] = useState({})
  const [error, setError] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categorySuggestion, setCategorySuggestion] = useState(null)
  const [showSuggestion, setShowSuggestion] = useState(false)

  useEffect(()=>{
    if (!id || id === 'new') return
    api.get('/products/' + id).then(r=> {
      setData(r.data)
      const cat = categories.find(c => c.slug === r.data.category)
      if (cat) setSelectedCategory(cat)
    }).catch(()=>{ setError('Không thể tải sản phẩm') })
  }, [id, categories])

  useEffect(() => {
    api.get('/categories?type=product').then(r => setCategories(r.data)).catch(()=>{})
  }, [])

  // Auto-suggest category when product name changes
  useEffect(() => {
    if (!data.name || data.name.length < 3) {
      setCategorySuggestion(null)
      setShowSuggestion(false)
      return
    }

    // Only suggest if category is not manually set
    if (!data.category || data.category === '') {
      const suggestion = suggestCategory(data.name, data.description)
      
      if (suggestion && suggestion.category) {
        setCategorySuggestion(suggestion)
        setShowSuggestion(true)
        
        // Auto-apply if confidence is high (for new products only)
        if ((!id || id === 'new') && shouldAutoApply(suggestion)) {
          const cat = categories.find(c => c.slug === suggestion.category)
          if (cat) {
            setSelectedCategory(cat)
            setData(prev => ({
              ...prev, 
              category: suggestion.category,
              subcategory: suggestion.subcategory || ''
            }))
          }
        }
      }
    }
  }, [data.name, data.description, data.category, categories, id])

  const submit = async e => {
    e.preventDefault()
    setError('')
    try{
      if (!id || id === 'new') await api.post('/products', data)
      else await api.put('/products/' + id, data)
      navigate('/admin/products')
    }catch(e){ setError('Lưu thất bại. Vui lòng thử lại.') }
  }

  const handleFiles = async e => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError('')
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
    }catch(err){ setError('Upload lỗi. Vui lòng thử lại.') }
    setUploading(false)
  }

  const removeImage = async (img, i) => {
    const fname = img.split('/').pop()
    try{
      await api.delete('/upload/' + fname)
    }catch(e){ /* ignore server errors, still remove locally */ }
    setData(prev => ({...prev, images: prev.images.filter((_,k)=>k!==i)}))
  }

  const applySuggestion = () => {
    if (!categorySuggestion) return
    
    const cat = categories.find(c => c.slug === categorySuggestion.category)
    if (cat) {
      setSelectedCategory(cat)
      setData(prev => ({
        ...prev,
        category: categorySuggestion.category,
        subcategory: categorySuggestion.subcategory || ''
      }))
      setShowSuggestion(false)
    }
  }

  return (
    <AdminLayout>
      <div className="form-container">
        <div className="form-header">
          <div>
            <h1 className="form-title">
              {id && id !== 'new' ? (
                <>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                  Chỉnh sửa sản phẩm
                </>
              ) : (
                <>
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" style={{verticalAlign: 'middle', marginRight: '8px'}}>
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  Tạo sản phẩm mới
                </>
              )}
            </h1>
            <p className="form-subtitle">Điền đầy đủ thông tin sản phẩm bên dưới</p>
          </div>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-ghost">
            ← Quay lại
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="admin-form">
          <div className="form-section">
            <h3 className="form-section-title">Thông tin cơ bản</h3>
            
            <div className="form-group">
              <label className="form-label">Tên sản phẩm <span className="required">*</span></label>
              <input 
                type="text"
                className="form-input" 
                value={data.name} 
                onChange={e=>setData({...data, name:e.target.value})} 
                placeholder="VD: Hoa hồng đỏ" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả sản phẩm</label>
              <textarea 
                className="form-textarea" 
                value={data.description} 
                onChange={e=>setData({...data, description:e.target.value})}
                placeholder="Mô tả chi tiết về sản phẩm..."
                rows="5"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Giá bán (VND) <span className="required">*</span></label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={data.price} 
                  onChange={e=>setData({...data, price: Number(e.target.value)})}
                  onInput={e=>e.target.value=e.target.value.replace(/^0+(?=\d)/,'')}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số lượng tồn kho <span className="required">*</span></label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={data.stock} 
                  onChange={e=>setData({...data, stock: Number(e.target.value)})}
                  onInput={e=>e.target.value=e.target.value.replace(/^0+(?=\d)/,'')}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Danh mục lớn <span className="required">*</span></label>
                
                {/* Auto-categorization suggestion banner */}
                {showSuggestion && categorySuggestion && !data.category && (
                  <div className="category-suggestion-banner">
                    <div className="suggestion-icon">🤖</div>
                    <div className="suggestion-content">
                      <div className="suggestion-title">Gợi ý danh mục tự động</div>
                      <div className="suggestion-text">
                        {getSuggestionLabel(categorySuggestion, categories)}
                      </div>
                    </div>
                    <div className="suggestion-actions">
                      <button 
                        type="button" 
                        className="btn-apply-suggestion"
                        onClick={applySuggestion}
                      >
                        ✓ Áp dụng
                      </button>
                      <button 
                        type="button" 
                        className="btn-dismiss-suggestion"
                        onClick={() => setShowSuggestion(false)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                
                <select 
                  className="form-input" 
                  value={data.category} 
                  onChange={e=>{
                    const cat = categories.find(c => c.slug === e.target.value)
                    setSelectedCategory(cat)
                    setData({...data, category:e.target.value, subcategory:''})
                    setShowSuggestion(false) // Hide suggestion when manually selected
                  }}
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Danh mục con</label>
                <select 
                  className="form-input" 
                  value={data.subcategory || ''} 
                  onChange={e=>setData({...data, subcategory:e.target.value})}
                  disabled={!selectedCategory || !selectedCategory.subcategories || selectedCategory.subcategories.length === 0}
                >
                  <option value="">-- Chọn danh mục con (tùy chọn) --</option>
                  {selectedCategory?.subcategories?.map(sub => (
                    <option key={sub._id || sub.slug} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <span className="form-hint">Chọn danh mục để phân loại sản phẩm dễ dàng</span>

            <div className="form-group">
              <label className="form-label">Gắn thẻ hiển thị</label>
              <div className="tag-checkboxes">
                <label className="checkbox-label">
                  <input 
                    type="checkbox"
                    checked={data.isFeatured || false}
                    onChange={e => setData({...data, isFeatured: e.target.checked})}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">
                    <span className="tag-icon">⭐</span>
                    <span>
                      <strong>Sản phẩm nổi bật</strong>
                      <small>Hiển thị trong mục "Sản phẩm nổi bật" ở trang chủ</small>
                    </span>
                  </span>
                </label>
              </div>
              <span className="form-hint">Đánh dấu để làm nổi bật sản phẩm trên trang chủ</span>
            </div>
          </div>

          <div className="form-section">
            <h3 className="form-section-title">Hình ảnh sản phẩm</h3>
            
            <div className="form-group">
              <label className="form-label">Chọn hình ảnh (có thể chọn nhiều)</label>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFiles}
                  accept="image/*"
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <span className="file-upload-icon">📁</span>
                  <span className="file-upload-text">Nhấn để chọn hoặc kéo thả ảnh vào đây</span>
                  <span className="file-upload-hint">Hỗ trợ: JPG, PNG, WEBP</span>
                </label>
              </div>
              {uploading && (
                <div className="upload-status">
                  <div className="spinner-small"></div>
                  <span>Đang upload hình ảnh...</span>
                </div>
              )}
            </div>

            {data.images && data.images.length > 0 && (
              <div className="image-gallery">
                {data.images.map((img, i) => (
                  <div key={i} className="image-gallery-item">
                    <img src={img} alt={`Product ${i+1}`} className="gallery-image" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(img, i)}
                      className="image-remove-btn"
                      title="Xóa ảnh"
                    >
                      ✕
                    </button>
                    {i === 0 && <span className="image-badge">Ảnh chính</span>}
                  </div>
                ))}
              </div>
            )}

            {Object.keys(progressMap).length > 0 && (
              <div className="upload-progress-list">
                {Object.keys(progressMap).map((filename) => (
                  <div key={filename} className="upload-progress-item">
                    <span className="progress-filename">{filename}</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{width: `${progressMap[filename]}%`}}
                      />
                    </div>
                    <span className="progress-percent">{progressMap[filename]}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-ghost">Hủy</button>
            <button type="submit" className="btn btn-primary">
              {id && id !== 'new' ? '💾 Lưu thay đổi' : '✨ Tạo sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
