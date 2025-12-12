import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }){
  const { user } = useAuth()
  
  // Tạo key riêng cho mỗi user
  const getCartKey = () => user ? `cart_${user.id}` : 'cart_guest'
  const getSelectedKey = () => user ? `selected_${user.id}` : 'selected_guest'
  
  const [items, setItems] = useState(()=>{
    try { 
      const key = user ? `cart_${user.id}` : 'cart_guest'
      return JSON.parse(localStorage.getItem(key)) || [] 
    } catch(e){ return [] }
  })

  const [selectedItems, setSelectedItems] = useState(()=>{
    try { 
      const key = user ? `selected_${user.id}` : 'selected_guest'
      return JSON.parse(localStorage.getItem(key)) || [] 
    } catch(e){ return [] }
  })

  // Load cart khi user thay đổi
  useEffect(() => {
    if (user) {
      // Load giỏ hàng của user hiện tại
      try {
        const cartKey = `cart_${user.id}`
        const selectedKey = `selected_${user.id}`
        const savedCart = JSON.parse(localStorage.getItem(cartKey)) || []
        const savedSelected = JSON.parse(localStorage.getItem(selectedKey)) || []
        setItems(savedCart)
        setSelectedItems(savedSelected)
      } catch(e) {
        setItems([])
        setSelectedItems([])
      }
    } else {
      // Khi logout, xóa giỏ hàng
      setItems([])
      setSelectedItems([])
    }
  }, [user])

  const save = (next)=>{ 
    setItems(next)
    const key = getCartKey()
    localStorage.setItem(key, JSON.stringify(next))
  }
  
  const saveSelected = (next)=>{ 
    setSelectedItems(next)
    const key = getSelectedKey()
    localStorage.setItem(key, JSON.stringify(next))
  }

  const [announcement, setAnnouncement] = useState('')
  const announce = (msg) => {
    setAnnouncement(msg)
    setTimeout(()=> setAnnouncement(''), 2200)
  }

  const add = (product, qty=1) => {
    const maxStock = product.stock || 999
    const found = items.find(i => i.product === product._id)
    if (found){
      const newQty = Math.min(found.quantity + qty, maxStock)
      const next = items.map(i => {
        if (i.product === product._id) {
          return {...i, quantity: newQty, stock: maxStock}
        }
        return i
      })
      save(next)
    } else {
      const next = [...items, { 
        product: product._id, 
        name: product.name, 
        price: product.price, 
        quantity: Math.min(qty, maxStock),
        stock: maxStock,
        imageUrl: product.images?.[0] || product.imageUrl || null,
        category: product.category || ''
      }]
      save(next)
    }
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return
    const next = items.map(i => {
      if (i.product === productId) {
        const maxQty = i.stock || 999
        return {...i, quantity: Math.min(newQuantity, maxQty)}
      }
      return i
    })
    save(next)
  }

  const remove = (productId) => { 
    save(items.filter(i=> i.product !== productId))
    saveSelected(selectedItems.filter(id => id !== productId))
  }
  const clear = () => { save([]); saveSelected([]) }

  const refreshStock = useCallback((products) => {
    // Cập nhật stock và imageUrl từ danh sách sản phẩm mới
    setItems(prevItems => {
      const next = prevItems.map(item => {
        const product = products.find(p => p._id === item.product)
        if (product) {
          const newStock = product.stock || 999
          const newQty = Math.min(item.quantity, newStock)
          return {
            ...item, 
            stock: newStock, 
            quantity: newQty,
            imageUrl: product.images?.[0] || product.imageUrl || item.imageUrl,
            name: product.name || item.name,
            price: product.price || item.price
          }
        }
        return item
      })
      const key = user ? `cart_${user.id}` : 'cart_guest'
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }, [user])

  const toggleSelect = (productId) => {
    if (selectedItems.includes(productId)) {
      saveSelected(selectedItems.filter(id => id !== productId))
    } else {
      saveSelected([...selectedItems, productId])
    }
  }

  const selectAll = () => {
    saveSelected(items.map(i => i.product))
  }

  const deselectAll = () => {
    saveSelected([])
  }

  const isSelected = (productId) => selectedItems.includes(productId)

  const total = items.reduce((s,i)=> s + (i.price||0) * (i.quantity||0), 0)
  const selectedTotal = items
    .filter(i => selectedItems.includes(i.product))
    .reduce((s,i)=> s + (i.price||0) * (i.quantity||0), 0)

  return <CartContext.Provider value={{ 
    items, 
    add, 
    remove, 
    updateQuantity, 
    clear, 
    refreshStock,
    total, 
    selectedItems,
    selectedTotal,
    toggleSelect,
    selectAll,
    deselectAll,
    isSelected,
    announcement, 
    announce 
  }}>{children}</CartContext.Provider>
}

export function useCart(){ return useContext(CartContext) }
