/**
 * Auto-categorization utilities
 * Automatically suggest categories based on product name and description
 */

import { getCategorySlug } from './categoryUtils'

// Category keywords mapping
const CATEGORY_KEYWORDS = {
  'hoa-kieng': {
    main: ['hoa', 'kiểng', 'hoa kiểng'],
    subcategories: {
      'hoa-hong': ['hồng', 'hong', 'rose'],
      'hoa-lan': ['lan', 'orchid', 'phong lan'],
      'hoa-cuc': ['cúc', 'cuc', 'chrysanthemum', 'daisy']
    }
  },
  'cay-canh': {
    main: ['cây cảnh', 'cay canh', 'cây', 'tree', 'plant'],
    subcategories: {
      'cay-van-phong': ['văn phòng', 'van phong', 'office', 'bàn làm việc', 'indoor'],
      'cay-ngoai-troi': ['ngoại trời', 'ngoai troi', 'outdoor', 'sân vườn', 'vườn'],
      'cay-phong-thuy': ['phong thủy', 'phong thuy', 'feng shui', 'may mắn', 'tài lộc']
    }
  },
  'cay-thuy-canh': {
    main: ['thủy cảnh', 'thuy canh', 'aquatic', 'bể cá', 'hồ cá'],
    subcategories: {
      'co-thuy-sinh': ['cỏ', 'co', 'grass', 'thủy sinh'],
      'cay-thuy-sinh': ['cây thủy', 'cay thuy', 'aquatic plant', 'thủy sinh'],
      'da-trang-tri': ['đá', 'da', 'stone', 'rock', 'trang trí']
    }
  },
  'sen-da': {
    main: ['sen đá', 'sen da', 'succulent', 'xương rồng', 'xuong rong', 'cactus'],
    subcategories: {
      'sen-da-mini': ['mini', 'nhỏ', 'nho', 'small', 'cute'],
      'sen-da-to': ['to', 'lớn', 'lon', 'large', 'big'],
      'sen-da-hoa': ['hoa', 'flower', 'nở', 'no', 'bloom']
    }
  }
}

/**
 * Normalize text for comparison (remove accents, lowercase)
 * @param {string} text 
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim()
}

/**
 * Check if text contains any of the keywords
 * @param {string} text 
 * @param {string[]} keywords 
 * @returns {boolean}
 */
const containsKeyword = (text, keywords) => {
  const normalized = normalizeText(text)
  return keywords.some(keyword => {
    const normalizedKeyword = normalizeText(keyword)
    return normalized.includes(normalizedKeyword)
  })
}

/**
 * Calculate match score for a category
 * @param {string} text 
 * @param {string[]} keywords 
 * @returns {number}
 */
const calculateScore = (text, keywords) => {
  const normalized = normalizeText(text)
  let score = 0
  
  keywords.forEach(keyword => {
    const normalizedKeyword = normalizeText(keyword)
    if (normalized.includes(normalizedKeyword)) {
      // Exact match gets higher score
      if (normalized === normalizedKeyword) {
        score += 10
      } else if (normalized.startsWith(normalizedKeyword)) {
        score += 5
      } else {
        score += 2
      }
    }
  })
  
  return score
}

/**
 * Suggest category based on product name and description
 * @param {string} name - Product name
 * @param {string} description - Product description (optional)
 * @returns {Object} - { category: string, subcategory: string|null, confidence: number }
 */
export const suggestCategory = (name, description = '') => {
  if (!name) return { category: null, subcategory: null, confidence: 0 }
  
  const text = `${name} ${description}`.toLowerCase()
  let bestMatch = { category: null, subcategory: null, confidence: 0 }
  
  // Check each main category
  Object.entries(CATEGORY_KEYWORDS).forEach(([categorySlug, categoryData]) => {
    const mainScore = calculateScore(text, categoryData.main)
    
    if (mainScore > bestMatch.confidence) {
      bestMatch = {
        category: categorySlug,
        subcategory: null,
        confidence: mainScore
      }
    }
    
    // Check subcategories
    if (categoryData.subcategories) {
      Object.entries(categoryData.subcategories).forEach(([subSlug, subKeywords]) => {
        const subScore = calculateScore(text, subKeywords) + mainScore * 0.5
        
        if (subScore > bestMatch.confidence) {
          bestMatch = {
            category: categorySlug,
            subcategory: subSlug,
            confidence: subScore
          }
        }
      })
    }
  })
  
  return bestMatch
}

/**
 * Get category suggestions as a list with confidence scores
 * @param {string} name 
 * @param {string} description 
 * @returns {Array} - Array of suggestions sorted by confidence
 */
export const getCategorySuggestions = (name, description = '') => {
  if (!name) return []
  
  const text = `${name} ${description}`.toLowerCase()
  const suggestions = []
  
  Object.entries(CATEGORY_KEYWORDS).forEach(([categorySlug, categoryData]) => {
    const mainScore = calculateScore(text, categoryData.main)
    
    if (mainScore > 0) {
      suggestions.push({
        category: categorySlug,
        subcategory: null,
        confidence: mainScore,
        label: `Main: ${categorySlug}`
      })
    }
    
    if (categoryData.subcategories) {
      Object.entries(categoryData.subcategories).forEach(([subSlug, subKeywords]) => {
        const subScore = calculateScore(text, subKeywords)
        
        if (subScore > 0) {
          suggestions.push({
            category: categorySlug,
            subcategory: subSlug,
            confidence: mainScore + subScore,
            label: `${categorySlug} > ${subSlug}`
          })
        }
      })
    }
  })
  
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

/**
 * Check if auto-categorization confidence is high enough to auto-apply
 * @param {Object} suggestion 
 * @returns {boolean}
 */
export const shouldAutoApply = (suggestion) => {
  return suggestion && suggestion.confidence >= 5
}

/**
 * Get readable category name from suggestion
 * @param {Object} suggestion 
 * @param {Array} categories - Full categories list from API
 * @returns {string}
 */
export const getSuggestionLabel = (suggestion, categories) => {
  if (!suggestion || !suggestion.category) return ''
  
  const cat = categories.find(c => c.slug === suggestion.category)
  if (!cat) return suggestion.category
  
  let label = cat.name
  
  if (suggestion.subcategory) {
    const sub = cat.subcategories?.find(s => s.slug === suggestion.subcategory)
    if (sub) {
      label += ` → ${sub.name}`
    }
  }
  
  return label
}
