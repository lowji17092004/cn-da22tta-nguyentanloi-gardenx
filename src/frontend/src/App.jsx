import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/HomeNew'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Articles from './pages/Articles'
import BlogFlorana from './pages/BlogFlorana'
import BlogInfo from './pages/BlogInfo'
import BlogCare from './pages/BlogCare'
import BlogInspiration from './pages/BlogInspiration'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOtp from './pages/VerifyOtp'
import ResetPassword from './pages/ResetPassword'
import AdminProducts from './pages/AdminProducts'
import ProductForm from './pages/ProductForm'
import AdminArticles from './pages/AdminArticles'
import ArticleForm from './pages/ArticleForm'
import ArticleDetail from './pages/ArticleDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import AdminOrders from './pages/AdminOrders'
import AdminStats from './pages/AdminStats'
import AdminCategories from './pages/AdminCategories'
import AdminUsers from './pages/AdminUsers'
import UserForm from './pages/UserForm'
import Orders from './pages/Orders'
import AdminReviews from './pages/AdminReviews'
import AdminMessages from './pages/AdminMessages'
import Profile from './pages/Profile'
import CollaboratorDashboard from './pages/CollaboratorDashboard'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatBubble from './components/ChatBubble'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/collaborator')
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="app-layout">
      {!isAdminRoute && !isAuthRoute && <Header />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/shop" element={<Shop/>} />
          <Route path="/category/:categorySlug" element={<CategoryPage/>} />
          <Route path="/category/:categorySlug/:subSlug" element={<CategoryPage/>} />
          <Route path="/product/:id" element={<ProductDetail/>} />
          <Route path="/articles" element={<Articles/>} />
          <Route path="/articles/about" element={<BlogFlorana/>} />
          <Route path="/articles/info" element={<BlogInfo/>} />
          <Route path="/articles/care" element={<BlogCare/>} />
          <Route path="/articles/inspiration" element={<BlogInspiration/>} />
          <Route path="/article/:slug" element={<ArticleDetail/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/verify-otp" element={<VerifyOtp/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />

          <Route path="/cart" element={<Cart/>} />
          <Route path="/checkout" element={<Checkout/>} />
          <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

          <Route path="/admin/products" element={<ProtectedRoute role={'admin'}><AdminProducts/></ProtectedRoute>} />
          <Route path="/admin/products/:id" element={<ProtectedRoute role={'admin'}><ProductForm/></ProtectedRoute>} />

          <Route path="/admin/articles" element={<ProtectedRoute role={'admin'}><AdminArticles/></ProtectedRoute>} />
          <Route path="/admin/articles/:id" element={<ProtectedRoute role={'admin'}><ArticleForm/></ProtectedRoute>} />

          <Route path="/admin/orders" element={<ProtectedRoute roles={['admin', 'collaborator']}><AdminOrders/></ProtectedRoute>} />
          <Route path="/admin/stats" element={<ProtectedRoute role={'admin'}><AdminStats/></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute role={'admin'}><AdminCategories/></ProtectedRoute>} />
          
          <Route path="/admin/users" element={<ProtectedRoute role={'admin'}><AdminUsers/></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute role={'admin'}><UserForm/></ProtectedRoute>} />
          
          <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin', 'collaborator']}><AdminReviews/></ProtectedRoute>} />
          
          <Route path="/admin/messages" element={<ProtectedRoute roles={['admin', 'collaborator']}><AdminMessages/></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role={'admin'}><Admin/></ProtectedRoute>} />
          
          {/* Collaborator Routes */}
          <Route path="/collaborator" element={<ProtectedRoute role={'collaborator'}><CollaboratorDashboard/></ProtectedRoute>} />
        </Routes>
      </div>
      {!isAdminRoute && !isAuthRoute && <Footer />}
      {!isAdminRoute && <ChatBubble />}
    </div>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  )
}
