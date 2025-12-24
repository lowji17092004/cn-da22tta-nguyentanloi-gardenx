// Utility functions for search and filtering

/**
 * Remove Vietnamese accents from string
 * @param {string} str - String to remove accents from
 * @returns {string} String without accents
 */
export const removeVietnameseAccents = (str) => {
  if (!str) return ''
  
  str = str.toLowerCase()
  
  // Chuyển đổi các ký tự có dấu sang không dấu
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i')
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
  str = str.replace(/đ/g, 'd')
  
  // Loại bỏ các ký tự đặc biệt
  str = str.replace(/[^a-z0-9\s]/g, '')
  
  return str
}

/**
 * Normalize search term for better matching
 * @param {string} term - Search term
 * @returns {string} Normalized term
 */
export const normalizeSearchTerm = (term) => {
  if (!term) return ''
  return removeVietnameseAccents(term.trim())
}

/**
 * Check if text matches search term (supports Vietnamese without accents)
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Term to search for
 * @returns {boolean} True if matches
 */
export const matchesSearchTerm = (text, searchTerm) => {
  if (!searchTerm) return true
  if (!text) return false
  
  const normalizedText = removeVietnameseAccents(String(text))
  const normalizedSearch = normalizeSearchTerm(searchTerm)
  
  return normalizedText.includes(normalizedSearch)
}

/**
 * Normalize category slug for comparison
 * @param {string} category - Category name or slug
 * @returns {string} Normalized slug
 */
export const normalizeCategorySlug = (category) => {
  if (!category) return ''
  const normalized = String(category).toLowerCase().trim()
  
  const mapping = {
    // Chậu cây
    'chậu cây': 'chau-cay',
    'chau cay': 'chau-cay',
    'chau-cay': 'chau-cay',
    // Cây cảnh
    'cây cảnh': 'cay-canh',
    'cay canh': 'cay-canh',
    'cay-canh': 'cay-canh',
    // Hoa kiểng
    'hoa kiểng': 'hoa-kieng',
    'hoa-kieng': 'hoa-kieng',
    'hoa kieng': 'hoa-kieng',
    // Phụ kiện
    'phụ kiện': 'phu-kien',
    'phu kien': 'phu-kien',
    'phu-kien': 'phu-kien'
  }
  
  if (mapping[normalized]) return mapping[normalized]
  
  // Fallback: slugify
  return removeVietnameseAccents(normalized).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * Filter items by search term and category
 * @param {Array} items - Items to filter
 * @param {string} searchTerm - Search term
 * @param {string} category - Category to filter by
 * @param {Array} searchFields - Fields to search in (e.g., ['name', 'description'])
 * @param {string} categoryField - Field name for category
 * @returns {Array} Filtered items
 */
export const filterItems = (items, searchTerm, category, searchFields = [], categoryField = 'category') => {
  if (!Array.isArray(items)) return []
  
  return items.filter(item => {
    // Check search term
    if (searchTerm) {
      const matchesSearch = searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item)
        return matchesSearchTerm(value, searchTerm)
      })
      if (!matchesSearch) return false
    }
    
    // Check category
    if (category) {
      const itemCategory = normalizeCategorySlug(item[categoryField])
      const filterCategory = normalizeCategorySlug(category)
      if (itemCategory !== filterCategory) return false
    }
    
    return true
  })
}
