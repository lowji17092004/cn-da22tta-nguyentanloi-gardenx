import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../api'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('user')) } catch(e){ return null }
  })
  const [token, setToken] = useState(()=> localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(()=>{
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token')
  }, [token])

  useEffect(()=>{
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user')
  }, [user])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const loginWithGoogle = async (credential) => {
    const res = await api.post('/auth/google', { credential })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    return res.data
  }

  const logout = () => {
    setToken(null); setUser(null); navigate('/')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithGoogle, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(){ return useContext(AuthContext) }
