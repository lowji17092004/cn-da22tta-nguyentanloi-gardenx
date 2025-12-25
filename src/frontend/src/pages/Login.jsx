import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import './AuthSimple.css'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      setSuccess('Đăng nhập thành công! Đang chuyển hướng...')
      setTimeout(() => {
        const from = location.state?.from
        if (from) {
          navigate(from)
        } else if (res.user?.role === 'admin') {
          navigate('/admin/products')
        } else if (res.user?.role === 'collaborator') {
          navigate('/collaborator')
        } else {
          navigate('/')
        }
      }, 1500)
    } catch(err) { 
      setError(err.response?.data?.message || 'Đăng nhập thất bại')
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await loginWithGoogle(credentialResponse.credential)
      setSuccess('Đăng nhập Google thành công! Đang chuyển hướng...')
      setTimeout(() => {
        const from = location.state?.from
        if (from) {
          navigate(from)
        } else if (res.user?.role === 'admin') {
          navigate('/admin/products')
        } else {
          navigate('/')
        }
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập Google thất bại')
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Đăng nhập Google thất bại. Vui lòng thử lại.')
  }

  return (
    <div className="auth-simple-page">
      {/* Background decoration */}
      <div className="auth-simple-bg">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <div className="auth-simple-container">
        {/* Logo */}
        <div className="auth-simple-logo">
          <Link to="/">
            <img src="/images/logo.png" alt="The Sun Garden" />
          </Link>
        </div>

        {/* Card */}
        <div className="auth-simple-card">
          <div className="auth-simple-header">
            <h1>Chào mừng trở lại</h1>
            <p>Đăng nhập để tiếp tục mua sắm</p>
          </div>

          {error && (
            <div className="auth-simple-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={submit} className="auth-simple-form">
            <div className="auth-simple-field">
              <label htmlFor="email">Email</label>
              <div className="auth-simple-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-simple-field">
              <label htmlFor="password">Mật khẩu</label>
              <div className="auth-simple-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-simple-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="auth-simple-options">
              <Link to="/forgot-password" className="auth-simple-forgot">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="auth-simple-submit" disabled={loading}>
              {loading ? (
                <span className="auth-simple-spinner"></span>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {error && (
              <div className="auth-simple-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-simple-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {success}
              </div>
            )}

            <div className="auth-divider">
              <span>Hoặc đăng nhập với</span>
            </div>

            <div className="oauth-buttons">
              <div className="google-login-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>
          </form>

          <div className="auth-simple-footer">
            <span>Chưa có tài khoản?</span>
            <Link to="/register">Đăng ký ngay</Link>
          </div>
        </div>

        {/* Back to home */}
        <Link to="/" className="auth-simple-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
