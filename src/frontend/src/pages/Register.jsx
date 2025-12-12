import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './AuthSimple.css'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const passwordStrength = useMemo(() => {
    if (!password) return { level: 0, text: '', color: '' }
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    
    if (strength <= 1) return { level: 1, text: 'Yếu', color: '#ef4444' }
    if (strength === 2) return { level: 2, text: 'Trung bình', color: '#f59e0b' }
    if (strength === 3) return { level: 3, text: 'Tốt', color: '#10b981' }
    return { level: 4, text: 'Mạnh', color: '#059669' }
  }, [password])

  const submit = async e => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(name, email, password)
      navigate('/login')
    } catch(err) { 
      setError(err.response?.data?.message || 'Đăng ký thất bại')
      setLoading(false)
    }
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
            <img src="/images/logo.png" alt="Florana" />
          </Link>
        </div>

        {/* Card */}
        <div className="auth-simple-card">
          <div className="auth-simple-header">
            <h1>Tạo tài khoản mới</h1>
            <p>Đăng ký để bắt đầu mua sắm cùng Florana</p>
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
              <label htmlFor="name">Họ và tên</label>
              <div className="auth-simple-input-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

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
                  autoComplete="new-password"
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
              
              {/* Password strength indicator */}
              {password && (
                <div className="auth-simple-strength">
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`strength-bar ${level <= passwordStrength.level ? 'active' : ''}`}
                        style={{ backgroundColor: level <= passwordStrength.level ? passwordStrength.color : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <span className="strength-text" style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="auth-simple-submit" disabled={loading}>
              {loading ? (
                <span className="auth-simple-spinner"></span>
              ) : (
                'Tạo tài khoản'
              )}
            </button>
          </form>

          <div className="auth-simple-footer">
            <span>Đã có tài khoản?</span>
            <Link to="/login">Đăng nhập ngay</Link>
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
