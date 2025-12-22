import React, { useState } from 'react';
import './CancelOrderModal.css';

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderId }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancellationReasons = [
    { id: 'change_mind', label: '💭 Đổi ý không muốn mua nữa', value: 'Đổi ý không muốn mua nữa' },
    { id: 'wrong_product', label: '📦 Đặt nhầm sản phẩm', value: 'Đặt nhầm sản phẩm' },
    { id: 'delivery_time', label: '⏰ Thời gian giao hàng quá lâu', value: 'Thời gian giao hàng quá lâu' },
    { id: 'better_price', label: '💰 Tìm được giá tốt hơn', value: 'Tìm được giá tốt hơn' },
    { id: 'other', label: '✏️ Lý do khác', value: 'other' }
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      alert('Vui lòng chọn lý do hủy đơn');
      return;
    }

    if (selectedReason === 'other' && !customReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn');
      return;
    }

    const reason = selectedReason === 'other' ? customReason : selectedReason;
    
    setIsSubmitting(true);
    try {
      await onConfirm(orderId, reason);
      // Không gọi handleClose ở đây - để component cha xử lý việc đóng modal
    } catch (error) {
      console.error('Error cancelling order:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cancel-modal-header">
          <h2 className="cancel-modal-title">
            <span className="cancel-icon">⚠️</span>
            Hủy đơn hàng
          </h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Đóng">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="cancel-modal-body">
          <p className="cancel-modal-description">
            Bạn có chắc chắn muốn hủy đơn hàng <strong>#{orderId?.slice(-8)}</strong>?<br/>
            Vui lòng chọn lý do hủy đơn:
          </p>

          <div className="cancel-reasons">
            {cancellationReasons.map((reason) => (
              <label
                key={reason.id}
                className={`reason-option ${selectedReason === reason.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={reason.value}
                  checked={selectedReason === reason.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span className="reason-label">{reason.label}</span>
                <span className="checkmark">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </span>
              </label>
            ))}
          </div>

          {selectedReason === 'other' && (
            <div className="custom-reason-container">
              <label htmlFor="customReason" className="custom-reason-label">
                Nhập lý do của bạn:
              </label>
              <textarea
                id="customReason"
                className="custom-reason-input"
                placeholder="Vui lòng mô tả chi tiết lý do hủy đơn..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows="3"
                maxLength="200"
              />
              <span className="char-count">{customReason.length}/200</span>
            </div>
          )}
        </div>

        <div className="cancel-modal-footer">
          <button 
            className="btn-secondary" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span>Không, giữ đơn</span>
          </button>
          <button 
            className="btn-confirm-cancel" 
            onClick={handleSubmit}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <span>Xác nhận hủy đơn</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
