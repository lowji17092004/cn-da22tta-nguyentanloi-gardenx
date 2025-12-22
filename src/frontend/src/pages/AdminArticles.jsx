import React, { useEffect, useState } from 'react';
import api from '../api';
import AdminLayout from '../components/AdminLayout';
import Toast from '../components/Toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminArticles.css';

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
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      summary: '',
      content: '<h2>Giới thiệu</h2><p>Viết đoạn giới thiệu về chủ đề bài viết của bạn...</p><h2>Nội dung chính</h2><p>Chi tiết về nội dung...</p><ul><li>Điểm quan trọng 1</li><li>Điểm quan trọng 2</li><li>Điểm quan trọng 3</li></ul><h2>Kết luận</h2><p>Tóm tắt và kết luận...</p>',
      thumbnail: ''
    });
    setEditingArticle(null);
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
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Tạo bài viết mới
          </button>
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
            <div className="modal-content article-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingArticle ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
                <button className="btn-close" onClick={handleCloseModal}>
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Tiêu đề <span className="required">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nhập tiêu đề bài viết..."
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Danh mục <span className="required">*</span></label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Ảnh đại diện</label>
                    <div className="image-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        id="thumbnail-upload"
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="thumbnail-upload" className="btn-upload-image">
                        {uploadingImage ? (
                          <>
                            <span className="spinner-small"></span>
                            <span>Đang upload...</span>
                          </>
                        ) : (
                          <>
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Chọn ảnh</span>
                          </>
                        )}
                      </label>
                      {formData.thumbnail && (
                        <div className="image-preview">
                          <img src={formData.thumbnail} alt="Preview" />
                          <button
                            type="button"
                            className="btn-remove-image"
                            onClick={() => setFormData({ ...formData, thumbnail: '' })}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Tóm tắt</label>
                    <textarea
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Nội dung <span className="required">*</span></label>
                    <div className="quill-wrapper">
                      <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Viết nội dung bài viết của bạn..."
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                    Hủy
                  </button>
                  <button type="submit" className="btn-primary">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {editingArticle ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
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
