import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import './AuthHorizontal.css'

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(600) // 10 minutes
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])
  const navigate = useNavigate()
  const location = useLocation()
  
  const { identifier, method, purpose } = location.state || {}

  // Redirect if no state
  useEffect(() => {
    if (!identifier) {
      navigate('/forgot-password')
    }
  }, [identifier, navigate])

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto submit when all filled
    if (value && index === 5 && newOtp.every(digit => digit)) {
      handleSubmit(null, newOtp.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
      setOtp(newOtp)
      
      // Focus last filled input
      const lastIndex = Math.min(pastedData.length - 1, 5)
      inputRefs.current[lastIndex]?.focus()

      // Auto submit if 6 digits pasted
      if (pastedData.length === 6) {
        handleSubmit(null, pastedData)
      }
    }
  }

  const handleSubmit = async (e, otpCode = null) => {
    if (e) e.preventDefault()
    const code = otpCode || otp.join('')
    
    if (code.length !== 6) {
      setError('Vui lòng nhập đủ 6 số')
      return
    }

    setError('')
    setLoading(true)

    try {
      await api.post('/auth/verify-otp', { 
        identifier: identifier,
        otp: code,
        method: method || 'email'
      })
      navigate('/reset-password', { 
        state: { 
          identifier, 
          otp: code,
          verified: true,
          method: method || 'email'
        } 
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Mã xác nhận không đúng')
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!canResend) return
    
    setError('')
    setLoading(true)

    try {
      await api.post('/auth/forgot-password', { 
        identifier: identifier,
        method: method || 'email'
      })
      setTimer(600)
      setCanResend(false)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã')
    } finally {
      setLoading(false)
    }
  }

  const maskEmail = (email) => {
    if (!email) return ''
    const [name, domain] = email.split('@')
    const maskedName = name.length > 2 
      ? name[0] + '***' + name[name.length - 1]
      : name[0] + '***'
    return `${maskedName}@${domain}`
  }

  return (
    <div className="auth-page">
      <div className="auth-container otp-container">
        {/* Form Card */}
        <div className="auth-card otp-card">
          {/* Visual Side */}
          <div className="auth-visual-side">
            <div className="visual-content">
              <div className="visual-icon otp-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 className="visual-title">Kiểm tra email</h2>
              <p className="visual-desc">Mã xác nhận 6 số đã được gửi đến hộp thư của bạn. Mã sẽ hết hạn sau 10 phút.</p>
              
              <div className="visual-steps">
                <div className="step-item completed">
                  <div className="step-number">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>Nhập email</span>
                </div>
                <div className="step-item active">
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
              <h1>Xác nhận OTP</h1>
              <p>Nhập mã 6 số đã gửi đến<br/><strong className="email-highlight">{maskEmail(identifier)}</strong></p>
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
              <div className="otp-inputs" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-input ${digit ? 'filled' : ''}`}
                    disabled={loading}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="otp-timer">
                {timer > 0 ? (
                  <div className="timer-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Hết hạn sau <strong>{formatTime(timer)}</strong></span>
                  </div>
                ) : (
                  <div className="timer-badge expired">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <span>Mã đã hết hạn</span>
                  </div>
                )}
              </div>

              <button type="submit" className="auth-btn" disabled={loading || otp.some(d => !d)}>
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    Đang xác nhận...
                  </span>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Xác nhận mã
                  </>
                )}
              </button>

              <button 
                type="button" 
                className="resend-btn"
                onClick={handleResend}
                disabled={!canResend || loading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                {canResend ? 'Gửi lại mã' : `Gửi lại sau ${formatTime(timer)}`}
              </button>
            </form>

            <div className="auth-footer">
              <Link to="/forgot-password" className="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Đổi địa chỉ email
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
