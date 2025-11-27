import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api'

export default function ArticleDetail(){
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticle()
  }, [slug])

  async function loadArticle(){
    try {
      const res = await api.get(`/articles/slug/${slug}`)
      setArticle(res.data)
    } catch(err) {
      console.error('Lỗi tải bài viết:', err)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (cat) => {
    const categories = {
      about: { name: 'Florana', link: '/articles/about' },
      info: { name: 'Thông tin cây hoa', link: '/articles/info' },
      care: { name: 'Kiến thức chăm sóc', link: '/articles/care' },
      inspiration: { name: 'Cảm hứng & Ý tưởng', link: '/articles/inspiration' }
    }
    return categories[cat] || categories.info
  }

  if (loading) {
    return (
      <div className="article-detail-page">
        <div className="article-loading">
          <div className="loading-spinner"></div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="article-detail-page">
        <div className="article-not-found">
          <h2>Không tìm thấy bài viết</h2>
          <p>Bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/articles" className="btn-back-blog">Quay lại Blog</Link>
        </div>
      </div>
    )
  }

  const catInfo = getCategoryInfo(article.category)
  const featuredImg = article.featuredImage || article.images?.[0]

  return (
    <div className="article-detail-page">
      {/* Hero Section */}
      {featuredImg && (
        <div className="article-hero">
          <img src={featuredImg} alt={article.title} />
          <div className="hero-overlay"></div>
        </div>
      )}

      <div className="article-container">
        {/* Breadcrumb */}
        <nav className="article-breadcrumb">
          <Link to="/articles">Blog</Link>
          <span className="separator">/</span>
          <Link to={catInfo.link}>{catInfo.name}</Link>
        </nav>

        {/* Article Content */}
        <article className="article-content-wrapper">
          <header className="article-header">
            <span className="article-category">{catInfo.name}</span>
            <h1>{article.title}</h1>
            {article.summary && (
              <p className="article-lead">{article.summary}</p>
            )}
            <div className="article-meta">
              <time>
                {new Date(article.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
          </header>

          {/* Main Content - Rendered as HTML */}
          <div 
            className="article-body"
            dangerouslySetInnerHTML={{ __html: article.content || '<p>Chưa có nội dung.</p>' }}
          />
        </article>

        {/* Footer Navigation */}
        <footer className="article-footer">
          <Link to={catInfo.link} className="btn-back-category">
            ← Xem thêm bài viết trong {catInfo.name}
          </Link>
          <Link to="/articles" className="btn-all-articles">
            Tất cả bài viết
          </Link>
        </footer>
      </div>
    </div>
  )
}
