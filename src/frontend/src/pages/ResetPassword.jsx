import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import './AuthHorizontal.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  
  const { identifier, otp, verified, method } = location.state || {}

  // Calculate password strength
  const calculatePasswordStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++
    return Math.min(strength, 4)
  }

  const getStrengthText = (strength) => {
    if (strength === 0) return { text: '', color: '' }
    if (strength === 1) return { text: 'Yếu', color: 'weak' }
    if (strength === 2) return { text: 'Trung bình', color: 'medium' }
    if (strength === 3) return { text: 'Tốt', color: 'good' }
    return { text: 'Rất tốt', color: 'strong' }
  }

  // Redirect if not verified
  useEffect(() => {
    if (!verified || !identifier || !otp) {
      navigate('/forgot-password')
    }
  }, [verified, identifier, otp, navigate])

  // Auto redirect after success
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập.' } 
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, navigate])

  const handlePasswordChange = (value) => {
    setPassword(value)
    setPasswordStrength(calculatePasswordStrength(value))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)

    try {
      await api.post('/auth/reset-password', {
        identifier,
        otp,
        newPassword: password,
        method: method || 'email'
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container reset-container">
          {/* Success Card */}
          <div className="auth-card success-card">
            <div className="success-content">
              <div className="success-icon-wrapper">
                <div className="success-icon-bg"></div>
                <svg className="success-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2>Đặt lại mật khẩu thành công!</h2>
              <p>Mật khẩu của bạn đã được cập nhật.<br/>Đang chuyển đến trang đăng nhập...</p>
              <div className="redirect-progress"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container reset-container">
        {/* Form Card */}
        <div className="auth-card reset-card">
          {/* Visual Side */}
          <div className="auth-visual-side">
            <div className="visual-content">
              <div className="visual-icon reset-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h2 className="visual-title">Bảo mật tài khoản</h2>
              <p className="visual-desc">Tạo mật khẩu mới mạnh mẽ để bảo vệ tài khoản của bạn an toàn hơn.</p>
              
              <div className="visual-steps">
                <div className="step-item completed">
                  <div className="step-number">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>Nhập email</span>
                </div>
                <div className="step-item completed">
                  <div className="step-number">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>Xác nhận OTP</span>
                </div>
                <div className="step-item active">
                  <div className="step-number">3</div>
                  <span>Tạo mật khẩu mới</span>
                </div>
              </div>

              <div className="password-tips">
                <h4>Mẹo tạo mật khẩu mạnh:</h4>
                <ul>
                  <li>Ít nhất 8 ký tự</li>
                  <li>Kết hợp chữ hoa và thường</li>
                  <li>Thêm số và ký tự đặc biệt</li>
                </ul>
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
              <h1>Tạo mật khẩu mới</h1>
              <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
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
                <label>Mật khẩu mới</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { handlePasswordChange(e.target.value); setError(''); }}
                    placeholder="Ít nhất 8 ký tự"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div className={`strength-fill strength-${getStrengthText(passwordStrength).color}`} style={{width: `${passwordStrength * 25}%`}}></div>
                    </div>
                    <span className={`strength-text ${getStrengthText(passwordStrength).color}`}>{getStrengthText(passwordStrength).text}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <div className="input-wrapper">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && password && (
                  <div className={`password-match ${password === confirmPassword ? 'match' : 'no-match'}`}>
                    {password === confirmPassword ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Mật khẩu khớp</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Mật khẩu không khớp</>
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Đặt lại mật khẩu
                  </span>
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
