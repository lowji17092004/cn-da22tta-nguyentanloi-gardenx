import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('')
  const [method, setMethod] = useState('email') // 'email' or 'sms'
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/auth/forgot-password', { identifier, method })
      setSuccess(true)
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { identifier, method } 
        })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🌸</div>
            <h1 className="brand-title">Hoa Kiểng</h1>
            <p className="brand-tagline">Khôi phục tài khoản của bạn</p>
          </div>
          <div className="auth-illustration">
            <div className="floating-element flower-1">🔑</div>
            <div className="floating-element flower-2">🔐</div>
            <div className="floating-element leaf-1">💌</div>
            <div className="floating-element leaf-2">📱</div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Quên mật khẩu?</h2>
              <p className="auth-subtitle">
                Chọn phương thức nhận mã OTP để đặt lại mật khẩu
              </p>
            </div>
            
            {success ? (
              <div className="alert alert-success">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Mã OTP đã được gửi! Đang chuyển hướng...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-13c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
                    </svg>
                    Phương thức nhận OTP
                  </label>
                  <div className="method-selector">
                    <button
                      type="button"
                      className={`method-btn ${method === 'email' ? 'active' : ''}`}
                      onClick={() => setMethod('email')}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                      <span>Email</span>
                    </button>
                    <button
                      type="button"
                      className={`method-btn ${method === 'sms' ? 'active' : ''}`}
                      onClick={() => setMethod('sms')}
                    >
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                      </svg>
                      <span>SMS</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="identifier" className="form-label">
                    {method === 'email' ? (
                      <>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                        </svg>
                        Email đăng ký
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                        </svg>
                        Số điện thoại đăng ký
                      </>
                    )}
                  </label>
                  <input 
                    id="identifier"
                    type={method === 'email' ? 'email' : 'tel'}
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)} 
                    placeholder={method === 'email' ? 'your@email.com' : '0912345678'}
                    className="form-input"
                    required 
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn-auth" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      <span>Gửi mã OTP</span>
                    </>
                  )}
                </button>
              </form>
            )}
            
            <div className="auth-divider">
              <span>hoặc</span>
            </div>
            
            <div className="auth-footer">
              <p>Đã nhớ mật khẩu? <Link to="/login" className="auth-link">Đăng nhập ngay →</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
