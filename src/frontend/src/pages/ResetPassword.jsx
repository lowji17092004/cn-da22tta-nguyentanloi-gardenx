import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../api'
import './ResetPassword.css'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [requirements, setRequirements] = useState({
    length: false,
    lower: false,
    upper: false,
    number: false,
    special: false
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { identifier, otp, method } = location.state || {}

  useEffect(() => {
    if (!identifier || !otp || !method) {
      navigate('/forgot-password')
    }
  }, [identifier, otp, method, navigate])

  useEffect(() => {
    // Calculate password strength and requirements
    const newReqs = {
      length: newPassword.length >= 8,
      lower: /[a-z]/.test(newPassword),
      upper: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^a-zA-Z0-9]/.test(newPassword)
    }
    setRequirements(newReqs)
    
    let strength = Object.values(newReqs).filter(Boolean).length
    setPasswordStrength(strength)
  }, [newPassword])

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { text: '', color: '' }
    if (passwordStrength <= 2) return { text: 'Yếu', color: '#e74c3c' }
    if (passwordStrength <= 3) return { text: 'Trung bình', color: '#f39c12' }
    if (passwordStrength <= 4) return { text: 'Khá', color: '#3498db' }
    return { text: 'Mạnh', color: '#2ecc71' }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', { 
        identifier, 
        otp, 
        newPassword,
        method 
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  const strengthData = getStrengthLabel()

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        {/* Left Side - Illustration */}
        <div className="reset-left">
          <div className="reset-illustration">
            <div className="illustration-circle">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
            <div className="floating-icon icon-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <div className="floating-icon icon-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="floating-icon icon-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
            </div>
          </div>
          <div className="reset-text">
            <h2>Tạo mật khẩu mới</h2>
            <p>Đặt mật khẩu mạnh để bảo vệ tài khoản của bạn an toàn hơn.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="reset-right">
          <div className="reset-card">
            <div className="card-header">
              <div className="logo">
                <img src="/images/logo.png" alt="The Sun Garden Logo" className="reset-logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <h1>Đặt lại mật khẩu</h1>
              <p>Tạo mật khẩu mới an toàn cho tài khoản</p>
            </div>

            {success ? (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <h3>Đặt lại mật khẩu thành công!</h3>
                <p>Mật khẩu của bạn đã được cập nhật</p>
                <p className="redirect-text">
                  <span className="spinner"></span>
                  Đang chuyển đến trang đăng nhập...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="reset-form">
                {/* New Password */}
                <div className="form-group">
                  <label htmlFor="newPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Mật khẩu mới
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {newPassword && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength / 5) * 100}%`,
                            background: strengthData.color
                          }}
                        ></div>
                      </div>
                      <div className="strength-text">
                        <span className="strength-label" style={{ color: strengthData.color }}>
                          {strengthData.text}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  <div className="password-requirements">
                    <span className={`requirement ${requirements.length ? 'met' : ''}`}>
                      {requirements.length ? '✓' : '○'} 8+ ký tự
                    </span>
                    <span className={`requirement ${requirements.lower ? 'met' : ''}`}>
                      {requirements.lower ? '✓' : '○'} Chữ thường
                    </span>
                    <span className={`requirement ${requirements.upper ? 'met' : ''}`}>
                      {requirements.upper ? '✓' : '○'} Chữ hoa
                    </span>
                    <span className={`requirement ${requirements.number ? 'met' : ''}`}>
                      {requirements.number ? '✓' : '○'} Số
                    </span>
                    <span className={`requirement ${requirements.special ? 'met' : ''}`}>
                      {requirements.special ? '✓' : '○'} Ký tự đặc biệt
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Xác nhận mật khẩu
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Match */}
                  {confirmPassword && (
                    <div className="password-match">
                      {newPassword === confirmPassword ? (
                        <span className="match-success">✓ Mật khẩu khớp</span>
                      ) : (
                        <span className="match-error">✗ Mật khẩu không khớp</span>
                      )}
                    </div>
                  )}
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
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Đặt lại mật khẩu</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="card-footer">
              <Link to="/" className="back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Trang chủ
              </Link>
              <Link to="/login" className="back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
