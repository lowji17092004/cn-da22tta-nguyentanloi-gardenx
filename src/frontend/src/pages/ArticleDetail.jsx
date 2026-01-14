import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import './ArticleDetail.css'

export default function ArticleDetail(){
  const { slug } = useParams()
  const navigate = useNavigate()
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
      about: { name: 'Floréa', link: '/articles/about' },
      info: { name: 'Thông tin cây hoa', link: '/articles/info' },
      care: { name: 'Kiến thức chăm sóc', link: '/articles/care' },
      inspiration: { name: 'Cảm hứng & Ý tưởng', link: '/articles/inspiration' },
      'khuyen-mai': { name: 'Khuyến mãi', link: '/huong-dan' },
      'tin-tuc': { name: 'Tin tức', link: '/huong-dan' },
      'meo-hay': { name: 'Mẹo hay', link: '/huong-dan' },
      'huong-dan-chon-cay': { name: 'Hướng dẫn chọn cây', link: '/huong-dan' },
      'cham-soc-cay': { name: 'Chăm sóc cây', link: '/huong-dan' },
      'y-nghia-cay': { name: 'Ý nghĩa các loại cây', link: '/huong-dan' },
      'thong-tin-cay-trong': { name: 'Thông tin cây trồng', link: '/huong-dan' },
      'kien-thuc-cham-soc': { name: 'Kiến thức chăm sóc', link: '/huong-dan' },
      'huong-dan-lua-chon': { name: 'Hướng dẫn lựa chọn', link: '/huong-dan' }
    }
    return categories[cat] || { name: cat || 'Bài viết', link: '/huong-dan' }
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
          <button 
            onClick={() => navigate(-1)}
            className="btn-back-blog"
            style={{ border: 'none', cursor: 'pointer' }}
          >
            Quay lại
          </button>
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
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/huong-dan">Hướng dẫn</Link>
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
          <button 
            onClick={() => navigate(-1)}
            className="btn-back-category"
            style={{ background: '#000', border: 'none', cursor: 'pointer' }}
          >
            ← Quay lại
          </button>
        </footer>

        {/* Promotion Card */}
        <div className="article-promo-section">
          <div className="promo-card">
            <div className="promo-icon">🎁</div>
            <div className="promo-content">
              <h3>Khuyến mãi & Ưu đãi</h3>
              <p>Nhận ngay mã giảm giá hấp dẫn cho đơn hàng của bạn!</p>
            </div>
            <Link to="/coupons" className="btn-view-promo">
              Xem ưu đãi →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
