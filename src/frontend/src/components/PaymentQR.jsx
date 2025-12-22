import React, { useState, useEffect } from 'react';
import api from '../api';
import './PaymentQR.css';

const PaymentQR = ({ amount, orderId, orderCode, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('vietqr'); // 'vietqr' or 'zalopay'
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [banks, setBanks] = useState([]);

  // Fetch danh sách ngân hàng
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const { data } = await api.get('/payments/banks');
        if (data.success) {
          setBanks(data.banks);
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    };
    fetchBanks();
  }, []);

  // Tạo QR code khi component mount hoặc payment method thay đổi
  useEffect(() => {
    if (amount && orderId) {
      generateQRCode();
    }
  }, [paymentMethod, amount, orderId]);

  const generateQRCode = async () => {
    setLoading(true);
    setError('');
    setQrData(null);

    try {
      let response;
      
      if (paymentMethod === 'zalopay') {
        response = await api.post('/payments/zalopay/create', {
          amount,
          orderId,
          items: [{
            itemid: orderId,
            itemname: `Đơn hàng #${orderCode}`,
            itemprice: amount,
            itemquantity: 1
          }]
        });

        if (response.data.success) {
          setQrData({
            type: 'zalopay',
            order_url: response.data.order_url,
            zp_trans_token: response.data.zp_trans_token,
            app_trans_id: response.data.app_trans_id
          });
        }
      } else {
        // VietQR
        response = await api.post('/payments/vietqr/create', {
          amount,
          orderId,
          orderCode
        });

        if (response.data.success) {
          setQrData({
            type: 'vietqr',
            qr_url: response.data.qr_url,
            bank_info: response.data.bank_info,
            description: response.data.description,
            note: response.data.note
          });
        }
      }
    } catch (err) {
      console.error('Error generating QR:', err);
      setError(err.response?.data?.message || 'Không thể tạo mã QR. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const handleCopyInfo = (text) => {
    navigator.clipboard.writeText(text);
    // Có thể thêm toast notification ở đây
  };

  return (
    <div className="payment-qr-container">
      <div className="payment-method-selector">
        <button
          className={`method-btn ${paymentMethod === 'vietqr' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('vietqr')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 8h20M2 12h20M2 16h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Chuyển khoản ngân hàng</span>
        </button>
        <button
          className={`method-btn ${paymentMethod === 'zalopay' ? 'active' : ''}`}
          onClick={() => setPaymentMethod('zalopay')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>ZaloPay</span>
        </button>
      </div>

      {loading && (
        <div className="qr-loading">
          <div className="spinner"></div>
          <p>Đang tạo mã QR...</p>
        </div>
      )}

      {error && (
        <div className="qr-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>{error}</p>
          <button className="btn-retry" onClick={generateQRCode}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && qrData && (
        <div className="qr-display">
          {qrData.type === 'vietqr' && (
            <div className="vietqr-content">
              <div className="qr-code-wrapper">
                <img src={qrData.qr_url} alt="VietQR Code" className="qr-image" />
              </div>
              
              <div className="payment-info">
                <h4>Thông tin chuyển khoản</h4>
                <div className="info-row">
                  <span className="info-label">Ngân hàng:</span>
                  <div className="info-value">
                    <strong>{qrData.bank_info.bank_name}</strong>
                    <button 
                      className="btn-copy"
                      onClick={() => handleCopyInfo(qrData.bank_info.bank_name)}
                      title="Sao chép"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="info-row">
                  <span className="info-label">Số tài khoản:</span>
                  <div className="info-value">
                    <strong>{qrData.bank_info.account_no}</strong>
                    <button 
                      className="btn-copy"
                      onClick={() => handleCopyInfo(qrData.bank_info.account_no)}
                      title="Sao chép"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="info-row">
                  <span className="info-label">Chủ tài khoản:</span>
                  <div className="info-value">
                    <strong>{qrData.bank_info.account_name}</strong>
                  </div>
                </div>
                <div className="info-row">
                  <span className="info-label">Số tiền:</span>
                  <div className="info-value amount">
                    <strong>{formatCurrency(amount)}</strong>
                    <button 
                      className="btn-copy"
                      onClick={() => handleCopyInfo(amount.toString())}
                      title="Sao chép"
                    >
                      📋
                    </button>
                  </div>
                </div>
                <div className="info-row">
                  <span className="info-label">Nội dung:</span>
                  <div className="info-value">
                    <strong className="description">{qrData.description}</strong>
                    <button 
                      className="btn-copy"
                      onClick={() => handleCopyInfo(qrData.description)}
                      title="Sao chép"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>

              <div className="payment-note">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#f59e0b" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p>{qrData.note}</p>
              </div>

              <div className="qr-instructions">
                <h5>Hướng dẫn thanh toán:</h5>
                <ol>
                  <li>Mở ứng dụng ngân hàng của bạn</li>
                  <li>Quét mã QR hoặc nhập thông tin chuyển khoản</li>
                  <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                  <li>Đơn hàng sẽ được xử lý sau khi nhận được tiền</li>
                </ol>
              </div>
            </div>
          )}

          {qrData.type === 'zalopay' && (
            <div className="zalopay-content">
              <div className="zalopay-header">
                <img 
                  src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay.png" 
                  alt="ZaloPay" 
                  className="zalopay-logo"
                />
                <div className="amount-display">
                  <span>Số tiền thanh toán:</span>
                  <strong>{formatCurrency(amount)}</strong>
                </div>
              </div>

              <div className="zalopay-iframe-wrapper">
                <iframe 
                  src={qrData.order_url}
                  title="ZaloPay Payment"
                  className="zalopay-iframe"
                  frameBorder="0"
                  allow="payment"
                />
              </div>

              <div className="qr-instructions">
                <h5>Hướng dẫn thanh toán:</h5>
                <ol>
                  <li>Quét mã QR bằng ứng dụng ZaloPay trên điện thoại</li>
                  <li>Hoặc nhấn "Mở ZaloPay" để chuyển sang app</li>
                  <li>Xác nhận thanh toán trong ứng dụng</li>
                  <li>Quay lại trang web và nhấn "Đã thanh toán"</li>
                </ol>
              </div>

              <div className="transaction-id">
                <small>Mã giao dịch: {qrData.app_trans_id}</small>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentQR;
