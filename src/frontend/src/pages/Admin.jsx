import React from 'react'

export default function Admin(){
  return (
    <div>
      <h1>Trang quản trị</h1>
      <p>Quản lý sản phẩm, bài viết và đơn hàng. API tại <code>/api</code>.</p>
      <ul>
        <li><a href="/admin/products">Quản lý sản phẩm</a></li>
        <li><a href="/admin/articles">Quản lý bài viết</a></li>
        <li><a href="/admin/orders">Quản lý đơn hàng</a></li>
      </ul>
      <p>Admin mặc định: <strong>admin@flower.local</strong> / <strong>admin123</strong></p>
    </div>
  )
}
