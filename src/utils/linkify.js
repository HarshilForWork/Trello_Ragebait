// URL Linkify Utility
// Converts URLs in text to clickable links

// Regex patterns for URL detection
const urlPattern = /(\bhttps?:\/\/[^\s<]+)|(\bwww\.[^\s<]+)|(\b[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}(?:\/[^\s<]*)?)/gi

/**
 * Convert URLs in text to clickable anchor tags
 * Supports:
 * - http:// and https:// URLs
 * - www. URLs
 * - Bare domain URLs (example.com)
 * 
 * @param {string} text - Input text
 * @returns {string} - Text with URLs converted to anchor tags
 */
export function linkify(text) {
  if (!text) return ''
  
  // First escape HTML to prevent XSS
  const escaped = escapeHtml(text)
  
  // Then convert URLs to links
  return escaped.replace(urlPattern, (match) => {
    let url = match
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url
    }
    
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`
  })
}

/**
 * Check if a string contains any URLs
 * @param {string} text - Input text
 * @returns {boolean}
 */
export function containsUrl(text) {
  return urlPattern.test(text)
}

/**
 * Extract all URLs from text
 * @param {string} text - Input text
 * @returns {string[]} - Array of URLs
 */
export function extractUrls(text) {
  if (!text) return []
  const matches = text.match(urlPattern)
  return matches || []
}

// Helper: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
