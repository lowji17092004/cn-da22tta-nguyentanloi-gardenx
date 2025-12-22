import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import PageBanner from '../components/PageBanner'
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
      name: 'FLORANA',
      description: 'Giới thiệu về Florana - Cửa hàng hoa và cây cảnh uy tín hàng đầu.',
      image: '/images/hoakieng.jpg'
    },
    {
      slug: 'info',
      name: 'THÔNG TIN VỀ CÂY',
      description: 'Toàn bộ hồ sơ thông tin về các loại cây cảnh gồm có hình ảnh, đặc điểm, tên khoa học...',
      image: '/images/caycanh.jpg'
    },
    {
      slug: 'care',
      name: 'KIẾN THỨC & CÁCH CHĂM SÓC',
      description: 'Các bài viết hướng dẫn chăm sóc & những thông tin hữu ích về cây cảnh.',
      image: '/images/caythuycanh.jpg'
    },
    {
      slug: 'inspiration',
      name: 'CẢM HỨNG & Ý TƯỞNG',
      description: 'Tổng hợp những mẹo và ý tưởng về cây giúp bạn có không gian sống lý tưởng.',
      image: '/images/senda.jpg'
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
        <div className="container">
          <div className="articles-loading">
            <div className="spinner"></div>
            <p>Đang tải bài viết...</p>
          </div>
        </div>
      </>
    )
  }
  
  return (
    <>
      <PageBanner page="articles" />
      <div className="container">
        <div className="articles-page">
          {/* Category Tabs */}
          <div className="articles-categories">
            <button 
              className={`category-tab ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Tất cả
              <span className="tab-count">{articles.length}</span>
            </button>
            {categories.map(cat => (
              <button 
                key={cat._id || cat.slug}
                className={`category-tab ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
                <span className="tab-count">{getArticleCount(cat.slug)}</span>
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <div className="articles-grid">
              {filteredArticles.map(article => (
                <Link 
                  key={article._id} 
                  to={`/article/${article.slug || article._id}`}
                  className="article-card"
                >
                  <div className="article-image">
                    {article.images?.[0] || article.image ? (
                      <img src={article.images?.[0] || article.image} alt={article.title} />
                    ) : (
                      <div className="article-no-image">
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                    {article.category && (
                      <span className="article-category-badge">
                        {categories.find(c => c.slug === article.category)?.name || article.category}
                      </span>
                    )}
                  </div>
                  <div className="article-content">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">
                      {article.excerpt || article.content?.substring(0, 150)}...
                    </p>
                    <div className="article-meta">
                      <span className="article-date">
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(article.createdAt)}
                      </span>
                      <span className="article-read-more">
                        Đọc tiếp →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="articles-empty">
              <div className="empty-icon">📝</div>
              <h3>Chưa có bài viết nào</h3>
              <p>Hiện tại chưa có bài viết trong danh mục này</p>
            </div>
          )}

          {/* Featured Categories - Show when no category selected */}
          {!selectedCategory && categories.length > 0 && (
            <div className="featured-categories">
              <h2 className="section-title">Khám phá theo chủ đề</h2>
              <div className="blog-categories-grid">
                {categories.map(cat => (
                  <div 
                    key={cat._id || cat.slug} 
                    className="blog-category-card"
                    onClick={() => setSelectedCategory(cat.slug)}
                  >
                    <div className="blog-category-image">
                      <img 
                        src={cat.image || `/images/${cat.slug}.jpg`} 
                        alt={cat.name}
                        onError={(e) => { e.target.src = '/images/hoakieng.jpg' }}
                      />
                    </div>
                    <div className="blog-card-content">
                      <h2 className="blog-card-title">{cat.name}</h2>
                      <p className="blog-card-desc">{cat.description || `Khám phá các bài viết về ${cat.name}`}</p>
                      <span className="blog-card-count">{getArticleCount(cat.slug)} bài viết</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
