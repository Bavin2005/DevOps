/**
 * KnowledgeBase - view all articles with search and category filter.
 *
 * GET /api/knowledge-base - all authenticated users can view.
 * Optional: suggest solutions input for quick help.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getArticles } from '../../api/knowledgeBaseApi'
import { suggestSolutions } from '../../api/knowledgeBaseApi'

const CATEGORIES = ['All', 'Network', 'Software', 'Hardware', 'Other']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function KnowledgeBase() {
  const { user } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [suggestInput, setSuggestInput] = useState('')
  const [suggestions, setSuggestions] = useState(null)
  const [suggestLoading, setSuggestLoading] = useState(false)

  const loadArticles = () => {
    setError(null)
    getArticles()
      .then(({ articles: data }) => setArticles(data || []))
      .catch((err) => {
        const msg = err.response?.data?.message || err.message || 'Failed to load articles'
        setError(msg)
        setArticles([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const handleSuggest = async (e) => {
    e.preventDefault()
    if (!suggestInput.trim()) return
    setSuggestLoading(true)
    setSuggestions(null)
    try {
      const { suggestions: data } = await suggestSolutions(suggestInput.trim())
      setSuggestions(data || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to get suggestions'
      setSuggestions([{ error: msg }])
    } finally {
      setSuggestLoading(false)
    }
  }

  const filtered = articles.filter((a) => {
    const matchCategory = categoryFilter === 'All' || a.category === categoryFilter
    const matchSearch =
      !search.trim() ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase())) ||
      a.solution?.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const canAddArticle = user?.role === 'Admin' || user?.role === 'IT'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Knowledge Base
          </h1>
          <p className="mt-1 text-slate-500">
            Search articles and find solutions before creating a ticket.
          </p>
        </div>
        {canAddArticle && (
          <Link
            to="/knowledge-base/add"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Article
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Suggest solutions */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Find solutions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Describe your issue to get AI-suggested articles
        </p>
        <form onSubmit={handleSuggest} className="mt-3 flex gap-2">
          <input
            type="text"
            value={suggestInput}
            onChange={(e) => setSuggestInput(e.target.value)}
            placeholder="e.g. Password reset not working"
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
          <button
            type="submit"
            disabled={suggestLoading}
            className="rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {suggestLoading ? 'Searching...' : 'Suggest'}
          </button>
        </form>
        {suggestions && (
          <div className="mt-4 space-y-2">
            {Array.isArray(suggestions) && suggestions[0]?.error ? (
              <p className="text-sm text-red-600">{suggestions[0].error}</p>
            ) : suggestions.length === 0 ? (
              <p className="text-sm text-slate-500">No matching articles found</p>
            ) : (
              suggestions.map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                >
                  <p className="font-medium text-slate-900">{s.title}</p>
                  <p className="mt-1 text-slate-600">{s.solution}</p>
                  {s.relevanceScore != null && (
                    <p className="mt-1 text-xs text-slate-500">
                      Relevance score: {s.relevanceScore}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 placeholder-slate-400 sm:w-64 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Articles list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg
            className="h-10 w-10 animate-spin text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-sm text-slate-500">Loading articles...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">No articles yet</h2>
          <p className="mt-2 text-slate-500">No articles match your search.</p>
          {canAddArticle && (
            <Link
              to="/knowledge-base/add"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700"
            >
              Add first article
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((article) => (
            <div
              key={article._id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">{article.title}</h2>
                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {article.category}
                  </span>
                  {article.keywords?.length > 0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      {article.keywords.join(', ')}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-400">{formatDate(article.createdAt)}</p>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{article.solution}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default KnowledgeBase
