import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import api from '../api'
import './AuthSimple.css'

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
        email: identifier, 
        otp: code 
      })
      navigate('/reset-password', { 
        state: { 
          identifier, 
          otp: code,
          verified: true 
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
      await api.post('/auth/forgot-password', { email: identifier })
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
            <h1>Xác nhận OTP</h1>
            <p>Nhập mã 6 số đã gửi đến<br/><strong>{maskEmail(identifier)}</strong></p>
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
                <span>Mã hết hạn sau <strong>{formatTime(timer)}</strong></span>
              ) : (
                <span className="expired">Mã đã hết hạn</span>
              )}
            </div>

            <button type="submit" className="auth-btn" disabled={loading || otp.some(d => !d)}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Đang xác nhận...
                </span>
              ) : (
                'Xác nhận'
              )}
            </button>

            <button 
              type="button" 
              className="resend-btn"
              onClick={handleResend}
              disabled={!canResend || loading}
            >
              {canResend ? 'Gửi lại mã' : `Gửi lại sau ${formatTime(timer)}`}
            </button>
          </form>

          <Link to="/forgot-password" className="back-link">
            ← Đổi địa chỉ email
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
