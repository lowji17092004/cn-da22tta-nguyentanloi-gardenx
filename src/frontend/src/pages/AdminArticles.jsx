import React, { useEffect, useState } from 'react';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import Toast from '../components/Toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminArticles.css';

// Article Templates
const ARTICLE_TEMPLATES = [
  {
    id: 'blank',
    name: 'Trang trắng',
    icon: '📄',
    description: 'Bắt đầu từ đầu',
    content: ''
  },
  {
    id: 'care-guide',
    name: 'Hướng dẫn chăm sóc',
    icon: '🌱',
    description: 'Hướng dẫn chăm sóc cây/hoa chi tiết',
    content: `<h2>🌿 Giới thiệu</h2>
<p>Mô tả ngắn gọn về loại cây/hoa và lý do nên chăm sóc đúng cách...</p>

<h2>💧 Tưới nước</h2>
<ul>
<li><strong>Tần suất:</strong> Mô tả tần suất tưới...</li>
<li><strong>Lượng nước:</strong> Hướng dẫn lượng nước phù hợp...</li>
<li><strong>Lưu ý:</strong> Các điểm cần chú ý khi tưới...</li>
</ul>

<h2>☀️ Ánh sáng</h2>
<p>Yêu cầu về ánh sáng và vị trí đặt cây tối ưu...</p>

<h2>🌡️ Nhiệt độ & Độ ẩm</h2>
<p>Điều kiện nhiệt độ và độ ẩm lý tưởng...</p>

<h2>🌱 Đất & Phân bón</h2>
<ul>
<li><strong>Loại đất:</strong> Đất phù hợp nhất...</li>
<li><strong>Phân bón:</strong> Loại phân và lịch bón...</li>
</ul>

<h2>⚠️ Các vấn đề thường gặp</h2>
<p>Các bệnh, sâu hại phổ biến và cách xử lý...</p>

<h2>💡 Mẹo chăm sóc</h2>
<blockquote>Chia sẻ các mẹo hữu ích từ kinh nghiệm...</blockquote>`
  },
  {
    id: 'flower-meaning',
    name: 'Ý nghĩa hoa',
    icon: '💐',
    description: 'Bài viết về ý nghĩa các loài hoa',
    content: `<h2>🌸 Nguồn gốc & Lịch sử</h2>
<p>Giới thiệu về nguồn gốc và lịch sử của loài hoa...</p>

<h2>💝 Ý nghĩa tượng trưng</h2>
<p>Trong văn hóa và truyền thống, loài hoa này tượng trưng cho...</p>
<ul>
<li><strong>Tình yêu:</strong> ...</li>
<li><strong>May mắn:</strong> ...</li>
<li><strong>Hạnh phúc:</strong> ...</li>
</ul>

<h2>🎁 Dịp tặng phù hợp</h2>
<p>Loài hoa này thường được tặng trong những dịp...</p>

<h2>🎨 Ý nghĩa theo màu sắc</h2>
<ul>
<li><strong>Đỏ:</strong> ...</li>
<li><strong>Trắng:</strong> ...</li>
<li><strong>Hồng:</strong> ...</li>
<li><strong>Vàng:</strong> ...</li>
</ul>

<h2>✨ Kết luận</h2>
<p>Tóm tắt và lời khuyên khi chọn tặng hoa...</p>`
  },
  {
    id: 'news',
    name: 'Tin tức & Khuyến mãi',
    icon: '📢',
    description: 'Thông báo tin tức, sự kiện, khuyến mãi',
    content: `<h2>🎉 Tiêu đề sự kiện</h2>
<p>Mô tả ngắn gọn về chương trình/sự kiện...</p>

<h2>📅 Thời gian</h2>
<ul>
<li><strong>Bắt đầu:</strong> Ngày/tháng/năm</li>
<li><strong>Kết thúc:</strong> Ngày/tháng/năm</li>
</ul>

<h2>🎁 Ưu đãi chi tiết</h2>
<p>Chi tiết các ưu đãi trong chương trình...</p>

<h2>📋 Điều kiện áp dụng</h2>
<ul>
<li>Điều kiện 1...</li>
<li>Điều kiện 2...</li>
</ul>

<h2>📞 Liên hệ</h2>
<p>Thông tin liên hệ để biết thêm chi tiết...</p>`
  },
  {
    id: 'inspiration',
    name: 'Cảm hứng & Ý tưởng',
    icon: '✨',
    description: 'Bài viết truyền cảm hứng, ý tưởng trang trí',
    content: `<h2>💫 Giới thiệu</h2>
<p>Mở đầu thu hút, giới thiệu chủ đề bài viết...</p>

<h2>🌟 Ý tưởng 1</h2>
<p>Mô tả ý tưởng đầu tiên với hình ảnh minh họa...</p>

<h2>🌟 Ý tưởng 2</h2>
<p>Mô tả ý tưởng thứ hai...</p>

<h2>🌟 Ý tưởng 3</h2>
<p>Mô tả ý tưởng thứ ba...</p>

<h2>💡 Mẹo thực hiện</h2>
<blockquote>Chia sẻ các mẹo giúp thực hiện ý tưởng thành công...</blockquote>

<h2>🎯 Kết luận</h2>
<p>Tóm tắt và khuyến khích độc giả thử áp dụng...</p>`
  }
];

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState('edit'); // 'edit' or 'preview'
  const [showTemplates, setShowTemplates] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    summary: '',
    content: '',
    thumbnail: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    loadCategories();
    loadArticles();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories?type=blog');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get('/articles');
      setArticles(Array.isArray(res.data?.articles) ? res.data.articles : Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error loading articles:', err);
      setToast({ type: 'error', message: 'Không thể tải danh sách bài viết' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.content) {
      setToast({ type: 'warning', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    try {
      if (editingArticle) {
        await api.put(`/articles/${editingArticle._id}`, formData);
        setToast({ type: 'success', message: 'Cập nhật bài viết thành công!' });
      } else {
        await api.post('/articles', formData);
        setToast({ type: 'success', message: 'Tạo bài viết mới thành công!' });
      }
      
      setShowModal(false);
      resetForm();
      loadArticles();
    } catch (err) {
      console.error('Error saving article:', err);
      setToast({ type: 'error', message: err.response?.data?.message || 'Lưu bài viết thất bại' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    
    try {
      await api.delete(`/articles/${id}`);
      setToast({ type: 'success', message: 'Xóa bài viết thành công!' });
      loadArticles();
    } catch (err) {
      setToast({ type: 'error', message: 'Xóa bài viết thất bại' });
    }
  };

  const handleEdit = (article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title || '',
      category: article.category || '',
      summary: article.summary || '',
      content: article.content || '',
      thumbnail: article.thumbnail || ''
    });
    setShowTemplates(false);
    setActiveEditorTab('edit');
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      summary: '',
      content: '',
      thumbnail: ''
    });
    setEditingArticle(null);
    setActiveEditorTab('edit');
    setShowTemplates(true);
  };

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      content: template.content
    }));
    setShowTemplates(false);
    setActiveEditorTab('edit');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      setToast({ type: 'error', message: 'Vui lòng chọn file ảnh' });
      return;
    }

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: 'error', message: 'Kích thước ảnh không được vượt quá 5MB' });
      return;
    }

    setUploadingImage(true);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);
      
      const res = await api.post('/upload', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData({ ...formData, thumbnail: res.data.url });
      setToast({ type: 'success', message: 'Upload ảnh thành công!' });
    } catch (err) {
      console.error('Upload error:', err);
      setToast({ type: 'error', message: 'Upload ảnh thất bại' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
    setShowTemplates(false);
  };

  // Filter and pagination
  const filteredArticles = articles
    .filter(article => {
      const matchSearch = !searchTerm || 
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.summary?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !filterCategory || article.category === filterCategory;
      return matchSearch && matchCategory;
    });

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryName = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    return cat?.name || slug;
  };

  // React Quill modules
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  return (
    <AdminLayout>
      <div className="admin-articles-page">
        {/* Header */}
        <div className="aa-header">
          <div className="aa-header-left">
            <div className="aa-icon-wrapper">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1>Quản lý Bài viết</h1>
              <p>{filteredArticles.length} bài viết</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="aa-filters">
          <div className="filter-group">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tạo bài viết
          </button>
        </div>

        {/* Articles Table */}
        {loading ? (
          <div className="aa-loading">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        ) : paginatedArticles.length === 0 ? (
          <div className="aa-empty">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3>Chưa có bài viết nào</h3>
            <p>Bắt đầu tạo bài viết đầu tiên của bạn!</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              Tạo bài viết mới
            </button>
          </div>
        ) : (
          <>
            <div className="aa-table-wrapper">
              <table className="aa-table">
                <thead>
                  <tr>
                    <th>Tiêu đề</th>
                    <th>Danh mục</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArticles.map(article => (
                    <tr key={article._id}>
                      <td>
                        <div className="article-title-cell">
                          {article.thumbnail && (
                            <img src={article.thumbnail} alt={article.title} className="article-thumbnail" />
                          )}
                          <div>
                            <strong>{article.title}</strong>
                            {article.summary && (
                              <p className="article-summary">{article.summary.substring(0, 80)}...</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{getCategoryName(article.category)}</span>
                      </td>
                      <td>{formatDate(article.createdAt)}</td>
                      <td>
                        <span className={`status-badge ${article.published ? 'published' : 'draft'}`}>
                          {article.published ? 'Đã xuất bản' : 'Nháp'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(article)}
                            title="Sửa"
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(article._id)}
                            title="Xóa"
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="aa-pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Trước
                </button>
                <div className="pagination-info">
                  Trang {currentPage} / {totalPages}
                </div>
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content article-modal-pro" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="modal-header-pro">
                <div className="modal-header-left">
                  <div className="modal-icon">
                    <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2>{editingArticle ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
                    <p className="modal-subtitle">
                      {editingArticle ? 'Cập nhật nội dung bài viết của bạn' : 'Sử dụng mẫu có sẵn hoặc bắt đầu từ đầu'}
                    </p>
                  </div>
                </div>
                <button className="btn-close-pro" onClick={handleCloseModal} title="Đóng">
                  ✕
                </button>
              </div>

              {/* Template Selection - Only show for new articles */}
              {!editingArticle && showTemplates && (
                <div className="template-section">
                  <div className="template-header">
                    <h3>🎨 Chọn mẫu bài viết</h3>
                    <p>Bắt đầu nhanh hơn với các mẫu được thiết kế sẵn</p>
                  </div>
                  <div className="template-grid">
                    {ARTICLE_TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        className="template-card"
                        onClick={() => applyTemplate(template)}
                      >
                        <span className="template-icon">{template.icon}</span>
                        <strong>{template.name}</strong>
                        <span className="template-desc">{template.description}</span>
                      </button>
                    ))}
                  </div>
                  <button className="btn-skip-template" onClick={() => setShowTemplates(false)}>
                    Bỏ qua và tự viết
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Article Form */}
              {(!showTemplates || editingArticle) && (
                <form onSubmit={handleSubmit} className="article-form-pro">
                  {/* Top Info Section */}
                  <div className="form-section-pro">
                    <div className="section-title">
                      <span className="section-number">1</span>
                      <span>Thông tin cơ bản</span>
                    </div>
                    
                    <div className="form-grid-pro">
                      <div className="form-group-pro title-group">
                        <label>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Tiêu đề bài viết <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Nhập tiêu đề thu hút người đọc..."
                          required
                          className="input-pro"
                        />
                        <span className="char-count">{formData.title.length}/100</span>
                      </div>

                      <div className="form-row-pro">
                        <div className="form-group-pro">
                          <label>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Danh mục <span className="required">*</span>
                          </label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="select-pro"
                          >
                            <option value="">Chọn danh mục</option>
                            {categories.map(cat => (
                              <option key={cat._id} value={cat.slug}>{cat.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group-pro">
                          <label>
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Ảnh đại diện
                          </label>
                          <div className="thumbnail-upload-pro">
                            {formData.thumbnail ? (
                              <div className="thumbnail-preview-pro">
                                <img src={formData.thumbnail} alt="Preview" />
                                <div className="thumbnail-overlay">
                                  <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                    className="btn-remove-thumb"
                                  >
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label htmlFor="thumbnail-upload" className="upload-zone">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  id="thumbnail-upload"
                                />
                                {uploadingImage ? (
                                  <div className="upload-loading">
                                    <span className="spinner-pro"></span>
                                    <span>Đang tải...</span>
                                  </div>
                                ) : (
                                  <>
                                    <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>Kéo thả hoặc click để tải ảnh</span>
                                    <small>PNG, JPG tối đa 5MB</small>
                                  </>
                                )}
                              </label>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="form-group-pro">
                        <label>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                          Tóm tắt
                        </label>
                        <textarea
                          value={formData.summary}
                          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                          placeholder="Viết tóm tắt ngắn gọn để thu hút người đọc (hiển thị trong danh sách bài viết)..."
                          rows="2"
                          className="textarea-pro"
                        />
                        <span className="char-count">{formData.summary.length}/200</span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="form-section-pro">
                    <div className="section-header-pro">
                      <div className="section-title">
                        <span className="section-number">2</span>
                        <span>Nội dung bài viết</span>
                      </div>
                      
                      {/* Editor Tabs */}
                      <div className="editor-tabs">
                        <button
                          type="button"
                          className={`editor-tab ${activeEditorTab === 'edit' ? 'active' : ''}`}
                          onClick={() => setActiveEditorTab('edit')}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Soạn thảo
                        </button>
                        <button
                          type="button"
                          className={`editor-tab ${activeEditorTab === 'preview' ? 'active' : ''}`}
                          onClick={() => setActiveEditorTab('preview')}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem trước
                        </button>
                      </div>
                    </div>

                    {activeEditorTab === 'edit' ? (
                      <div className="editor-wrapper-pro">
                        <ReactQuill
                          theme="snow"
                          value={formData.content}
                          onChange={(value) => setFormData({ ...formData, content: value })}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Bắt đầu viết nội dung bài viết của bạn..."
                        />
                        {!editingArticle && (
                          <button
                            type="button"
                            className="btn-show-templates"
                            onClick={() => setShowTemplates(true)}
                          >
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            Chọn mẫu khác
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="preview-wrapper-pro">
                        <div className="preview-container">
                          {formData.thumbnail && (
                            <div className="preview-thumbnail">
                              <img src={formData.thumbnail} alt="Preview" />
                            </div>
                          )}
                          <h1 className="preview-title">{formData.title || 'Tiêu đề bài viết'}</h1>
                          {formData.summary && (
                            <p className="preview-summary">{formData.summary}</p>
                          )}
                          <div className="preview-meta">
                            <span className="preview-category">
                              {getCategoryName(formData.category) || 'Danh mục'}
                            </span>
                            <span className="preview-date">
                              {new Date().toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div 
                            className="preview-content ql-editor"
                            dangerouslySetInnerHTML={{ __html: formData.content || '<p>Nội dung bài viết sẽ hiển thị ở đây...</p>' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="modal-footer-pro">
                    <div className="footer-left">
                      <span className="word-count">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {formData.content.replace(/<[^>]*>/g, '').length} ký tự
                      </span>
                    </div>
                    <div className="footer-right">
                      <button type="button" className="btn-cancel-pro" onClick={handleCloseModal}>
                        Hủy bỏ
                      </button>
                      <button type="submit" className="btn-submit-pro">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {editingArticle ? 'Cập nhật bài viết' : 'Xuất bản bài viết'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}
