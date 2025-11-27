import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import PageBanner from '../components/PageBanner'

export default function BlogInspiration(){
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles(){
    try {
      const res = await api.get('/articles?category=inspiration')
      setArticles(res.data)
    } catch(err) {
      console.error('Lỗi tải bài viết:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageBanner page="blogInspiration" />
      <div className="container">
        <div className="blog-page">
          <div className="blog-breadcrumb">
            <Link to="/articles">Blog</Link>
            <span>/</span>
            <span>Cảm hứng & Ý tưởng</span>
          </div>

          <div className="blog-page-content">
          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : articles.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">💡</span>
              <h3>Chưa có bài viết</h3>
              <p>Các bài viết về cảm hứng trang trí sẽ sớm được cập nhật.</p>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map(article => (
                <Link to={`/article/${article.slug}`} key={article._id} className="article-card-grid">
                  <div className="article-image">
                    <img src={article.featuredImage || article.images?.[0] || 'https://via.placeholder.com/400x250?text=Cảm+hứng'} alt={article.title} />
                  </div>
                  <div className="article-content">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-summary">{article.summary}</p>
                    <span className="article-date">
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  )
}
