/**
 * Category utility functions
 * Handles category name conversions and mappings
 */

// Category mapping: slug <-> Vietnamese name
export const CATEGORY_MAPPING = {
  // Main categories
  'hoa-kieng': 'Hoa kiểng',
  'cay-canh': 'Cây cảnh',
  'cay-thuy-canh': 'Cây thủy cảnh',
  'sen-da': 'Sen đá',
  'hoa kieng': 'Hoa kiểng',
  'cay canh': 'Cây cảnh',
  'cay thuy canh': 'Cây thủy cảnh',
  'sen da': 'Sen đá',
  
  // Subcategories - Hoa kiểng
  'hoa-hong': 'Hoa hồng',
  'hoa-lan': 'Hoa lan',
  'hoa-cuc': 'Hoa cúc',
  'hoa hong': 'Hoa hồng',
  'hoa lan': 'Hoa lan',
  'hoa cuc': 'Hoa cúc',
  
  // Subcategories - Cây cảnh
  'cay-van-phong': 'Cây văn phòng',
  'cay-ngoai-troi': 'Cây ngoại trời',
  'cay-phong-thuy': 'Cây phong thủy',
  'cay van phong': 'Cây văn phòng',
  'cay ngoai troi': 'Cây ngoại trời',
  'cay phong thuy': 'Cây phong thủy',
  
  // Subcategories - Cây thủy cảnh
  'co-thuy-sinh': 'Cỏ thủy sinh',
  'cay-thuy-sinh': 'Cây thủy sinh',
  'da-trang-tri': 'Đá trang trí',
  'co thuy sinh': 'Cỏ thủy sinh',
  'cay thuy sinh': 'Cây thủy sinh',
  'da trang tri': 'Đá trang trí',
  
  // Subcategories - Sen đá
  'sen-da-mini': 'Sen đá mini',
  'sen-da-to': 'Sen đá to',
  'sen-da-hoa': 'Sen đá hoa',
  'sen da mini': 'Sen đá mini',
  'sen da to': 'Sen đá to',
  'sen da hoa': 'Sen đá hoa'
  ,
  // Additional pot (chậu) mappings
  'chau-xi-mang': 'Chậu xi măng',
  'chau xi mang': 'Chậu xi măng',
  'chau-xi-măng': 'Chậu xi măng',
  'chau-nhua': 'Chậu nhựa',
  'chau nhua': 'Chậu nhựa',
  'chau-dat-nung': 'Chậu đất nung',
  'chau dat nung': 'Chậu đất nung',
  'chau-gom': 'Chậu gốm',
  'chau gom': 'Chậu gốm',
  'chau-go': 'Chậu gỗ',
  'chau go': 'Chậu gỗ',
  'chau-cay': 'Chậu cây',
  'chau cay': 'Chậu cây',

  // Plant type mappings
  'cay-van-phong': 'Cây văn phòng',
  'cay van phong': 'Cây văn phòng',
  'cay-trong-nha': 'Cây trong nhà',
  'cay trong nha': 'Cây trong nhà',
  'cay-ngoai-troi': 'Cây ngoài trời',
  'cay ngoai troi': 'Cây ngoài trời',
  'cay-de-ban': 'Cây để bàn',
  'cay de ban': 'Cây để bàn',
  'cay-cao-cap': 'Cây cao cấp',
  'cay cao cap': 'Cây cao cấp',
  'cay-de-cham': 'Cây dễ chăm',
  'cay de cham': 'Cây dễ chăm',
  'cay-thuy-canh': 'Cây thủy cảnh',

  // Flower mappings
  'hoa-chau-trang-tri': 'Hoa chậu trang trí',
  'hoa chau trang tri': 'Hoa chậu trang trí',
  'hoa-san-vuon': 'Hoa sân vườn - ngoại thất',
  'hoa-san-vuon-ngoai-that': 'Hoa sân vườn ngoại thất',
  'hoa-san-vuong-ngoai-that': 'Hoa sân vườn ngoại thất',
  'hoa san vuon ngoai that': 'Hoa sân vườn ngoại thất',
  'hoa san vuon': 'Hoa sân vườn ngoại thất',
  'hoa san vuon': 'Hoa sân vườn - ngoại thất',
  'hoa-cat-canh': 'Hoa cắt cành - sự kiện',
  'hoa cat canh': 'Hoa cắt cành - sự kiện',
  'hoa-lan': 'Hoa Lan',
  'hoa lan': 'Hoa Lan',
  'hoa-phong-thuy': 'Hoa phong thủy',
  'hoa phong thuy': 'Hoa phong thủy',

  // Accessories & supplies
  'phu-kien-trang-tri': 'Phụ kiện trang trí',
  'phu kien trang tri': 'Phụ kiện trang trí',
  'phu-kien': 'Phụ kiện',
  'phu kien': 'Phụ kiện',
  'phan-bon': 'Phân bón',
  'phan bon': 'Phân bón',
  'dung-cu-lam-vuon': 'Dụng cụ làm vườn',
  'dung cu lam vuon': 'Dụng cụ làm vườn',
  'dat-trong': 'Đất trồng cây',
  'dat trong': 'Đất trồng cây'
}

