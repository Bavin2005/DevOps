/**
 * AddArticle - form to add a knowledge base article (Admin/IT only).
 *
 * POST /api/knowledge-base/add
 * Fields: title, category, keywords (comma-separated), solution
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { addArticle } from '../../api/knowledgeBaseApi'

const CATEGORIES = ['Network', 'Software', 'Hardware', 'Other']

function AddArticle() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    category: 'Software',
    keywords: '',
    solution: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const keywords = form.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)

    if (keywords.length === 0) {
      const msg = 'Please add at least one keyword'
      setError(msg)
      toast.error(msg)
      setLoading(false)
      return
    }

    try {
      await addArticle({
        title: form.title,
        category: form.category,
        keywords,
        solution: form.solution,
      })
      toast.success('Article added successfully')
      navigate('/knowledge-base', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to add article'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Article</h1>
        <p className="mt-1 text-slate-500">Add a new knowledge base article.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="e.g. How to reset your password"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-slate-700">
              Keywords <span className="text-red-500">*</span>
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              required
              value={form.keywords}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="password, reset, login (comma-separated)"
            />
          </div>

          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-slate-700">
              Solution <span className="text-red-500">*</span>
            </label>
            <textarea
              id="solution"
              name="solution"
              required
              rows={6}
              value={form.solution}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="Step-by-step solution..."
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              'Add Article'
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/knowledge-base')}
            className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddArticle
