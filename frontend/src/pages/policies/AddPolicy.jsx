import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { createPolicy } from '../../api/policyApi'

const CATEGORIES = ['HR', 'IT', 'Finance', 'Security', 'General', 'Other']

function AddPolicy() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', category: 'General' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) {
      toast.error('Title and content are required')
      return
    }
    setLoading(true)
    try {
      await createPolicy(form)
      toast.success('Policy created')
      navigate('/policies')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create policy')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Policy</h1>
      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="input-base mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-base mt-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            required
            rows={10}
            className="input-base mt-1"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Policy'}
          </button>
          <button type="button" onClick={() => navigate('/policies')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPolicy
