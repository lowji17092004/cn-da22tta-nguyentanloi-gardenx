import React from 'react'

const bannerData = {
  // Category-specific banners
  'category-hoa-kieng': {
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&h=500&fit=crop&q=80',
    title: 'Hoa Kiểng',
    slogan: 'Nét đẹp tinh tế, hoa vàng rực rỡ đến từ thiên nhiên',
    icon: '🌺',
    gradient: 'linear-gradient(135deg, rgba(255, 107, 157, 0.9) 0%, rgba(192, 108, 132, 0.9) 100%)'
  },
  'category-cay-canh': {
    image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1920&h=500&fit=crop&q=80',
    title: 'Cây Cảnh',
    slogan: 'Mang thiên nhiên xanh mát vào không gian sống',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, rgba(17, 153, 142, 0.9) 0%, rgba(56, 239, 125, 0.9) 100%)'
  },
  'category-cay-thuy-canh': {
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=1920&h=500&fit=crop&q=80',
    title: 'Cây Thủy Cảnh',
    slogan: 'Thế giới dưới nước tuyệt đẹp trong từng chi tiết',
    icon: '🌊',
    gradient: 'linear-gradient(135deg, rgba(0, 147, 233, 0.9) 0%, rgba(128, 208, 199, 0.9) 100%)'
  },
  'category-sen-da': {
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=1920&h=500&fit=crop&q=80',
    title: 'Sen Đá',
    slogan: 'Nhỏ nhắn xinh xắn, dễ chăm sóc, đem lại niềm vui',
    icon: '🌵',
    gradient: 'linear-gradient(135deg, rgba(248, 87, 166, 0.9) 0%, rgba(255, 88, 88, 0.9) 100%)'
  },
  
  // Subcategory banners - Hoa kiểng
  'category-hoa-hong': {
    image: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=1920&h=500&fit=crop&q=80',
    title: 'Hoa Hồng',
    slogan: 'Biểu tượng của tình yêu và sắc đẹp vượt thời gian',
    icon: '🌹',
    gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.9) 0%, rgba(251, 113, 133, 0.9) 100%)'
  },
  'category-hoa-lan': {
    image: 'https://images.unsplash.com/photo-1550927407-50e2bd128b81?w=1920&h=500&fit=crop&q=80',
    title: 'Hoa Lan',
    slogan: 'Vẻ đẹp quý phái và sang trọng của Á Đông',
    icon: '🎋',
    gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(196, 181, 253, 0.9) 100%)'
  },
  'category-hoa-cuc': {
    image: 'https://images.unsplash.com/photo-1503694978374-8a2fa686963a?w=1920&h=500&fit=crop&q=80',
    title: 'Hoa Cúc',
    slogan: 'Sự trong trắng và thuần khiết trong từng cánh hoa',
    icon: '🏵️',
    gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.9) 0%, rgba(252, 211, 77, 0.9) 100%)'
  },
  
  // Subcategory banners - Cây cảnh
  'category-cay-van-phong': {
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1920&h=500&fit=crop&q=80',
    title: 'Cây Văn Phòng',
    slogan: 'Mang không gian xanh vào nơi làm việc',
    icon: '💼',
    gradient: 'linear-gradient(135deg, rgba(5, 150, 105, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%)'
  },
  'category-cay-ngoai-troi': {
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1920&h=500&fit=crop&q=80',
    title: 'Cây Ngoại Trời',
    slogan: 'Tạo dựng khu vườn xanh tươi ngoài trời',
    icon: '🌳',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(74, 222, 128, 0.9) 100%)'
  },
  'category-cay-phong-thuy': {
    image: 'https://images.unsplash.com/photo-1463320898484-cdee8141c787?w=1920&h=500&fit=crop&q=80',
    title: 'Cây Phong Thủy',
    slogan: 'Mang lại tài lộc và may mắn cho gia đình',
    icon: '🍀',
    gradient: 'linear-gradient(135deg, rgba(217, 119, 6, 0.9) 0%, rgba(251, 191, 36, 0.9) 100%)'
  },

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
  blogPromotion: {
    image: '/images/banner-products.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=1920',
    title: 'Khuyến Mãi Đặc Biệt',
    slogan: 'Săn ngay các mã giảm giá hấp dẫn cho đơn hàng của bạn',
    icon: '🎁',
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.85) 0%, rgba(217, 119, 6, 0.9) 100%)'
  },
  
  // Shop & Orders banners
  shop: {
    image: '/images/banner-products.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&h=400&fit=crop&q=80',
    title: 'Cửa Hàng Cây Cảnh',
    slogan: 'Khám phá bộ sưu tập cây cảnh đa dạng và chất lượng cao',
    icon: '🌿',
    gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.85) 0%, rgba(22, 163, 74, 0.9) 100%)'
  },
  
  orders: {
    image: '/images/banner-products.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?w=1920&h=400&fit=crop&q=80',
    title: 'Đơn Hàng Của Bạn',
    slogan: 'Theo dõi và quản lý đơn hàng một cách dễ dàng',
    icon: '📦',
    gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.9) 100%)'
  },
  
  cart: {
    image: '/images/banner-products.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1920&h=400&fit=crop&q=80',
    title: 'Giỏ Hàng',
    slogan: 'Hoàn tất đơn hàng để nhận những sản phẩm tuyệt vời',
    icon: '🛒',
    gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.85) 0%, rgba(234, 88, 12, 0.9) 100%)'
  },
  
  default: {
    image: '/images/banner-default.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920',
    title: 'Florana',
    slogan: 'Mang thiên nhiên vào không gian sống của bạn',
    icon: '🌱'
  }
}

export default function PageBanner({ page, customTitle, customSlogan, customImage, customGradient }) {
  const data = bannerData[page] || bannerData.default
  
  const handleImageError = (e) => {
    if (data.fallbackImage) {
      e.target.src = data.fallbackImage
    }
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
      <div 
        className="page-banner-overlay"
        style={{
          background: customGradient || data.gradient || 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%)'
        }}
      ></div>
      <div className="page-banner-content">
        <h1 className="page-banner-title">{customTitle || data.title}</h1>
        <p className="page-banner-slogan">{customSlogan || data.slogan}</p>
      </div>
    </div>
  )
}
