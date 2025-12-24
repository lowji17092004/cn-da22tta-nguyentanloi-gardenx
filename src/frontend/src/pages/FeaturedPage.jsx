import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { flyToCart } from '../utils/cartAnimation';
import api from '../api';
import './FeaturedPage.css';

// Category name helper
const getCategoryName = (slug) => {
  const map = {
    'chau-cay': 'Chậu Cây',
    'cay-canh': 'Cây Cảnh',
    'hoa-kieng': 'Hoa Kiểng',
    'phu-kien': 'Phụ Kiện'
  };
  return map[slug] || slug;
};

const normalizeCategorySlug = (cat) => {
  if (!cat) return '';
  return cat.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-');
};

const FeaturedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { add, announce } = useCart();
  const [products, setProducts] = useState([]);
  const [allFiltered, setAllFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 15;  // 3 hàng x 5 cột

  // Determine which type from URL
  const isFeatured = location.pathname.includes('featured');
  const title = isFeatured ? '⭐ Sản phẩm nổi bật' : '🔥 Sản phẩm bán chạy';
  const subtitle = isFeatured 
    ? 'Những sản phẩm được yêu thích nhất tại The Sun Garden'
    : 'Những sản phẩm đã bán trên 10 đơn hàng';

  useEffect(() => {
    fetchProducts();
  }, [isFeatured]);

  useEffect(() => {
    // Update paginated products when page changes
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    setProducts(allFiltered.slice(start, end));
  }, [currentPage, allFiltered]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      let filtered;
      
      if (isFeatured) {
        // Featured: products marked as isFeatured
        filtered = res.data.filter(p => p.isFeatured === true);
      } else {
        // Bestseller: products with sold >= 10
        filtered = res.data.filter(p => (p.sold || 0) >= 10);
      }
      
      setAllFiltered(filtered);
      
      // Pagination
      const total = Math.ceil(filtered.length / productsPerPage);
      setTotalPages(total);
      setCurrentPage(1);
      
      setProducts(filtered.slice(0, productsPerPage));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (product) => {
    const img = product.imageUrl || product.images?.[0] || product.image;
    if (!img) return '/placeholder.png';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const handleAdd = (p, event) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (p.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng');
      return;
    }
    
    const productElement = event?.target?.closest('.product-card-minimal');
    if (productElement) {
      const productImage = getProductImage(p);
      flyToCart(productElement, productImage, p.name);
    }
    
    add(p, 1);
    try { announce && announce(`${p.name} đã được thêm vào giỏ`); } catch(e){}
  };

  const handleBuyNow = (p, event) => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (p.stock === 0) {
      alert('Sản phẩm hiện đang hết hàng');
      return;
    }
    
    add(p, 1);
    navigate('/checkout');
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    pages.push(
      <button
        key="prev"
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ←
      </button>
    );

    if (startPage > 1) {
      pages.push(
        <button key={1} className="pagination-btn" onClick={() => handlePageChange(1)}>
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }

    pages.push(
      <button
        key="next"
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        →
      </button>
    );

    return <div className="pagination-container">{pages}</div>;
  };

  // Render product card (same style as HomeNew)
  const renderProductCard = (p) => (
    <article key={p._id} className="product-card-minimal">
      <Link to={`/product/${p._id}`} className="product-image-link-minimal">
        <div className="product-image-wrapper-minimal">
          {p.images && p.images[0] ? (
            <img src={getProductImage(p)} alt={p.name} className="product-image-minimal" loading="lazy" />
          ) : (
            <div className="product-image-placeholder">
              <span className="placeholder-icon">🌿</span>
            </div>
          )}
          
          <div className="product-badges-minimal">
            {p.stock === 0 && (
              <span className="product-badge out-of-stock">Hết hàng</span>
            )}
            {p.isFeatured && p.stock > 0 && (
              <span className="product-badge featured">⭐ Nổi bật</span>
            )}
            {(p.sold || 0) >= 10 && p.stock > 0 && (
              <span className="product-badge bestseller">🔥 Bán chạy</span>
            )}
          </div>

          <div className="product-hover-action">
            <button 
              className="btn-add-to-cart-hover" 
              onClick={(e) => {
                e.preventDefault();
                handleAdd(p, e);
              }}
              disabled={p.stock === 0}
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        </div>
      </Link>
      
      <div className="product-info-minimal">
        {p.category && (
          <span className="product-category-tag">
            {getCategoryName(normalizeCategorySlug(p.category))}
          </span>
        )}
        
        <Link to={`/product/${p._id}`} className="product-name-link">
          <h3 className="product-name-minimal">{p.name}</h3>
        </Link>
        
        <div className="product-price-minimal">
          <span className="price-amount">{p.price?.toLocaleString('vi-VN')}₫</span>
          {p.stock > 0 && p.stock < 10 && (
            <span className="stock-indicator">Còn {p.stock}</span>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <div className="featured-page">
      <div className="featured-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quay lại
        </button>
        <h1>{title}</h1>
        <p className="subtitle">{subtitle}</p>
        {allFiltered.length > 0 && (
          <p className="products-count">{allFiltered.length} sản phẩm</p>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>Chưa có sản phẩm</h3>
          <p>Hiện tại chưa có sản phẩm {isFeatured ? 'nổi bật' : 'bán chạy'}</p>
          <Link to="/shop" className="btn-back-shop">Xem tất cả sản phẩm</Link>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(renderProductCard)}
          </div>
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default FeaturedPage;
