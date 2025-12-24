import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import PageBanner from '../components/PageBanner'
import CouponDisplay from '../components/CouponDisplay'
import './Articles.css'

export default function Articles(){
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // Default static categories as fallback
  const defaultCategories = [
    {
      slug: 'about',
      name: 'Về The Sun Garden',
      description: 'Giới thiệu về The Sun Garden - Cửa hàng hoa và cây cảnh uy tín hàng đầu.',
      image: '/images/hoakieng.jpg',
      icon: '🏪'
    },
    {
      slug: 'info',
      name: 'Thông tin cây cảnh',
      description: 'Toàn bộ hồ sơ thông tin về các loại cây cảnh gồm có hình ảnh, đặc điểm, tên khoa học...',
      image: '/images/caycanh.jpg',
      icon: '🌿'
    },
    {
      slug: 'care',
      name: 'Hướng dẫn chăm sóc',
      description: 'Các bài viết hướng dẫn chăm sóc & những thông tin hữu ích về cây cảnh.',
      image: '/images/caythuycanh.jpg',
      icon: '💧'
    },
    {
      slug: 'inspiration',
      name: 'Cảm hứng & Ý tưởng',
      description: 'Tổng hợp những mẹo và ý tưởng về cây giúp bạn có không gian sống lý tưởng.',
      image: '/images/senda.jpg',
      icon: '✨'
    }
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, articlesRes] = await Promise.all([
          api.get('/categories?type=blog'),
          api.get('/articles')
        ])
        
        // Use API categories if available, otherwise use defaults
        const blogCategories = categoriesRes.data.length > 0 
          ? categoriesRes.data 
          : defaultCategories
        
        setCategories(blogCategories)
        setArticles(articlesRes.data || [])
      } catch(err) {
        console.error('Error fetching data:', err)
        setCategories(defaultCategories)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter articles by selected category
  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category === selectedCategory)
    : articles

  // Get article count for each category
  const getArticleCount = (categorySlug) => {
    return articles.filter(a => a.category === categorySlug).length
  }

  // Get latest articles
  const latestArticles = [...articles]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  const getCategoryIcon = (slug) => {
    const icons = {
      'about': '🏪',
      'info': '🌿',
      'care': '💧',
      'inspiration': '✨'
    }
    return icons[slug] || '📖'
  }

  if (loading) {
    return (
      <>
        <PageBanner page="articles" />
        <div className="container">
          <div className="articles-loading">
            <div className="spinner"></div>
            <p>Đang tải...</p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <PageBanner page="articles" />
      <div className="container">
        <div className="articles-page-new">
          
          {/* Hero Section */}
          <div className="guides-hero">
            <div className="guides-hero-content">
              <span className="guides-hero-badge">📚 Trung tâm hướng dẫn</span>
              <h1>Kiến thức & Hướng dẫn</h1>
              <p>Khám phá bí quyết chăm sóc cây cảnh, ý nghĩa các loài hoa và nhiều thông tin hữu ích khác</p>
            </div>
          </div>

          {/* Categories Grid */}
          <section className="guides-categories-section">
            <div className="section-header-new">
              <h2>🗂️ Danh mục hướng dẫn</h2>
              <p>Chọn chủ đề bạn quan tâm</p>
            </div>
            
            <div className="guides-categories-grid">
              {categories.map((cat, index) => (
                <div 
                  key={cat._id || cat.slug} 
                  className="guide-category-card"
                  onClick={() => setSelectedCategory(cat.slug)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="guide-category-icon">
                    {cat.icon || getCategoryIcon(cat.slug)}
                  </div>
                  <div className="guide-category-info">
                    <h3>{cat.name}</h3>
                    <p>{cat.description || `Khám phá các bài viết về ${cat.name}`}</p>
                  </div>
                  <div className="guide-category-meta">
                    <span className="guide-article-count">{getArticleCount(cat.slug)} bài viết</span>
                    <span className="guide-arrow">→</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Promotions Section */}
          <section className="promotions-section">
            <CouponDisplay />
          </section>

          {/* Latest Articles */}
          {latestArticles.length > 0 && !selectedCategory && (
            <section className="latest-articles-section">
              <div className="section-header-new">
                <h2>📰 Bài viết mới nhất</h2>
                <p>Cập nhật những thông tin hữu ích nhất</p>
              </div>
              
              <div className="latest-articles-grid">
                {latestArticles.map((article, index) => (
                  <Link 
                    key={article._id} 
                    to={`/article/${article.slug || article._id}`}
                    className={`latest-article-card ${index === 0 ? 'featured' : ''}`}
                  >
                    <div className="latest-article-image">
                      {article.thumbnail || article.images?.[0] ? (
                        <img 
                          src={article.thumbnail || article.images?.[0]} 
                          alt={article.title} 
                        />
                      ) : (
                        <div className="article-placeholder">
                          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="latest-article-category">
                        {categories.find(c => c.slug === article.category)?.name || article.category}
                      </span>
                    </div>
                    <div className="latest-article-content">
                      <h3>{article.title}</h3>
                      <p>{article.summary || article.content?.replace(/<[^>]*>/g, '').substring(0, 120)}...</p>
                      <div className="latest-article-footer">
                        <span className="article-date-new">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(article.createdAt)}
                        </span>
                        <span className="read-more-new">Đọc thêm →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Category Filter View */}
          {selectedCategory && (
            <section className="filtered-articles-section">
              <div className="filter-header">
                <button className="back-btn" onClick={() => setSelectedCategory('')}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại
                </button>
                <h2>
                  {categories.find(c => c.slug === selectedCategory)?.name}
                  <span className="filter-count">({filteredArticles.length} bài viết)</span>
                </h2>
              </div>

              {filteredArticles.length > 0 ? (
                <div className="filtered-articles-grid">
                  {filteredArticles.map(article => (
                    <Link 
                      key={article._id} 
                      to={`/article/${article.slug || article._id}`}
                      className="filtered-article-card"
                    >
                      <div className="filtered-article-image">
                        {article.thumbnail || article.images?.[0] ? (
                          <img src={article.thumbnail || article.images?.[0]} alt={article.title} />
                        ) : (
                          <div className="article-placeholder">
                            <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="filtered-article-content">
                        <h3>{article.title}</h3>
                        <p>{article.summary || article.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                        <span className="article-date-new">
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(article.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="articles-empty-new">
                  <div className="empty-icon">📝</div>
                  <h3>Chưa có bài viết</h3>
                  <p>Danh mục này chưa có bài viết nào</p>
                </div>
              )}
            </section>
          )}

          {/* Quick Links */}
          <section className="quick-links-section">
            <div className="quick-links-grid">
              <div className="quick-link-card">
                <div className="quick-link-icon">🛒</div>
                <h3>Mua sắm</h3>
                <p>Khám phá bộ sưu tập cây cảnh đa dạng</p>
                <Link to="/shop" className="quick-link-btn">Xem sản phẩm</Link>
              </div>
              <div className="quick-link-card">
                <div className="quick-link-icon">💬</div>
                <h3>Hỗ trợ</h3>
                <p>Cần tư vấn? Liên hệ với chúng tôi</p>
                <button 
                  onClick={() => {
                    // Find and click chat bubble button to open chat
                    const chatBubble = document.querySelector('.chat-bubble-button');
                    if (chatBubble) chatBubble.click();
                  }} 
                  className="quick-link-btn"
                >
                  Liên hệ ngay
                </button>
              </div>
              <div className="quick-link-card">
                <div className="quick-link-icon">🎁</div>
                <h3>Khuyến mãi</h3>
                <p>Xem các chương trình ưu đãi mới nhất</p>
                <a href="/coupons" className="quick-link-btn">Xem ưu đãi</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
