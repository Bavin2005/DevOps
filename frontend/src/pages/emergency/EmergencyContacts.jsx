import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getEmergencyContacts, createEmergencyContact, updateEmergencyContact, deleteEmergencyContact } from '../../api/emergencyContactApi'

const ROLES = ['HR', 'Security', 'Medical', 'IT', 'Facilities', 'Other']

function EmergencyContacts() {
  const { user } = useAuth()
  const canManage = user?.role === 'Admin'
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', role: 'HR', phone: '', email: '' })

  const load = () => {
    setError(null)
    getEmergencyContacts()
      .then((res) => setContacts(res?.contacts || []))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load')
        setContacts([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.role || !form.phone) return
    try {
      if (editing) {
        await updateEmergencyContact(editing._id, form)
        setEditing(null)
      } else {
        await createEmergencyContact(form)
      }
      setForm({ name: '', role: 'HR', phone: '', email: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    try {
      await deleteEmergencyContact(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete')
    }
  }

  const startEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, role: c.role, phone: c.phone, email: c.email || '' })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Contacts</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">HR, Security, Medical, IT – quick access</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Contacts</h2>
          {contacts.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-slate-500 dark:text-slate-400">No emergency contacts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{c.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.role}</p>
                    <a href={`tel:${c.phone}`} className="mt-1 block text-primary-600 hover:underline dark:text-primary-400">
                      {c.phone}
                    </a>
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="mt-1 block text-sm text-slate-500 hover:underline dark:text-slate-400">
                        {c.email}
                      </a>
                    )}
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="btn-secondary text-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="text-sm text-red-600 hover:text-red-700">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {canManage && (
          <div>
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Contact' : 'Add Contact'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-base mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="input-base mt-1"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="input-base mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-base mt-1"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  {editing ? 'Update' : 'Add'}
                </button>
                {editing && (
                  <button type="button" onClick={() => { setEditing(null); setForm({ name: '', role: 'HR', phone: '', email: '' }) }} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmergencyContacts
