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
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      icon: '🌺'
    },
    {
      id: 'info',
      title: 'THÔNG TIN VỀ CÂY VÀ HOA',
      description: 'Toàn bộ hồ sơ thông tin về các loại cây cảnh gồm có hình ảnh, đặc điểm, tên khoa học...',
      image: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=800',
      icon: '🌿'
    },
    {
      id: 'care',
      title: 'KIẾN THỨC & CÁCH CHĂM SÓC',
      description: 'Các bài viết hướng dẫn chăm sóc & những thông tin hữu ích về cây cảnh.',
      image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=800',
      icon: '✨'
    },
    {
      id: 'inspiration',
      title: 'CẢM HỨNG & Ý TƯỞNG',
      description: 'Tổng hợp những mẹo và ý tưởng về cây giúp bạn có không gian sống lý tưởng.',
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=800',
      icon: '💡'
    }
  ]
  
  return (
    <>
      <PageBanner page="articles" />
      <div className="container">
        <div className="blog-categories">
        {categories.map(cat => (
          <div 
            key={cat.id} 
            className="category-card"
            onClick={() => navigate(`/articles/${cat.id}`)}
          >
            <div className="category-image">
              <img src={cat.image} alt={cat.title} />
              <div className="category-overlay">
                <span className="category-icon">{cat.icon}</span>
              </div>
            </div>
            <div className="category-content">
              <h2 className="category-title">{cat.title}</h2>
              <p className="category-description">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </>
  )
}
