import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children, role, roles }){
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  
  // Support both single role and array of roles
  if (role) {
    // Single role check
    if (user.role !== role) return <Navigate to="/" replace />
  } else if (roles && Array.isArray(roles)) {
    // Multiple roles check
    if (!roles.includes(user.role)) return <Navigate to="/" replace />
  }
  
  return children
}
