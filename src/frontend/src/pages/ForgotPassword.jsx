import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import './AuthHorizontal.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/forgot-password', { 
        identifier: email,
        method: 'email'
      })
      navigate('/verify-otp', { 
        state: { 
          identifier: email, 
          method: 'email',
          purpose: 'reset-password'
        } 
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container forgot-container">
        {/* Form Card */}
        <div className="auth-card forgot-card">
          {/* Visual Side */}
          <div className="auth-visual-side">
            <div className="visual-content">
              <div className="visual-icon forgot-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  <circle cx="12" cy="16" r="1"/>
                </svg>
              </div>
              <h2 className="visual-title">Quên mật khẩu?</h2>
              <p className="visual-desc">Không sao cả! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập tài khoản chỉ trong vài phút.</p>
              
              <div className="visual-steps">
                <div className="step-item active">
                  <div className="step-number">1</div>
                  <span>Nhập email</span>
                </div>
                <div className="step-item">
                  <div className="step-number">2</div>
                  <span>Xác nhận OTP</span>
                </div>
                <div className="step-item">
                  <div className="step-number">3</div>
                  <span>Tạo mật khẩu mới</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="auth-form-side">
            {/* Logo */}
            <Link to="/" className="auth-logo">
              <div className="logo-text">
                <span className="logo-name">FLORÉA</span>
                <span className="logo-tagline">Botanica Way of Life</span>
              </div>
            </Link>

            <div className="auth-header">
              <h1>Khôi phục tài khoản</h1>
              <p>Nhập địa chỉ email đã đăng ký để nhận mã xác nhận</p>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Email của bạn</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Đang gửi...
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Gửi mã xác nhận
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/login" className="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>

        {/* Back to home */}
        <Link to="/" className="back-home">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
