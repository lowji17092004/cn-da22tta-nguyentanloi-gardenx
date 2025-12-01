// Flying cart animation utility
export const flyToCart = (productElement, productImage, productName) => {
  // Find cart icon in header
  const cartIcon = document.querySelector('.cart-icon-btn[title="Giỏ hàng"]')
  if (!cartIcon || !productElement) return

  // Get positions
  const productRect = productElement.getBoundingClientRect()
  const cartRect = cartIcon.getBoundingClientRect()

  // Create flying image element
  const flyingImg = document.createElement('img')
  flyingImg.src = productImage || '/images/placeholder.png'
  flyingImg.alt = productName || 'Product'
  flyingImg.className = 'flying-to-cart'
  
  // Set initial position
  flyingImg.style.position = 'fixed'
  flyingImg.style.top = `${productRect.top}px`
  flyingImg.style.left = `${productRect.left}px`
  flyingImg.style.width = `${productRect.width}px`
  flyingImg.style.height = `${productRect.height}px`
  flyingImg.style.objectFit = 'cover'
  flyingImg.style.zIndex = '9999'
  flyingImg.style.pointerEvents = 'none'
  flyingImg.style.borderRadius = '8px'
  flyingImg.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
  
  document.body.appendChild(flyingImg)

  // Calculate trajectory
  const deltaX = cartRect.left + (cartRect.width / 2) - (productRect.left + productRect.width / 2)
  const deltaY = cartRect.top + (cartRect.height / 2) - (productRect.top + productRect.height / 2)

  // Trigger animation
  requestAnimationFrame(() => {
    flyingImg.style.transition = 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)'
    flyingImg.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.2)`
    flyingImg.style.opacity = '0.5'

    // Add cart icon bounce effect
    cartIcon.classList.add('cart-bounce')
    
    // Clean up after animation
    setTimeout(() => {
      flyingImg.remove()
      cartIcon.classList.remove('cart-bounce')
    }, 800)
  })
}
