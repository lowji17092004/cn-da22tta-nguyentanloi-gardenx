import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../api'
import './VerifyOtp.css'

export default function VerifyOtp() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false)
  const [resending, setResending] = useState(false)
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
    setResending(true)
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
      setResending(false)
    }
  }

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-container">
        {/* Left Side - Illustration */}
        <div className="verify-left">
          <div className="verify-illustration">
            <div className="illustration-circle">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <circle cx="12" cy="16" r="1"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="floating-icon icon-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <div className="floating-icon icon-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <div className="floating-icon icon-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
          </div>
          <div className="verify-text">
            <h2>Xác thực OTP</h2>
            <p>Nhập mã 6 số đã được gửi đến email của bạn để tiếp tục.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="verify-right">
          <div className="verify-card">
            <div className="card-header">
              <div className="logo">
                <img src="/images/logo.png" alt="The Sun Garden Logo" className="verify-logo-img" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <h1>Nhập mã OTP</h1>
              <p>Mã xác thực đã được gửi đến email</p>
            </div>

            {/* Identifier Display */}
            <div className="identifier-box">
              <div className="icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <div className="info">
                <p>Gửi đến</p>
                <strong>{identifier}</strong>
              </div>
            </div>

            {success ? (
              <div className="success-state">
                <div className="success-icon">
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                </div>
                <h3>Xác thực thành công!</h3>
                <p>Bạn sẽ được chuyển đến trang đặt lại mật khẩu</p>
                <p className="redirect-text">
                  <span className="spinner"></span>
                  Đang chuyển hướng...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="verify-form">
                {/* OTP Input */}
                <div className="otp-section">
                  <div className="otp-label">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    <span>Nhập mã OTP (6 số)</span>
                  </div>
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

                {/* Timer Section */}
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
                      disabled={resending}
                    >
                      {resending ? (
                        <>
                          <span className="spinner"></span>
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi lại mã'
                      )}
                    </button>
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
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Xác nhận mã OTP</span>
                    </>
                  )}
                </button>

                <div className="info-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                  <p>Mã OTP có hiệu lực trong 10 phút. Vui lòng kiểm tra cả hộp thư spam nếu không thấy email.</p>
                </div>
              </form>
            )}

            <div className="card-footer">
              <Link to="/" className="back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                Trang chủ
              </Link>
              <Link to="/forgot-password" className="back-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
                Thử email khác
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
