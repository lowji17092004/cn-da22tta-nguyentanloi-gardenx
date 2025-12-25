import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import PageBanner from '../components/PageBanner'
import './Articles.css'

export default function Articles(){
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Danh mục mặc định
  const defaultCategories = [
    { slug: 'huong-dan-chon-cay', name: 'Hướng dẫn chọn cây', icon: '🌱', description: 'Cách chọn cây phù hợp với không gian sống' },
    { slug: 'cham-soc-cay', name: 'Chăm sóc cây', icon: '💧', description: 'Bí quyết chăm sóc cây khỏe mạnh' },
    { slug: 'y-nghia-cay', name: 'Ý nghĩa các loại cây', icon: '🍀', description: 'Khám phá ý nghĩa phong thủy của cây' },
    { slug: 'khuyen-mai', name: 'Khuyến mãi', icon: '🎁', description: 'Tin tức khuyến mãi và sự kiện' },
    { slug: 'meo-hay', name: 'Mẹo hay', icon: '💡', description: 'Mẹo vặt hữu ích cho người yêu cây' },
    { slug: 'tin-tuc', name: 'Tin tức', icon: '📰', description: 'Cập nhật tin tức mới nhất' }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, articlesRes] = await Promise.all([
          api.get('/categories?type=blog'),
          api.get('/articles')
        ])
        
        const blogCategories = categoriesRes.data?.length > 0 
          ? categoriesRes.data 
          : defaultCategories
        
        setCategories(blogCategories)
        setArticles(Array.isArray(articlesRes.data) ? articlesRes.data : [])
      } catch(err) {
        console.error('Error fetching data:', err)
        setCategories(defaultCategories)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Lấy bài viết theo danh mục
  const getArticlesByCategory = (categorySlug) => {
    return articles.filter(a => a.category === categorySlug)
  }

  // Lấy tất cả danh mục có bài viết
  const getActiveCategories = () => {
    const categorySlugs = new Set(articles.map(a => a.category))
    const result = []
    
    categorySlugs.forEach(slug => {
      const existingCat = categories.find(c => c.slug === slug)
      if (existingCat) {
        result.push(existingCat)
      } else {
        result.push({
          slug,
          name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          icon: '📄'
        })
      }
    })
    
    return result
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <>
        <PageBanner page="articles" />
        <div className="articles-container">
          <div className="articles-loading">
            <div className="spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </>
    )
  }

  const activeCategories = getActiveCategories()
  
  return (
    <>
      <PageBanner page="articles" />
      
      <div className="articles-container">
        {/* Intro Section */}
        <div className="articles-intro">
          <h1>📚 Kiến Thức & Hướng Dẫn</h1>
          <p>Khám phá bí quyết chăm sóc cây cảnh và nhiều thông tin hữu ích</p>
        </div>

        {/* Nếu không có bài viết */}
        {articles.length === 0 ? (
          <div className="articles-empty">
            <div className="empty-icon">📝</div>
            <h2>Chưa có bài viết nào</h2>
            <p>Các bài viết hướng dẫn sẽ sớm được cập nhật!</p>
            <Link to="/shop" className="btn-shop">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <>
            {/* Hiển thị bài viết theo từng danh mục */}
            {activeCategories.map(category => {
              const categoryArticles = getArticlesByCategory(category.slug)
              if (categoryArticles.length === 0) return null
              
              return (
                <section key={category.slug} className="category-section">
                  {/* Header danh mục */}
                  <div className="category-header">
                    <div className="category-title-row">
                      <span className="category-icon">{category.icon || '📄'}</span>
                      <h2>{category.name}</h2>
                      <span className="article-count">{categoryArticles.length} bài viết</span>
                    </div>
                    {category.description && (
                      <p className="category-desc">{category.description}</p>
                    )}
                  </div>
                  
                  {/* Grid bài viết */}
                  <div className="articles-grid">
                    {categoryArticles.map(article => (
                      <Link 
                        key={article._id} 
                        to={`/huong-dan/${article.slug || article._id}`}
                        className="article-card"
                      >
                        {/* Hình ảnh */}
                        <div className="article-image">
                          {article.thumbnail || article.featuredImage ? (
                            <img 
                              src={article.thumbnail || article.featuredImage} 
                              alt={article.title} 
                            />
                          ) : (
                            <div className="image-placeholder">
                              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Nội dung */}
                        <div className="article-content">
                          <h3 className="article-title">{article.title}</h3>
                          
                          {article.summary && (
                            <p className="article-summary">
                              {article.summary.length > 120 
                                ? article.summary.substring(0, 120) + '...' 
                                : article.summary}
                            </p>
                          )}
                          
                          <div className="article-meta">
                            <span className="article-date">
                              📅 {formatDate(article.createdAt)}
                            </span>
                            <span className="read-more">Đọc tiếp →</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}

        {/* Quick Links */}
        <section className="quick-actions">
          <div className="quick-action-card">
            <span className="qa-icon">🛒</span>
            <div className="qa-content">
              <h3>Mua sắm</h3>
              <p>Khám phá bộ sưu tập cây cảnh</p>
            </div>
            <Link to="/shop" className="qa-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Mua ngay
            </Link>
          </div>
          <div className="quick-action-card">
            <span className="qa-icon">🎁</span>
            <div className="qa-content">
              <h3>Khuyến mãi</h3>
              <p>Lưu mã giảm giá hấp dẫn</p>
            </div>
            <Link to="/coupons" className="qa-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Xem ưu đãi
            </Link>
          </div>
          <div className="quick-action-card">
            <span className="qa-icon">🏪</span>
            <div className="qa-content">
              <h3>Về chúng tôi</h3>
              <p>Tìm hiểu về The Sun Garden</p>
            </div>
            <Link to="/policy/about" className="qa-btn">
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Xem ngay
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
