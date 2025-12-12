import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ')
      setLoading(false)
      return
    }

    try {
      await api.post('/auth/forgot-password', { 
        identifier: email, 
        method: 'email' 
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { identifier: email, method: 'email' } 
        })
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        {/* Left Side - Illustration */}
        <div className="forgot-left">
          <div className="forgot-illustration">
            <div className="illustration-circle">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="floating-icon icon-1">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <div className="floating-icon icon-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <div className="floating-icon icon-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
          </div>
          <div className="forgot-text">
            <h2>Quên mật khẩu?</h2>
            <p>Đừng lo, chúng tôi sẽ gửi mã xác nhận đến email của bạn để khôi phục mật khẩu.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="forgot-right">
          <div className="forgot-card">
            <div className="card-header">
              <div className="logo">
                <span className="logo-icon">🌸</span>
                <span className="logo-text">Florana</span>
              </div>
              <h1>Khôi phục mật khẩu</h1>
              <p>Nhập email đăng ký để nhận mã OTP</p>
            </div>

            {success ? (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <h3>Gửi thành công!</h3>
                <p>Mã OTP đã được gửi đến email <strong>{email}</strong></p>
                <p className="redirect-text">Đang chuyển hướng đến trang xác thực...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="forgot-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email đăng ký
                  </label>
                  <div className="input-wrapper">
                    <input 
                      id="email"
                      type="email"
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="example@email.com"
                      required 
                      autoComplete="email"
                    />
                    <span className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang gửi mã OTP...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      <span>Gửi mã xác nhận</span>
                    </>
                  )}
                </button>

                <div className="info-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  <p>Mã OTP sẽ có hiệu lực trong 10 phút. Vui lòng kiểm tra cả hộp thư spam.</p>
                </div>
              </form>
            )}

            <div className="card-footer">
              <Link to="/login" className="back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
