import React, { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

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
    e.preventDefault(); setError(null); setLoading(true)
    try{
      await register(name, email, password)
      navigate('/login')
    }catch(err){ 
      setError(err.response?.data?.message || 'Đăng ký thất bại')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🌿</div>
            <h1 className="brand-title">Hoa Kiểng</h1>
            <p className="brand-tagline">Tạo tài khoản để trải nghiệm mua sắm tuyệt vời</p>
          </div>
          <div className="auth-illustration">
            <div className="floating-element flower-1">🌺</div>
            <div className="floating-element flower-2">🌻</div>
            <div className="floating-element leaf-1">🍃</div>
            <div className="floating-element leaf-2">🌿</div>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <div className="feature-icon">✨</div>
              <div className="feature-text">
                <h4>Sản phẩm đa dạng</h4>
                <p>Hàng trăm loại hoa và cây kiểng</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚚</div>
              <div className="feature-text">
                <h4>Giao hàng nhanh</h4>
                <p>Miễn phí ship cho đơn trên 500k</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎁</div>
              <div className="feature-text">
                <h4>Ưu đãi thành viên</h4>
                <p>Nhận ngay voucher khi đăng ký</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Tạo tài khoản mới</h2>
              <p className="auth-subtitle">Bắt đầu hành trình mua sắm của bạn</p>
            </div>
            
            <form onSubmit={submit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Họ và tên
                </label>
                <input 
                  id="name"
                  type="text"
                  value={name} 
                  onChange={e=>setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="form-input"
                  required 
                  autoComplete="name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  Email
                </label>
                <input 
                  id="email"
                  type="email"
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="form-input"
                  required 
                  autoComplete="email"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                  Mật khẩu
                </label>
                <div className="password-input-wrapper">
                  <input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password} 
                    onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    required 
                    autoComplete="new-password"
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
                {password && (
                  <div className="password-strength">
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
                      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                    </svg>
                    <span>Tạo tài khoản</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="auth-divider">
              <span>hoặc</span>
            </div>
            
            <div className="auth-footer">
              <p>Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập ngay →</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