/**
 * Convert category slug or lowercase name to proper Vietnamese name
 * @param {string} category - Category slug or name
 * @returns {string} - Proper Vietnamese category name
 */
export const getCategoryDisplayName = (category) => {
  if (!category) return 'Chưa phân loại'
  
  const normalized = category.toLowerCase().trim()
  return CATEGORY_MAPPING[normalized] || category
}

/**
 * Convert Vietnamese category name to slug
 * @param {string} categoryName - Vietnamese category name
 * @returns {string} - Category slug
 */
export const getCategorySlug = (categoryName) => {
  if (!categoryName) return ''
  
  // First check if it's already a slug
  const lower = categoryName.toLowerCase().trim()
  if (lower.includes('-') && CATEGORY_MAPPING[lower]) {
    return lower
  }
  
  // Try to find matching slug
  const normalized = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .trim()
  
  // Check if this normalized version exists in mapping
  const entries = Object.entries(CATEGORY_MAPPING)
  const found = entries.find(([key, val]) => {
    const keyNormalized = key.replace(/-/g, ' ')
    const valNormalized = val.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
    
    return normalized === key || 
           normalized.replace(/-/g, ' ') === keyNormalized ||
           normalized === valNormalized
  })
  
  return found ? found[0] : normalized
}

/**
 * Get all main categories with their display names
 * @returns {Array} - Array of {slug, name} objects
 */
export const getMainCategories = () => {
  return [
    { slug: 'hoa-kieng', name: 'Hoa kiểng' },
    { slug: 'cay-canh', name: 'Cây cảnh' },
    { slug: 'cay-thuy-canh', name: 'Cây thủy cảnh' },
    { slug: 'sen-da', name: 'Sen đá' }
  ]
}

/**
 * Get category color for UI styling
 * @param {string} category - Category slug or name
 * @returns {string} - Color hex code
 */
export const getCategoryColor = (category) => {
  const slug = getCategorySlug(category)
  
  const colors = {
    'hoa-kieng': '#FF6B9D',
    'cay-canh': '#10b981',
    'cay-thuy-canh': '#0093E9',
    'sen-da': '#F857A6'
  }
  
  return colors[slug] || '#6b7280'
}

/**
 * Check if category matches (slug or Vietnamese name)
 * @param {string} cat1 - First category
 * @param {string} cat2 - Second category
 * @returns {boolean} - True if they match
 */
export const categoriesMatch = (cat1, cat2) => {
  if (!cat1 || !cat2) return false
  
  const slug1 = getCategorySlug(cat1)
  const slug2 = getCategorySlug(cat2)
  
  return slug1 === slug2
}
