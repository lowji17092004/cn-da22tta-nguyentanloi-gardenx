import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import './AuthSimple.css'

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
      await api.post('/auth/forgot-password', { email })
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
      <div className="auth-container">
        {/* Form Card */}
        <div className="auth-card">
          {/* Logo */}
          <Link to="/" className="auth-logo">
            <div className="logo-text">
              <span className="logo-name">FLORÉA</span>
              <span className="logo-tagline">Botanica Way of Life</span>
            </div>
          </Link>

          <div className="auth-header">
            <h1>Quên mật khẩu</h1>
            <p>Nhập email để nhận mã xác nhận</p>
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
              <label>Email</label>
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
                'Gửi mã xác nhận'
              )}
            </button>
          </form>

          <Link to="/login" className="back-link">
            ← Về trang đăng nhập
          </Link>
        </div>

        {/* Back to home */}
        <Link to="/" className="back-home">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
