import React, { useState } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setSearchParams({ mode: mode === 'login' ? 'register' : 'login' })
    setError(null)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setPhone('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await login(email, password)
        const from = location.state?.from
        if (from) {
          navigate(from)
        } else if (res.user?.role === 'admin') {
          navigate('/admin/products')
        } else {
          navigate('/')
        }
      } else {
        // Validate password requirements for registration
        if (password.length < 8) {
          setError('Mật khẩu phải có ít nhất 8 ký tự')
          setLoading(false)
          return
        }
        if (!/[A-Z]/.test(password)) {
          setError('Mật khẩu phải có ít nhất 1 chữ cái viết hoa')
          setLoading(false)
          return
        }
        if (!/[a-z]/.test(password)) {
          setError('Mật khẩu phải có ít nhất 1 chữ cái viết thường')
          setLoading(false)
          return
        }
        if (!/[0-9]/.test(password)) {
          setError('Mật khẩu phải có ít nhất 1 chữ số')
          setLoading(false)
          return
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
          setError('Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)')
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp')
          setLoading(false)
          return
        }
        await register({ name, email, password, phone })
        await login(email, password)
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.message || (mode === 'login' ? 'Đăng nhập thất bại' : 'Đăng ký thất bại'))
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-container">
      <div className={`auth-wrapper ${mode === 'register' ? 'register-mode' : ''}`}>
        {/* Animated Background */}
        <div className="auth-bg-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>

        {/* Left Panel - Branding */}
        <div className="auth-panel auth-brand-panel">
          <div className="brand-content">
            <div className="brand-logo-large">
              <img src="/images/logo.png" alt="Hoa Kiểng Logo" />
            </div>
            <h1 className="brand-title-large">Hoa Kiểng</h1>
            <p className="brand-description">
              Mang vẻ đẹp thiên nhiên vào không gian sống của bạn. 
              Khám phá bộ sưu tập hoa và cây cảnh độc đáo.
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Sản phẩm chất lượng cao</span>
              </div>
              <div className="feature-item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Giao hàng nhanh chóng</span>
              </div>
              <div className="feature-item">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Hỗ trợ chăm sóc 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="auth-panel auth-form-panel">
          <div className="auth-forms-container">
            {/* Login Form */}
            <div className={`auth-form-wrapper login-form ${mode === 'login' ? 'active' : ''}`}>
              <div className="auth-form-header">
                <h2>Chào mừng trở lại</h2>
                <p>Đăng nhập để tiếp tục mua sắm</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="login-email" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="form-input"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Mật khẩu
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {error && mode === 'login' && (
                  <div className="alert alert-error">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn-auth" disabled={loading && mode === 'login'}>
                  {loading && mode === 'login' ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </>
                  )}
                </button>

                <div className="auth-divider">
                  <span>Hoặc đăng nhập với</span>
                </div>

                <div className="oauth-buttons">
                  <button type="button" className="btn-oauth btn-google" onClick={() => alert('Tính năng đăng nhập Google đang được phát triển')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button type="button" className="btn-oauth btn-facebook" onClick={() => alert('Tính năng đăng nhập Facebook đang được phát triển')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </form>

              <div className="auth-toggle">
                <p>Chưa có tài khoản?</p>
                <button type="button" className="toggle-btn" onClick={toggleMode}>
                  Đăng ký ngay
                </button>
              </div>
            </div>

            {/* Register Form */}
            <div className={`auth-form-wrapper register-form ${mode === 'register' ? 'active' : ''}`}>
              <div className="auth-form-header">
                <h2>Tạo tài khoản mới</h2>
                <p>Tham gia cùng chúng tôi ngay hôm nay</p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="register-name" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    Họ và tên
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="form-input"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Email
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="form-input"
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-phone" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                    </svg>
                    Số điện thoại
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0368920249"
                    className="form-input"
                    autoComplete="tel"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Mật khẩu
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  
                  {/* Password Requirements Checklist */}
                  {password && (
                    <div className="password-requirements">
                      <p className="requirements-title">Yêu cầu mật khẩu:</p>
                      <ul className="requirements-list">
                        <li className={password.length >= 8 ? 'valid' : 'invalid'}>
                          {password.length >= 8 ? '✓' : '✗'} Ít nhất 8 ký tự
                        </li>
                        <li className={/[A-Z]/.test(password) ? 'valid' : 'invalid'}>
                          {/[A-Z]/.test(password) ? '✓' : '✗'} Ít nhất 1 chữ hoa (A-Z)
                        </li>
                        <li className={/[a-z]/.test(password) ? 'valid' : 'invalid'}>
                          {/[a-z]/.test(password) ? '✓' : '✗'} Ít nhất 1 chữ thường (a-z)
                        </li>
                        <li className={/[0-9]/.test(password) ? 'valid' : 'invalid'}>
                          {/[0-9]/.test(password) ? '✓' : '✗'} Ít nhất 1 chữ số (0-9)
                        </li>
                        <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'valid' : 'invalid'}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? '✓' : '✗'} Ít nhất 1 ký tự đặc biệt (!@#$...)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="register-confirm-password" className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Xác nhận mật khẩu
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {error && mode === 'register' && (
                  <div className="alert alert-error">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="btn-auth" disabled={loading && mode === 'register'}>
                  {loading && mode === 'register' ? (
                    <>
                      <span className="spinner"></span>
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng ký</span>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                      </svg>
                    </>
                  )}
                </button>

                <div className="auth-divider">
                  <span>Hoặc đăng ký với</span>
                </div>

                <div className="oauth-buttons">
                  <button type="button" className="btn-oauth btn-google" onClick={() => alert('Tính năng đăng ký Google đang được phát triển')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button type="button" className="btn-oauth btn-facebook" onClick={() => alert('Tính năng đăng ký Facebook đang được phát triển')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                    </svg>
                    <span>Facebook</span>
                  </button>
                </div>
              </form>

              <div className="auth-toggle">
                <p>Đã có tài khoản?</p>
                <button type="button" className="toggle-btn" onClick={toggleMode}>
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
