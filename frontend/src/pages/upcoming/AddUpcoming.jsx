import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { createUpcoming } from '../../api/upcomingApi'

const CATEGORIES = ['Feature', 'Update', 'Maintenance', 'Event', 'Other']
const STATUS_OPTIONS = ['Planned', 'In Progress']

function AddUpcoming() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', category: 'Feature', targetDate: '', status: 'Planned' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    setLoading(true)
    try {
      await createUpcoming(form)
      toast.success('Item added')
      navigate('/upcoming')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add What&apos;s New</h1>
      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="e.g. New leave policy rollout"
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Date (optional)</label>
          <input
            type="date"
            value={form.targetDate}
            onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            className="input-base mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input-base mt-1"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Brief description"
            className="input-base mt-1"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Adding...' : 'Add Item'}
          </button>
          <button type="button" onClick={() => navigate('/upcoming')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddUpcoming
