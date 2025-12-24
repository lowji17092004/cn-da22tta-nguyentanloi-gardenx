import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import PageBanner from '../components/PageBanner'
import CouponDisplay from '../components/CouponDisplay'

export default function BlogFlorana(){
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles(){
    try {
      const res = await api.get('/articles')
      setArticles(res.data)
    } catch(err) {
      console.error('Lỗi tải bài viết:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageBanner page="blogFlorana" />
      <div className="container">
        <div className="blog-page">
          <div className="blog-breadcrumb">
            <Link to="/articles">Hướng dẫn</Link>
            <span>/</span>
            <span>The Sun Garden</span>
          </div>

          <div className="blog-page-content">
          {loading ? (
            <div className="loading-spinner">Đang tải...</div>
          ) : articles.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>Chưa có bài viết</h3>
              <p>Các bài viết về The Sun Garden sẽ sớm được cập nhật.</p>
            </div>
          ) : (
            <div className="articles-grid">
              {articles.map(article => (
                <Link to={`/article/${article.slug}`} key={article._id} className="article-card-grid">
                  <div className="article-image">
                    <img src={article.featuredImage || article.images?.[0] || 'https://via.placeholder.com/400x250?text=TheSunGarden'} alt={article.title} />
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
