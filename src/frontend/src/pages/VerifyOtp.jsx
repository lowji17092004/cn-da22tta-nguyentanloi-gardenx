import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../api'

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { identifier, method } = location.state || {}

  useEffect(() => {
    if (!identifier || !method) {
      navigate('/forgot-password')
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [identifier, method, navigate])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Take only last character
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)
    document.getElementById(`otp-5`)?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ 6 số')
      setLoading(false)
      return
    }

    try {
      await api.post('/auth/verify-otp', { 
        identifier, 
        otp: otpCode, 
        method 
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { identifier, otp: otpCode, method } 
        })
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không chính xác')
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError(null)
    setLoading(true)
    setCanResend(false)
    setTimeLeft(600)

    try {
      await api.post('/auth/forgot-password', { identifier, method })
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại mã OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🌸</div>
            <h1 className="brand-title">Hoa Kiểng</h1>
            <p className="brand-tagline">Xác thực tài khoản</p>
          </div>
          <div className="auth-illustration">
            <div className="floating-element flower-1">🔢</div>
            <div className="floating-element flower-2">✨</div>
            <div className="floating-element leaf-1">🔐</div>
            <div className="floating-element leaf-2">⏱️</div>
          </div>
        </div>
        
        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Xác thực OTP</h2>
              <p className="auth-subtitle">
                Mã OTP đã được gửi đến {method === 'email' ? 'email' : 'số điện thoại'} của bạn
              </p>
              <div className="identifier-display">
                {method === 'email' ? '📧' : '📱'} {identifier}
              </div>
            </div>
            
            {success ? (
              <div className="alert alert-success">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                <span>Xác thực thành công! Đang chuyển hướng...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label className="form-label">
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Nhập mã OTP (6 số)
                  </label>
                  <div className="otp-input-group" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="otp-input"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="timer-section">
                  <div className={`timer ${timeLeft <= 60 ? 'warning' : ''}`}>
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                      <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                    </svg>
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  {canResend && (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="resend-btn"
                      disabled={loading}
                    >
                      Gửi lại mã
                    </button>
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
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Xác nhận</span>
                    </>
                  )}
                </button>
              </form>
            )}
            
            <div className="auth-divider">
              <span>hoặc</span>
            </div>
            
            <div className="auth-footer">
              <p>Chưa nhận được mã? <Link to="/forgot-password" className="auth-link">Thử lại →</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
