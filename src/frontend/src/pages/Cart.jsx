import React, { useEffect, useRef, useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Cart.css'

export default function Cart(){
  const { items, remove, updateQuantity, total, refreshStock } = useCart()
  const navigate = useNavigate()
  const hasRefreshed = useRef(false)
  const [selectedItems, setSelectedItems] = useState([])

  // Initialize selected items when items change
  useEffect(() => {
    // Select all items by default
    setSelectedItems(items.map(item => item.product))
  }, [items.length])

  useEffect(() => {
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

  // Toggle select single item
  const toggleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Toggle select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.product))
    }
  }

  // Calculate total for selected items only
  const selectedTotal = items
    .filter(item => selectedItems.includes(item.product))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const selectedCount = selectedItems.length
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    const item = items.find(i => i.product === productId)
    const maxStock = item?.stock || 999
    if (newQuantity > maxStock) {
      alert(`Chỉ còn ${maxStock} sản phẩm trong kho`)
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
    // Store selected items in sessionStorage for checkout
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedItems))
    navigate('/checkout')
  }

  // Remove selected items
  const removeSelected = () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn sản phẩm để xóa')
      return
    }
    if (confirm(`Xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
      selectedItems.forEach(productId => remove(productId))
      setSelectedItems([])
    }
  }
  
  const shippingFee = selectedTotal >= 500000 ? 0 : 30000
  const finalTotal = selectedTotal + shippingFee
  
  return (
    <div className="cart-page">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>
      
      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link to="/shop" className="btn-shop">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Table */}
          <div className="cart-table-section">
            {/* Bulk Actions */}
            <div className="cart-bulk-actions">
              <label className="select-all-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={toggleSelectAll}
                />
                <span>Chọn tất cả ({items.length})</span>
              </label>
              {selectedItems.length > 0 && (
                <button className="btn-delete-selected" onClick={removeSelected}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa đã chọn ({selectedItems.length})
                </button>
              )}
            </div>

            <table className="cart-table">
              <thead>
                <tr>
                  <th className="th-checkbox"></th>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.product} className={selectedItems.includes(item.product) ? 'selected' : ''}>
                    <td className="td-checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedItems.includes(item.product)}
                        onChange={() => toggleSelectItem(item.product)}
                        className="item-checkbox"
                      />
                    </td>
                    <td>
                      <div className="product-cell">
                        <Link to={`/product/${item.product}`} className="product-thumb">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} />
                          ) : (
                            <span className="thumb-placeholder">🌿</span>
                          )}
                        </Link>
                        <Link to={`/product/${item.product}`} className="product-name">
                          {item.name}
                        </Link>
                      </div>
                    </td>
                    <td className="price-cell">
                      {item.price?.toLocaleString('vi-VN')}₫
                    </td>
                    <td>
                      <div className="qty-control">
                        <button 
                          onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >−</button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                          disabled={item.quantity >= (item.stock || 999)}
                        >+</button>
                      </div>
                    </td>
                    <td className="subtotal-cell">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                    </td>
                    <td>
                      <button 
                        className="btn-delete"
                        onClick={() => confirm('Xóa sản phẩm này?') && remove(item.product)}
                        title="Xóa"
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cart Summary */}
          <div className="cart-summary-section">
            <div className="summary-box">
              <h3>Tổng đơn hàng</h3>
              <div className="summary-selected">
                Đã chọn: <strong>{selectedCount}</strong> sản phẩm
              </div>
              <div className="summary-line">
                <span>Tạm tính:</span>
                <span>{selectedTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="summary-line">
                <span>Phí vận chuyển:</span>
                <span className={shippingFee === 0 ? 'free' : ''}>
                  {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                </span>
              </div>
              {selectedTotal > 0 && selectedTotal < 500000 && (
                <div className="shipping-hint">
                  Mua thêm {(500000 - selectedTotal).toLocaleString('vi-VN')}₫ để được miễn phí vận chuyển
                </div>
              )}
              <div className="summary-total">
                <span>Tổng cộng:</span>
                <span>{finalTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <button 
                className="btn-checkout" 
                onClick={handleCheckout}
                disabled={selectedCount === 0}
              >
                Thanh toán ({selectedCount} sản phẩm)
              </button>
              <Link to="/shop" className="link-continue">
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
