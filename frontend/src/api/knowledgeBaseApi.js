/**
 * Knowledge Base API - integrates with backend /api/knowledge-base endpoints.
 *
 * - GET  /api/knowledge-base      → { count, articles } (all users)
 * - POST /api/knowledge-base/add  → add article (Admin/IT only)
 * - POST /api/knowledge-base/suggest → AI suggestions (all users)
 */

import axiosInstance from './axios'

/**
 * Fetch all knowledge base articles.
 * @returns {Promise<{ count: number, articles: array }>}
 */
export async function getArticles() {
  const { data } = await axiosInstance.get('/api/knowledge-base')
  return { count: data.count, articles: data.articles || [] }
}

/**
 * Add a new knowledge base article (Admin/IT only).
 * @param {Object} payload - { title, category, keywords, solution }
 * @returns {Promise<{ message: string, article: object }>}
 */
export async function addArticle(payload) {
  const { data } = await axiosInstance.post('/api/knowledge-base/add', payload)
  return { message: data.message, article: data.article }
}

/**
 * Get AI-suggested solutions for a description.
 * @param {string} description
 * @returns {Promise<{ count: number, suggestions: array }>}
 */
export async function suggestSolutions(description) {
  const { data } = await axiosInstance.post('/api/knowledge-base/suggest', { description })
  return { count: data.count, suggestions: data.suggestions || [] }
}
