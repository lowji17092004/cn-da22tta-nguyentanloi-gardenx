import React from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import Home from './pages/HomeNew'
import Shop from './pages/Shop'
import CategoryPage from './pages/CategoryPage'
import ProductDetail from './pages/ProductDetail'
import Articles from './pages/Articles'
import BlogFlorana from './pages/BlogFlorana'
import BlogInfo from './pages/BlogInfo'
import BlogCare from './pages/BlogCare'
import BlogInspiration from './pages/BlogInspiration'
import BlogPromotion from './pages/BlogPromotion'
import PolicyAbout from './pages/PolicyAbout'
import PolicyPrivacy from './pages/PolicyPrivacy'
import PolicyWarranty from './pages/PolicyWarranty'
import PolicyPayment from './pages/PolicyPayment'
import PolicyShipping from './pages/PolicyShipping'
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
import CheckoutNew from './pages/CheckoutNew'
import PaymentSuccess from './pages/PaymentSuccess'
import AdminOrders from './pages/AdminOrders'
import AdminStats from './pages/AdminStats'
import AdminCategories from './pages/AdminCategories'
import AdminUsers from './pages/AdminUsers'
import AdminCoupons from './pages/AdminCoupons'
import UserForm from './pages/UserForm'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import AdminReviews from './pages/AdminReviews'
import AdminMessages from './pages/AdminMessages'
import Profile from './pages/Profile'
import CollaboratorDashboard from './pages/CollaboratorDashboard'
import FeaturedPage from './pages/FeaturedPage'
import Coupons from './pages/Coupons'
import About from './pages/About'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/Header'
import Footer from './components/Footer'
import ChatBubble from './components/ChatBubble'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/collaborator')
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || 
                      location.pathname === '/forgot-password' || location.pathname === '/verify-otp' || 
                      location.pathname === '/reset-password'

  return (
    <div className="app-layout">
      {!isAdminRoute && !isAuthRoute && <Header />}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/shop" element={<Shop/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/featured" element={<FeaturedPage/>} />
          <Route path="/bestsellers" element={<FeaturedPage/>} />
          <Route path="/category/:categorySlug" element={<CategoryPage/>} />
          <Route path="/category/:categorySlug/:subSlug" element={<CategoryPage/>} />
          <Route path="/product/:id" element={<ProductDetail/>} />
          <Route path="/articles" element={<Articles/>} />
          <Route path="/articles/about" element={<BlogFlorana/>} />
          <Route path="/articles/info" element={<BlogInfo/>} />
          <Route path="/articles/care" element={<BlogCare/>} />
          <Route path="/articles/inspiration" element={<BlogInspiration/>} />
          <Route path="/articles/promotion" element={<BlogPromotion/>} />
          <Route path="/article/:slug" element={<ArticleDetail/>} />
          <Route path="/huong-dan/:slug" element={<ArticleDetail/>} />
          
          {/* Policy Routes */}
          <Route path="/policy/about" element={<PolicyAbout/>} />
          <Route path="/policy/privacy" element={<PolicyPrivacy/>} />
          <Route path="/policy/warranty" element={<PolicyWarranty/>} />
          <Route path="/policy/payment" element={<PolicyPayment/>} />
          <Route path="/policy/shipping" element={<PolicyShipping/>} />
          
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />
          <Route path="/verify-otp" element={<VerifyOtp/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />

          <Route path="/cart" element={<Cart/>} />
          <Route path="/coupons" element={<Coupons/>} />
          <Route path="/checkout" element={<CheckoutNew/>} />
          <Route path="/payment-success" element={<PaymentSuccess/>} />
          <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail/></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

          <Route path="/admin/products" element={<ProtectedRoute role={'admin'}><AdminProducts/></ProtectedRoute>} />
          <Route path="/admin/products/:id" element={<ProtectedRoute role={'admin'}><ProductForm/></ProtectedRoute>} />

          <Route path="/admin/articles" element={<ProtectedRoute role={'admin'}><AdminArticles/></ProtectedRoute>} />
          <Route path="/admin/articles/:id" element={<ProtectedRoute role={'admin'}><ArticleForm/></ProtectedRoute>} />

          <Route path="/admin/orders" element={<ProtectedRoute roles={['admin', 'collaborator']}><AdminOrders/></ProtectedRoute>} />
          <Route path="/admin/stats" element={<ProtectedRoute role={'admin'}><AdminStats/></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute role={'admin'}><AdminCategories/></ProtectedRoute>} />
          
          <Route path="/admin/coupons" element={<ProtectedRoute role={'admin'}><AdminCoupons/></ProtectedRoute>} />
          
          <Route path="/admin/users" element={<ProtectedRoute role={'admin'}><AdminUsers/></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute role={'admin'}><UserForm/></ProtectedRoute>} />
          
          <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin', 'collaborator']}><AdminReviews/></ProtectedRoute>} />
          
          <Route path="/admin/messages" element={<ProtectedRoute roles={['admin', 'collaborator']}><AdminMessages/></ProtectedRoute>} />

          {/* Redirect /admin to /admin/products */}
          <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
          
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
