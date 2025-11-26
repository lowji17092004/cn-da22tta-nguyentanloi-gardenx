import React, { useEffect, useRef } from 'react'
import { useCart } from '../contexts/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Cart(){
  const { items, remove, updateQuantity, total, selectedItems, selectedTotal, toggleSelect, selectAll, deselectAll, isSelected, refreshStock } = useCart()
  const navigate = useNavigate()
  const hasRefreshed = useRef(false)

  useEffect(() => {
    // Chỉ fetch stock 1 lần khi component mount
    const fetchStock = async () => {
      if (hasRefreshed.current || items.length === 0) return
      hasRefreshed.current = true
      try {
        const res = await axios.get('/api/products')
        if (res.data && refreshStock) {
          refreshStock(res.data)
        }
      } catch (err) {
        console.error('Error fetching stock:', err)
      }
    }
    fetchStock()
  }, [])
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    const item = items.find(i => i.product === productId)
    const maxStock = item?.stock || 999
    if (newQuantity > maxStock) {
      alert(`Chỉ còn ${maxStock} sản phẩm trong kho. Không thể thêm nhiều hơn!`)
      updateQuantity(productId, maxStock)
      return
    }
    updateQuantity(productId, newQuantity)
  }
  
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán')
      return
    }
    navigate('/checkout')
  }
  
  const allSelected = items.length > 0 && selectedItems.length === items.length
  
  return (
    <div className="container cart-container">
      <div className="page-header">
        <h1>🛒 Giỏ hàng của bạn</h1>
        <p>Quản lý sản phẩm và tiến hành thanh toán</p>
      </div>
      
      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link to="/shop" className="btn-primary btn-lg">
            <span>🌿 Khám phá sản phẩm</span>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            <div className="cart-header">
              <div className="cart-header-left">
                <label className="select-all-checkbox">
                  <input 
                    type="checkbox" 
                    checked={allSelected}
                    onChange={() => allSelected ? deselectAll() : selectAll()}
                  />
                  <span>Chọn tất cả ({items.length})</span>
                </label>
              </div>
              <div className="cart-header-right">
                <button 
                  className="btn-text-danger" 
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      alert('Vui lòng chọn sản phẩm để xóa')
                      return
                    }
                    if (window.confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
                      selectedItems.forEach(id => remove(id))
                    }
                  }}
                  disabled={selectedItems.length === 0}
                >
                  🗑️ Xóa đã chọn ({selectedItems.length})
                </button>
              </div>
            </div>
            {items.map(item => (
              <div key={item.product} className={`cart-item ${isSelected(item.product) ? 'selected' : ''}`}>
                <label className="cart-item-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isSelected(item.product)}
                    onChange={() => toggleSelect(item.product)}
                  />
                </label>
                <div className="cart-item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="item-placeholder">🌿</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <div className="cart-item-price">{item.price?.toLocaleString('vi-VN')} ₫</div>
                  {item.stock && (
                    <div className={`cart-stock-info ${item.stock < 10 ? 'low-stock' : ''}`}>
                      {item.stock < 10 ? (
                        <>
                          <span className="stock-icon">⚠️</span>
                          <span>Chỉ còn {item.stock} sản phẩm</span>
                        </>
                      ) : (
                        <span className="stock-text">Còn {item.stock} sản phẩm</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn quantity-btn-minus" 
                    onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <div className="quantity-display">
                    <input 
                      type="number" 
                      className="quantity-input" 
                      value={item.quantity} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        const maxStock = item.stock || 999
                        handleQuantityChange(item.product, Math.min(val, maxStock))
                      }}
                      min="1"
                      max={item.stock || 999}
                    />
                  </div>
                  <button 
                    className="quantity-btn quantity-btn-plus" 
                    onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                    disabled={item.quantity >= (item.stock || 999)}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                </div>
                <button 
                  className="cart-item-remove" 
                  onClick={() => remove(item.product)}
                  aria-label="Xóa sản phẩm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>Tổng kết đơn hàng</h2>
            <div className="summary-info">
              <span className="summary-selected-count">
                Đã chọn {selectedItems.length} / {items.length} sản phẩm
              </span>
            </div>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{selectedTotal?.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className="free-shipping">{selectedTotal >= 500000 ? 'Miễn phí' : '30,000 ₫'}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Tổng cộng:</span>
              <span className="total-amount">{(selectedTotal + (selectedTotal >= 500000 ? 0 : 30000)).toLocaleString('vi-VN')} ₫</span>
            </div>
            
            <button 
              className="btn-primary btn-lg btn-block" 
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              <span>💳 Thanh toán ({selectedItems.length} sản phẩm)</span>
            </button>
            
            <Link to="/shop" className="btn-ghost btn-block">
              <span>← Tiếp tục mua sắm</span>
            </Link>
            
            <div className="cart-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">🚚</span>
                <span>Giao hàng nhanh chóng</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔒</span>
                <span>Thanh toán bảo mật</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">✅</span>
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
