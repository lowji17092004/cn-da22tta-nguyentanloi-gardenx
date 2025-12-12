import React from 'react'
import { useNavigate } from 'react-router-dom'
import PageBanner from '../components/PageBanner'

export default function Articles(){
  const navigate = useNavigate()
  
  const categories = [
    {
      id: 'about',
      title: 'FLORANA',
      description: 'Giới thiệu về Florana - Cửa hàng hoa và cây cảnh uy tín hàng đầu.',
      image: '/images/hoakieng.jpg'
    },
    {
      id: 'info',
      title: 'THÔNG TIN VỀ CÂY',
      description: 'Toàn bộ hồ sơ thông tin về các loại cây cảnh gồm có hình ảnh, đặc điểm, tên khoa học...',
      image: '/images/caycanh.jpg'
    },
    {
      id: 'care',
      title: 'KIẾN THỨC & CÁCH CHĂM SÓC',
      description: 'Các bài viết hướng dẫn chăm sóc & những thông tin hữu ích về cây cảnh.',
      image: '/images/caythuycanh.jpg'
    },
    {
      id: 'inspiration',
      title: 'CẢM HỨNG & Ý TƯỞNG',
      description: 'Tổng hợp những mẹo và ý tưởng về cây giúp bạn có không gian sống lý tưởng.',
      image: '/images/senda.jpg'
    }
  ]
  
  return (
    <>
      <PageBanner page="articles" />
      <div className="container">
        <div className="blog-categories-grid">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="blog-category-card"
              onClick={() => navigate(`/articles/${cat.id}`)}
            >
              <div className="blog-card-image">
                <img src={cat.image} alt={cat.title} />
              </div>
              <div className="blog-card-content">
                <h2 className="blog-card-title">{cat.title}</h2>
                <p className="blog-card-desc">{cat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
