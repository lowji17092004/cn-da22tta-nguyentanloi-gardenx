/**
 * Category utility functions
 * Handles category name conversions and mappings
 * 4 Main Categories: Chậu cây, Cây cảnh, Hoa kiểng, Phụ kiện
 */

// Category mapping: slug <-> Vietnamese name
export const CATEGORY_MAPPING = {
  // Main categories
  'chau-cay': 'Chậu cây',
  'cay-canh': 'Cây cảnh',
  'hoa-kieng': 'Hoa kiểng',
  'phu-kien': 'Phụ kiện',
  'chau cay': 'Chậu cây',
  'cay canh': 'Cây cảnh',
  'hoa kieng': 'Hoa kiểng',
  'phu kien': 'Phụ kiện',
  
  // Subcategories - Hoa kiểng
  'hoa-hong': 'Hoa hồng',
  'hoa-lan': 'Hoa lan',
  'hoa-cuc': 'Hoa cúc',
  'hoa hong': 'Hoa hồng',
  'hoa lan': 'Hoa lan',
  'hoa cuc': 'Hoa cúc',
  'hoa-chau-trang-tri': 'Hoa chậu trang trí',
  'hoa chau trang tri': 'Hoa chậu trang trí',
  'hoa-san-vuon-ngoai-that': 'Hoa sân vườn - ngoại thất',
  'hoa san vuon ngoai that': 'Hoa sân vườn - ngoại thất',
  'hoa-cat-canh-su-kien': 'Hoa cắt cành - sự kiện',
  'hoa cat canh su kien': 'Hoa cắt cành - sự kiện',
  'hoa-lan-cac-giong-lan-pho-bien': 'Hoa Lan - các giống Lan phổ biến',
  'hoa lan cac giong lan pho bien': 'Hoa Lan - các giống Lan phổ biến',
  'hoa-phong-thuy': 'Hoa phong thủy',
  'hoa phong thuy': 'Hoa phong thủy',
  
  // Subcategories - Cây cảnh
  'cay-van-phong': 'Cây văn phòng',
  'cay-ngoai-troi': 'Cây ngoài trời',
  'cay-phong-thuy': 'Cây phong thủy',
  'cay-thuy-canh': 'Cây thủy cảnh',
  'sen-da': 'Sen đá',
  'cay van phong': 'Cây văn phòng',
  'cay ngoai troi': 'Cây ngoài trời',
  'cay phong thuy': 'Cây phong thủy',
  'cay thuy canh': 'Cây thủy cảnh',
  'sen da': 'Sen đá',
  'cay-trong-nha': 'Cây trong nhà',
  'cay trong nha': 'Cây trong nhà',
  'cay-de-ban': 'Cây để bàn',
  'cay de ban': 'Cây để bàn',
  'cay-cao-cap': 'Cây cao cấp',
  'cay cao cap': 'Cây cao cấp',
  'cay-de-cham': 'Cây dễ chăm',
  'cay de cham': 'Cây dễ chăm',
  
  // Subcategories - Chậu cây
  'chau-xi-mang': 'Chậu xi măng',
  'chau xi mang': 'Chậu xi măng',
  'chau-nhua': 'Chậu nhựa',
  'chau nhua': 'Chậu nhựa',
  'chau-dat-nung': 'Chậu đất nung',
  'chau dat nung': 'Chậu đất nung',
  'chau-gom': 'Chậu gốm',
  'chau gom': 'Chậu gốm',
  'chau-su': 'Chậu sứ',
  'chau su': 'Chậu sứ',
  'chau-go': 'Chậu gỗ',
  'chau go': 'Chậu gỗ',
  
  // Subcategories - Phụ kiện
  'phan-bon': 'Phân bón',
  'phan bon': 'Phân bón',
  'dat-trong': 'Đất trồng',
  'dat trong': 'Đất trồng',
  'dung-cu': 'Dụng cụ',
  'dung cu': 'Dụng cụ',
  'dung-cu-lam-vuon': 'Dụng cụ làm vườn',
  'dung cu lam vuon': 'Dụng cụ làm vườn',
  'phu-kien-trang-tri': 'Phụ kiện trang trí',
  'phu kien trang tri': 'Phụ kiện trang trí',
  'dat-trong-cay': 'Đất trồng cây',
  'dat trong cay': 'Đất trồng cây'
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
    { slug: 'chau-cay', name: 'Chậu cây' },
    { slug: 'cay-canh', name: 'Cây cảnh' },
    { slug: 'hoa-kieng', name: 'Hoa kiểng' },
    { slug: 'phu-kien', name: 'Phụ kiện' }
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
    'chau-cay': '#8B4513',
    'cay-canh': '#10b981',
    'hoa-kieng': '#ec4899',
    'phu-kien': '#8b5cf6'
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
