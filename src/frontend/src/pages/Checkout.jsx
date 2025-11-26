import React, { useState, useEffect } from 'react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import api from '../api'
import { useNavigate } from 'react-router-dom'

export default function Checkout(){
  const { items, total, clear, selectedItems, selectedTotal } = useCart()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const selectedCartItems = items.filter(item => selectedItems.includes(item.product))
  const shippingFee = selectedTotal >= 500000 ? 0 : 30000
  const finalTotal = selectedTotal + shippingFee

  const submit = async e => {
    e.preventDefault()
    if (selectedCartItems.length === 0) return alert('Vui lòng chọn sản phẩm để thanh toán')
    setLoading(true)
    try{
      const res = await api.post('/orders', { 
        customerName: name, 
        customerEmail: email, 
        phone: phone,
        address: address,
        items: selectedCartItems, 
        total: finalTotal, 
        notes: note 
      })
      // Xóa các items đã checkout khỏi giỏ hàng
      selectedItems.forEach(id => {
        const itemToRemove = items.find(i => i.product === id)
        if (itemToRemove) clear() // Simplified, ideally remove only selected items
      })
      navigate('/orders')
      alert('Đặt hàng thành công! Mã đơn hàng: #' + res.data._id.slice(-8))
    }catch(e){ 
      alert('Đặt hàng thất bại: ' + (e.response?.data?.message || e.message)) 
    }
    setLoading(false)
  }

  return (
    <div className="container checkout-container">
      <div className="page-header">
        <h1>💳 Thanh toán đơn hàng</h1>
        <p>Hoàn tất thông tin để đặt hàng</p>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form">
          <h2>Thông tin người nhận</h2>
          <form onSubmit={submit}>
            <div className="form-row">
              <label>Họ và tên *</label>
              <input 
                type="text"
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Nguyễn Văn A"
                required 
              />
            </div>
            <div className="form-row">
              <label>Email *</label>
              <input 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="email@example.com"
                required 
              />
            </div>
            <div className="form-row">
              <label>Số điện thoại *</label>
              <input 
                type="tel"
                value={phone} 
                onChange={e=>setPhone(e.target.value)} 
                placeholder="0912345678"
                required 
              />
            </div>
            <div className="form-row">
              <label>Địa chỉ giao hàng *</label>
              <textarea 
                value={address} 
                onChange={e=>setAddress(e.target.value)} 
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                rows="3"
                required 
              />
            </div>
            <div className="form-row">
              <label>Ghi chú đơn hàng</label>
              <textarea 
                value={note} 
                onChange={e=>setNote(e.target.value)} 
                placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn"
                rows="3"
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary btn-lg btn-block"
              disabled={loading || selectedCartItems.length === 0}
            >
              {loading ? '⏳ Đang xử lý...' : `🛒 Đặt hàng (${selectedCartItems.length} sản phẩm)`}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Đơn hàng của bạn</h2>
          
          <div className="checkout-items">
            {selectedCartItems.map(item => (
              <div key={item.product} className="checkout-item">
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">x{item.quantity}</span>
                </div>
                <div className="checkout-item-price">
                  {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{selectedTotal?.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span className={shippingFee === 0 ? 'free-shipping' : ''}>
                {shippingFee === 0 ? 'Miễn phí' : shippingFee.toLocaleString('vi-VN') + ' ₫'}
              </span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>Tổng cộng:</span>
              <span className="total-amount">{finalTotal.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>

          <div className="checkout-notes">
            <p>🔒 Thanh toán khi nhận hàng (COD)</p>
            <p>🚚 Giao hàng trong 2-3 ngày</p>
            <p>✅ Miễn phí ship cho đơn từ 500,000₫</p>
          </div>
        </div>
      </div>
    </div>
  )
}
