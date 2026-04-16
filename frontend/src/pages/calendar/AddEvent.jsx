import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { createEvent } from '../../api/eventApi'

const TYPES = ['Meeting', 'Holiday', 'Team Event', 'Training', 'Other']

function AddEvent() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    type: 'Meeting',
    location: '',
    allDay: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Title and dates are required')
      return
    }
    setLoading(true)
    try {
      await createEvent(form)
      toast.success('Event created')
      navigate('/calendar')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Event</h1>
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="input-base mt-1"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start</label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
              className="input-base mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">End</label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
              className="input-base mt-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allDay"
            checked={form.allDay}
            onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-primary-600"
          />
          <label htmlFor="allDay" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            All-day event
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Optional"
            className="input-base mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="input-base mt-1"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Event'}
          </button>
          <button type="button" onClick={() => navigate('/calendar')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddEvent
