import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../api'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const { identifier, otp, method } = location.state || {}

  useEffect(() => {
    if (!identifier || !otp || !method) {
      navigate('/forgot-password')
    }
  }, [identifier, otp, method, navigate])

  useEffect(() => {
    // Calculate password strength
    let strength = 0
    if (newPassword.length >= 8) strength++
    if (/[a-z]/.test(newPassword)) strength++
    if (/[A-Z]/.test(newPassword)) strength++
    if (/[0-9]/.test(newPassword)) strength++
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++
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
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🌸</div>
            <h1 className="brand-title">Hoa Kiểng</h1>
            <p className="brand-tagline">Tạo mật khẩu mới</p>
          </div>
          <div className="auth-illustration">
            <div className="floating-element flower-1">🔑</div>
            <div className="floating-element flower-2">✅</div>
            <div className="floating-element leaf-1">🔒</div>
            <div className="floating-element leaf-2">🌟</div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Đặt lại mật khẩu</h2>
              <p className="auth-subtitle">
                Tạo mật khẩu mới an toàn cho tài khoản của bạn
              </p>
            </div>
            
            {success ? (
              <div className="success-animation">
                <div className="success-icon">
                  <svg width="80" height="80" fill="none" stroke="#2ecc71" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="11" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <h3>Đặt lại mật khẩu thành công!</h3>
                <p>Đang chuyển đến trang đăng nhập...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="newPassword" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Mật khẩu mới
                  </label>
                  <div className="password-input-wrapper">
                    <input 
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="form-input"
                      required 
                      minLength={8}
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
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
                      <span className="strength-label" style={{ color: strengthData.color }}>
                        {strengthData.text}
                      </span>
                    </div>
                  )}
                  <small className="form-hint">
                    Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Xác nhận mật khẩu
                  </label>
                  <div className="password-input-wrapper">
                    <input 
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="form-input"
                      required 
                    />
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirm ? (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      )}
                    </button>
                  </div>
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
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Đặt lại mật khẩu</span>
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
