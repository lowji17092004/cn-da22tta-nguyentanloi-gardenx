import React from 'react'
import { Link } from 'react-router-dom'
import './Logo.css'

export default function Logo({ size = 'medium', linkable = true }) {
  const content = (
    <div className={`logo-component logo-${size}`}>
      <span className="logo-brand-text">FLORÉA</span>
      <span className="logo-tagline-text">Botanica Way of Life</span>
    </div>
  )

  if (linkable) {
    return (
      <Link to="/" className="logo-link" aria-label="Về trang chủ">
        {content}
      </Link>
    )
  }

  return content
}
