import React from 'react'

const bannerData = {
  shop: {
    image: '/images/banner-shop.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920',
    title: 'Cửa Hàng Hoa Kiểng',
    slogan: 'Khám phá vẻ đẹp thiên nhiên - Mang sắc xanh vào cuộc sống',
    icon: '🌺'
  },
  cart: {
    image: '/images/banner-cart.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920',
    title: 'Giỏ Hàng Của Bạn',
    slogan: 'Những chậu cây xinh đẹp đang chờ đợi bạn mang về nhà',
    icon: '🛒'
  },
  articles: {
    image: '/images/banner-blog.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=1920',
    title: 'Kiến Thức & Hướng Dẫn',
    slogan: 'Khám phá bí quyết chăm sóc cây cảnh và tạo không gian xanh lý tưởng',
    icon: '📚'
  },
  orders: {
    image: '/images/banner-orders.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1920',
    title: 'Đơn Hàng Của Bạn',
    slogan: 'Theo dõi và quản lý đơn hàng một cách dễ dàng',
    icon: '📦'
  },
  checkout: {
    image: '/images/banner-checkout.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1920',
    title: 'Thanh Toán',
    slogan: 'Hoàn tất đơn hàng và nhận cây cảnh tươi đẹp tận nhà',
    icon: '💳'
  },
  productDetail: {
    image: '/images/banner-product.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=1920',
    title: 'Chi Tiết Sản Phẩm',
    slogan: 'Khám phá vẻ đẹp và đặc điểm của từng loại cây',
    icon: '🌿'
  },
  blogFlorana: {
    image: '/images/banner-florana.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1920',
    title: 'Về Florana',
    slogan: 'Câu chuyện về đam mê và tình yêu với thiên nhiên',
    icon: '🌸'
  },
  blogInfo: {
    image: '/images/banner-info.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1920',
    title: 'Thông Tin Cây & Hoa',
    slogan: 'Tìm hiểu đặc điểm và nguồn gốc các loại cây cảnh',
    icon: '🌿'
  },
  blogCare: {
    image: '/images/banner-care.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920',
    title: 'Kiến Thức Chăm Sóc',
    slogan: 'Hướng dẫn chi tiết để cây luôn khỏe mạnh và tươi tốt',
    icon: '✨'
  },
  blogInspiration: {
    image: '/images/banner-inspiration.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=1920',
    title: 'Cảm Hứng & Ý Tưởng',
    slogan: 'Ý tưởng trang trí không gian xanh cho ngôi nhà của bạn',
    icon: '💡'
  },
  default: {
    image: '/images/banner-default.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920',
    title: 'Florana',
    slogan: 'Mang thiên nhiên vào không gian sống của bạn',
    icon: '🌱'
  }
}

export default function PageBanner({ page, customTitle, customSlogan, customImage }) {
  const data = bannerData[page] || bannerData.default
  
  const handleImageError = (e) => {
    e.target.src = data.fallbackImage
  }

  return (
    <div className="page-banner">
      <div className="page-banner-bg">
        <img 
          src={customImage || data.image} 
          alt={customTitle || data.title}
          onError={handleImageError}
        />
      </div>
      <div className="page-banner-overlay"></div>
      <div className="page-banner-content">
        <h1 className="page-banner-title">{customTitle || data.title}</h1>
        <p className="page-banner-slogan">{customSlogan || data.slogan}</p>
      </div>
    </div>
  )
}
