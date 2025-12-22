import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Notification from '../components/Notification';
import PaymentQR from '../components/PaymentQR';
import api from '../api';
import { getProvinces, getDistricts, getWards } from '../utils/vietnamProvinces';
import './CheckoutNew.css';

const Checkout = () => {
  const { items: cartItems, remove, buyNowItem, setBuyNow } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // If buyNowItem exists, use it. Otherwise use selected items from cart
  const checkoutItems = useMemo(() => {
    if (buyNowItem) {
      return [buyNowItem];
    }
    const selectedIds = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
    if (selectedIds.length === 0) return cartItems;
    return cartItems.filter(item => selectedIds.includes(item.product || item._id));
  }, [cartItems, buyNowItem]);
  
  const checkoutTotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
  }, [checkoutItems]);
  
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', fullAddress: '', isDefault: false });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderCode, setOrderCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [notification, setNotification] = useState(null);
  const [orderCreated, setOrderCreated] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');
  const [savedCoupons, setSavedCoupons] = useState([]);

  // Vietnam address states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  
  const FREE_SHIPPING_THRESHOLD = 500000;
  const SHIPPING_FEE = checkoutTotal >= FREE_SHIPPING_THRESHOLD ? 0 : 30000;
  const subtotalWithShipping = checkoutTotal + SHIPPING_FEE;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = subtotalWithShipping - discountAmount;

  const BANK_INFO = {
    bankId: '970422',
    accountNo: '0368920249',
    accountName: 'NGUYEN TAN LOI',
    template: 'compact2'
  };

  const BANKS = [
    { code: 'VCB', name: 'Vietcombank', bin: '970436' },
    { code: 'TCB', name: 'Techcombank', bin: '970407' },
    { code: 'MB', name: 'MB Bank', bin: '970422' },
    { code: 'ACB', name: 'ACB', bin: '970416' },
    { code: 'VTB', name: 'Vietinbank', bin: '970415' },
    { code: 'BIDV', name: 'BIDV', bin: '970418' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || ''
      });
      const savedAddresses = JSON.parse(localStorage.getItem(`addresses_${user.id}`) || '[]');
      setAddresses(savedAddresses);
      const defaultAddr = savedAddresses.find(a => a.isDefault);
      setSelectedAddress(defaultAddr || savedAddresses[0] || null);
      
      // Load saved coupons
      const saved = JSON.parse(localStorage.getItem(`saved_coupons_${user.id}`) || '[]');
      setSavedCoupons(saved);
      
      // Check if there's a selected coupon from Coupons page
      const selectedFromCouponsPage = sessionStorage.getItem('selectedCoupon');
      if (selectedFromCouponsPage) {
        setCouponCode(selectedFromCouponsPage);
        sessionStorage.removeItem('selectedCoupon');
        // Auto apply the coupon
        setTimeout(() => {
          applyCoupon();
        }, 500);
      }
    }

    // Load provinces
    getProvinces().then(setProvinces);
  }, [user]);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      getDistricts(selectedProvince).then(setDistricts);
      setSelectedDistrict('');
      setWards([]);
      setSelectedWard('');
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      getWards(selectedDistrict).then(setWards);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setNewAddress({ ...newAddress, [e.target.name]: e.target.value });

  const addAddress = () => {
    // Check address input method
    let addressText = '';
    if (selectedProvince && selectedDistrict && selectedWard && detailAddress) {
      // Using dropdowns
      const provinceName = provinces.find(p => p.code === parseInt(selectedProvince))?.name || '';
      const districtName = districts.find(d => d.code === parseInt(selectedDistrict))?.name || '';
      const wardName = wards.find(w => w.code === parseInt(selectedWard))?.name || '';
      addressText = `${detailAddress}, ${wardName}, ${districtName}, ${provinceName}`;
    } else {
      // Using manual input
      addressText = newAddress.fullAddress;
    }

    if (!newAddress.label || !addressText) {
      setNotification({ message: 'Vui lòng điền đầy đủ thông tin địa chỉ', type: 'warning' });
      return;
    }

    const updatedAddresses = [...addresses];
    if (newAddress.isDefault) updatedAddresses.forEach(a => a.isDefault = false);
    updatedAddresses.push({ id: Date.now(), label: newAddress.label, fullAddress: addressText, isDefault: newAddress.isDefault });
    setAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
    setSelectedAddress(updatedAddresses[updatedAddresses.length - 1]);
    setNewAddress({ label: '', fullAddress: '', isDefault: false });
    setShowAddressForm(false);
    // Reset dropdown states
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setDetailAddress('');
    setNotification({ message: 'Đã thêm địa chỉ mới', type: 'success' });
  };

  const deleteAddress = (addressId) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;
    const updatedAddresses = addresses.filter(a => a.id !== addressId);
    setAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedAddresses));
    if (selectedAddress?.id === addressId) setSelectedAddress(updatedAddresses[0] || null);
  };

  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setNotification({ message: 'Vui lòng nhập mã giảm giá', type: 'warning' });
      return;
    }

    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponCode,
        orderTotal: subtotalWithShipping
      });

      setAppliedCoupon(res.data);
      setNotification({ 
        message: `Áp dụng mã giảm giá thành công! Giảm ${formatPrice(res.data.discountAmount)}`, 
        type: 'success' 
      });
    } catch (err) {
      setNotification({ 
        message: err.response?.data?.message || 'Mã giảm giá không hợp lệ', 
        type: 'error' 
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setNotification({ message: 'Đã xóa mã giảm giá', type: 'info' });
  };

  const getProductImage = (item) => {
    const img = item.imageUrl || item.images?.[0] || item.image;
    if (!img) return '/placeholder.png';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const generateQRCode = (amount, code) => {
    const description = `FLORANA ${code}`;
    return `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNo}-${BANK_INFO.template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
  };

  const generateZaloPayQR = async (amount, code) => {
    try {
      const res = await api.post('/payments/zalopay/create', {
        amount: amount,
        orderId: code,
        items: checkoutItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.salePrice || item.price
        }))
      });
      
      if (res.data.success) {
        // ZaloPay trả về order_url để redirect hoặc qr_code
        return {
          qrUrl: res.data.qr_code || res.data.order_url,
          orderUrl: res.data.order_url,
          appTransId: res.data.app_trans_id
        };
      }
      return null;
    } catch (error) {
      console.error('ZaloPay QR error:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra có sản phẩm trong giỏ hàng
    if (checkoutItems.length === 0) {
      setNotification({ message: 'Giỏ hàng trống, vui lòng thêm sản phẩm', type: 'warning' });
      return;
    }
    
    if (!formData.fullName || !formData.phone) {
      setNotification({ message: 'Vui lòng điền họ tên và số điện thoại', type: 'warning' });
      return;
    }
    if (!selectedAddress) {
      setNotification({ message: 'Vui lòng chọn địa chỉ giao hàng', type: 'warning' });
      return;
    }
    if (showOnlinePayment && !paymentMethod) {
      setNotification({ message: 'Vui lòng chọn phương thức thanh toán trực tuyến (ZaloPay hoặc Ngân hàng)', type: 'warning' });
      return;
    }
    if (showOnlinePayment && paymentMethod === 'bank' && !selectedBank) {
      setNotification({ message: 'Vui lòng chọn ngân hàng để thanh toán', type: 'warning' });
      return;
    }

    // Nếu thanh toán trực tuyến, hiển thị QR trước, chưa tạo đơn hàng
    if (paymentMethod === 'bank' || paymentMethod === 'zalopay') {
      const tempOrderCode = Date.now().toString().slice(-8).toUpperCase();
      setOrderCode(tempOrderCode);
      
      if (paymentMethod === 'zalopay') {
        // Gọi API ZaloPay để lấy QR thực
        setLoading(true);
        const zaloPayResult = await generateZaloPayQR(finalTotal, tempOrderCode);
        setLoading(false);
        
        if (zaloPayResult && zaloPayResult.orderUrl) {
          // Redirect đến trang thanh toán ZaloPay
          window.open(zaloPayResult.orderUrl, '_blank');
          setNotification({ 
            message: 'Vui lòng hoàn tất thanh toán trên trang ZaloPay. Sau khi thanh toán xong, hãy nhấn "Đã thanh toán" để xác nhận.', 
            type: 'info' 
          });
          setShowQR(true);
          setQrCodeUrl(generateQRCode(finalTotal, tempOrderCode)); // Fallback QR
        } else {
          // Fallback về VietQR nếu ZaloPay không khả dụng
          setNotification({ 
            message: 'ZaloPay tạm thời không khả dụng. Vui lòng dùng mã QR ngân hàng bên dưới.', 
            type: 'warning' 
          });
          const qrUrl = generateQRCode(finalTotal, tempOrderCode);
          setQrCodeUrl(qrUrl);
          setShowQR(true);
        }
      } else {
        // Bank transfer - dùng VietQR
        const qrUrl = generateQRCode(finalTotal, tempOrderCode);
        setQrCodeUrl(qrUrl);
        setShowQR(true);
      }
      return;
    }

    // Chỉ tạo đơn hàng cho COD
    setLoading(true);
    try {
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        phone: formData.phone,
        address: selectedAddress.fullAddress,
        items: checkoutItems.map(item => ({
          product: item.product || item._id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity,
          image: item.imageUrl || item.images?.[0] || item.image
        })),
        total: finalTotal,
        notes: note,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        couponCode: appliedCoupon?.code || undefined
      };

      const res = await api.post('/orders', orderData);
      const newOrderId = res.data._id;
      const newOrderCode = newOrderId.slice(-8).toUpperCase();
      setOrderId(newOrderId);
      setOrderCode(newOrderCode);
      setOrderCreated(true);
      
      const selectedIds = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
      if (selectedIds.length > 0) {
        selectedIds.forEach(id => remove(id));
        sessionStorage.removeItem('checkoutItems');
      }
      
      // Clear cart after successful order
      if (buyNowItem) {
        setBuyNow(null);
      }
      
      // Redirect to order success page
      navigate(`/orders/${newOrderId}?success=true`);
    } catch (err) {
      console.error('Order error:', err);
      setNotification({ message: err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = () => {
    if (!orderCreated) return;
    const qrUrl = generateQRCode(finalTotal, orderCode);
    setQrCodeUrl(qrUrl);
    setShowQR(true);
  };

  const handlePaymentConfirm = async () => {
    // Khi xác nhận thanh toán, tạo đơn hàng
    setLoading(true);
    setShowQR(false);
    
    try {
      const orderData = {
        customerName: formData.fullName,
        customerEmail: formData.email,
        phone: formData.phone,
        address: selectedAddress.fullAddress,
        items: checkoutItems.map(item => ({
          product: item.product || item._id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.quantity,
          image: item.imageUrl || item.images?.[0] || item.image
        })),
        total: finalTotal,
        notes: note,
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        couponCode: appliedCoupon?.code || undefined
      };

      const res = await api.post('/orders', orderData);
      const newOrderId = res.data._id;
      const newOrderCode = newOrderId.slice(-8).toUpperCase();
      setOrderId(newOrderId);
      setOrderCreated(true);
      
      // Clear buyNowItem if it exists
      if (buyNowItem) {
        setBuyNow(null);
      }
      
      const selectedIds = JSON.parse(sessionStorage.getItem('checkoutItems') || '[]');
      if (selectedIds.length > 0) {
        selectedIds.forEach(id => remove(id));
        sessionStorage.removeItem('checkoutItems');
      }
      
      // Redirect to order detail with success flag
      navigate(`/orders/${newOrderId}?success=true`);
    } catch (err) {
      console.error('Order error:', err);
      setNotification({ message: err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.', type: 'error' });
      setShowQR(false);
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0 && !orderCreated) {
    return (
      <div className="checkout-new">
        <div className="checkout-empty">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Vui lòng thêm sản phẩm vào giỏ hàng</p>
          <Link to="/shop" className="btn-shop">Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-new">
      <div className="checkout-wrapper">
        <div className="checkout-header-new">
          <h1>Thanh toán</h1>
          <span className="checkout-count">{checkoutItems.length} sản phẩm</span>
        </div>

        <div className="checkout-grid">
          <div className="checkout-forms">
            {/* Customer Info */}
            <div className="form-section">
              <h3>Thông tin người nhận</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Nhập họ tên" />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Nhập SĐT" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email (không bắt buộc)" />
              </div>
            </div>

            {/* Address */}
            <div className="form-section">
              <div className="section-header">
                <h3>Địa chỉ giao hàng</h3>
                <button type="button" className="btn-add" onClick={() => setShowAddressForm(!showAddressForm)}>
                  {showAddressForm ? 'Hủy' : '+ Thêm'}
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form-inline">
                  <input type="text" name="label" value={newAddress.label} onChange={handleAddressChange} placeholder="Tên địa chỉ (VD: Nhà riêng, Công ty)" />
                  
                  <div className="address-dropdowns">
                    <select 
                      value={selectedProvince} 
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="address-select"
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map(province => (
                        <option key={province.code} value={province.code}>{province.name}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedDistrict} 
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      className="address-select"
                      disabled={!selectedProvince}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(district => (
                        <option key={district.code} value={district.code}>{district.name}</option>
                      ))}
                    </select>

                    <select 
                      value={selectedWard} 
                      onChange={(e) => setSelectedWard(e.target.value)}
                      className="address-select"
                      disabled={!selectedDistrict}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(ward => (
                        <option key={ward.code} value={ward.code}>{ward.name}</option>
                      ))}
                    </select>
                  </div>

                  <input 
                    type="text" 
                    value={detailAddress} 
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, khu vực (VD: 123 Nguyễn Văn Linh, Khu phố 5)"
                    className="detail-address-input"
                  />

                  <p className="address-hint">💡 Địa chỉ sẽ tự động được tạo từ thông tin trên</p>
                  
                  <div className="address-form-actions">
                    <label className="checkbox-inline">
                      <input type="checkbox" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} />
                      <span>Mặc định</span>
                    </label>
                    <button type="button" className="btn-save" onClick={addAddress}>Lưu</button>
                  </div>
                </div>
              )}

              <div className="address-list-new">
                {addresses.length === 0 ? (
                  <p className="no-data">Chưa có địa chỉ. Vui lòng thêm địa chỉ mới.</p>
                ) : addresses.map(addr => (
                  <div key={addr.id} className={`address-card ${selectedAddress?.id === addr.id ? 'active' : ''}`} onClick={() => setSelectedAddress(addr)}>
                    <div className="address-radio">
                      <span className={`radio-dot ${selectedAddress?.id === addr.id ? 'checked' : ''}`}></span>
                    </div>
                    <div className="address-content">
                      <div className="address-name">{addr.label}{addr.isDefault && <span className="tag-default">Mặc định</span>}</div>
                      <div className="address-detail">{addr.fullAddress}</div>
                    </div>
                    <button type="button" className="btn-delete-addr" onClick={(e) => {e.stopPropagation(); deleteAddress(addr.id);}}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className="form-section">
              <h3>Phương thức thanh toán</h3>
              <div className="payment-methods-wrapper">
                {/* Main payment options */}
                <div className="payment-options-main">
                  <div 
                    className={`payment-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => { setPaymentMethod('cod'); setShowOnlinePayment(false); }}
                  >
                    <div className="payment-icon-box cod">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="payment-info">
                      <h4>Thanh toán khi nhận hàng</h4>
                      <p>Trả tiền mặt cho shipper</p>
                    </div>
                    <div className="payment-radio">
                      <span className={`radio-check ${paymentMethod === 'cod' ? 'checked' : ''}`}></span>
                    </div>
                  </div>

                  <div 
                    className={`payment-card ${showOnlinePayment ? 'active' : ''}`}
                    onClick={() => { setShowOnlinePayment(true); setPaymentMethod('zalopay'); }}
                  >
                    <div className="payment-icon-box online">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M3 10h18M7 15h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="payment-info">
                      <h4>Thanh toán trực tuyến</h4>
                      <p>ZaloPay, Ngân hàng, Ví điện tử</p>
                    </div>
                    <div className="payment-radio">
                      <span className={`radio-check ${showOnlinePayment ? 'checked' : ''}`}></span>
                    </div>
                  </div>
                </div>

                {/* Online payment options */}
                {showOnlinePayment && (
                  <div className="online-payment-expansion">
                    <h4 className="expansion-title">Chọn phương thức thanh toán</h4>
                    
                    <div 
                      className={`payment-provider zalopay-provider ${paymentMethod === 'zalopay' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('zalopay')}
                    >
                      <div className="provider-logo">
                        <img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png" alt="ZaloPay" />
                      </div>
                      <div className="provider-info">
                        <strong>Ví ZaloPay</strong>
                        <span>Thanh toán nhanh chóng</span>
                      </div>
                      <div className="provider-radio">
                        <span className={`radio-check ${paymentMethod === 'zalopay' ? 'checked' : ''}`}></span>
                      </div>
                    </div>

                    <div 
                      className={`payment-provider bank-transfer-provider ${paymentMethod === 'bank' ? 'selected' : ''}`}
                      onClick={() => { setPaymentMethod('bank'); setSelectedBank('MB'); }}
                    >
                      <div className="provider-logo">
                        <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div className="provider-info">
                        <strong>Chuyển khoản ngân hàng</strong>
                        <span>Quét mã QR để thanh toán</span>
                      </div>
                      <div className="provider-radio">
                        <span className={`radio-check ${paymentMethod === 'bank' ? 'checked' : ''}`}></span>
                      </div>
                    </div>

                    <div className="banks-advertising">
                      <p className="banks-ad-label">Hỗ trợ các ngân hàng:</p>
                      <div className="banks-logos">
                        {BANKS.map(bank => (
                          <div key={bank.code} className="bank-logo-small">
                            <img 
                              src={`https://api.vietqr.io/img/${bank.code}.png`} 
                              alt={bank.name}
                              title={bank.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://img.vietqr.io/image/${bank.bin}-compact.png`;
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Note */}
            <div className="form-section">
              <h3>Ghi chú</h3>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho đơn hàng (không bắt buộc)" rows="2" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary">
            <div className="summary-card">
              <h3>Đơn hàng của bạn</h3>
              <div className="summary-items">
                {checkoutItems.map(item => (
                  <div className="summary-item" key={item.product || item._id}>
                    <img src={getProductImage(item)} alt={item.name} />
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <span className="item-price">{formatPrice((item.salePrice || item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="coupon-section">
                <h4>🎫 Mã giảm giá</h4>
                {!appliedCoupon ? (
                  <div className="coupon-input-group">
                    {savedCoupons.length > 0 ? (
                      <select
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="coupon-select"
                        disabled={couponLoading}
                      >
                        <option value="">Chọn mã giảm giá</option>
                        {savedCoupons.map(coupon => (
                          <option key={coupon.code} value={coupon.code}>
                            {coupon.code} - Giảm {coupon.discount}%
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá"
                        className="coupon-input"
                        disabled={couponLoading}
                      />
                    )}
                    <button
                      type="button"
                      className="btn-apply-coupon"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                    >
                      {couponLoading ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="applied-coupon">
                    <div className="coupon-badge">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="coupon-code-text">{appliedCoupon.code}</span>
                      <span className="coupon-discount">-{appliedCoupon.discount}%</span>
                    </div>
                    <button type="button" className="btn-remove-coupon" onClick={removeCoupon}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                {appliedCoupon?.description && (
                  <p className="coupon-description">{appliedCoupon.description}</p>
                )}
              </div>

              <div className="summary-totals">
                <div className="total-row"><span>Tạm tính</span><span>{formatPrice(checkoutTotal)}</span></div>
                <div className="total-row"><span>Phí vận chuyển</span><span className={SHIPPING_FEE === 0 ? 'free' : ''}>{SHIPPING_FEE === 0 ? 'Miễn phí' : formatPrice(SHIPPING_FEE)}</span></div>
                {appliedCoupon && (
                  <div className="total-row discount-row">
                    <span>Giảm giá ({appliedCoupon.discount}%)</span>
                    <span className="discount-amount">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                {checkoutTotal < FREE_SHIPPING_THRESHOLD && <div className="shipping-hint">Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - checkoutTotal)} để miễn phí ship</div>}
                <div className="total-row final"><span>Tổng cộng</span><span>{formatPrice(finalTotal)}</span></div>
              </div>

              <button className="btn-order" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <p className="order-note">Đơn hàng sẽ được Admin xác nhận trước khi giao</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment QR Modal */}
      {showQR && (
        <div className="qr-modal-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-modal qr-modal-compact" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close" onClick={() => setShowQR(false)}>×</button>
            
            {paymentMethod === 'bank' && selectedBank ? (
              <div className="bank-qr-content">
                <div className="qr-header-compact">
                  <h3>Chuyển khoản ngân hàng</h3>
                  <div className="selected-bank-badge">
                    <img src={`https://api.vietqr.io/img/${selectedBank}.png`} alt={selectedBank} />
                    <span>{BANKS.find(b => b.code === selectedBank)?.name}</span>
                  </div>
                </div>
                
                <div className="qr-body-compact">
                  <div className="qr-image-compact">
                    <img src={qrCodeUrl} alt="QR Code" />
                  </div>
                  
                  <div className="payment-details-compact">
                    <div className="detail-row">
                      <span className="label">Số tài khoản</span>
                      <strong>{BANK_INFO.accountNo}</strong>
                    </div>
                    <div className="detail-row">
                      <span className="label">Chủ tài khoản</span>
                      <strong>{BANK_INFO.accountName}</strong>
                    </div>
                    <div className="detail-row highlight">
                      <span className="label">Số tiền</span>
                      <strong className="amount">{formatPrice(finalTotal)}</strong>
                    </div>
                    <div className="detail-row highlight">
                      <span className="label">Nội dung</span>
                      <strong className="code">FLORANA {orderCode}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="qr-footer-compact">
                  <p className="note">💡 Vui lòng chuyển khoản đúng nội dung để đơn hàng được xử lý nhanh</p>
                  <button className="btn-confirm-payment" onClick={handlePaymentConfirm}>
                    Tôi đã thanh toán
                  </button>
                </div>
              </div>
            ) : (
              <div className="qr-content-new">
                <h2>Thanh toán đơn hàng</h2>
                <p className="qr-subtitle">Phương thức thanh toán</p>
                <PaymentQR
                  amount={finalTotal}
                  orderId={orderId}
                  orderCode={orderCode}
                  onPaymentComplete={handlePaymentConfirm}
                />
                <div className="qr-actions">
                  <button className="btn-confirm-payment" onClick={handlePaymentConfirm}>
                    Tôi đã thanh toán
                  </button>
                  <button className="btn-cancel-qr" onClick={() => setShowQR(false)}>Đóng</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} duration={3000} />}
    </div>
  );
};

export default Checkout;
