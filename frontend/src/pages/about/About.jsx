import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getCompanyInfo, updateCompanyInfo } from '../../api/companyInfoApi'
import toast from 'react-hot-toast'
import Skeleton from '../../components/Skeleton'

const DEFAULTS = {
  name: 'Enterprise Portal',
  mission: 'To empower our teams with the best tools and information.',
  vision: 'A workplace where everyone has what they need to succeed.',
  values: 'Integrity • Collaboration • Excellence • Innovation',
  founded: '2024',
  address: '123 Business Ave, Suite 100',
  phone: '+1 (555) 123-4567',
  email: 'contact@company.com',
}

function About() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    getCompanyInfo()
      .then((data) => setInfo({ ...DEFAULTS, ...data }))
      .catch(() => setInfo(DEFAULTS))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleEdit = (key, value) => {
    setEditing(key)
    setEditValue(value || '')
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await updateCompanyInfo(editing, editValue)
      setInfo((prev) => ({ ...prev, [editing]: editValue }))
      toast.success('Updated')
      setEditing(null)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-slide-in">
        <Skeleton variant="title" className="mb-6" />
        <Skeleton className="mb-4" />
        <Skeleton className="mb-4 w-4/5" />
        <Skeleton className="w-2/3" />
      </div>
    )
  }

  const fields = [
    { key: 'name', label: 'Company Name', large: true },
    { key: 'mission', label: 'Mission', large: true },
    { key: 'vision', label: 'Vision', large: true },
    { key: 'values', label: 'Values', large: true },
    { key: 'founded', label: 'Founded' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">About the Company</h1>

      <div className="card space-y-6 p-8">
        {fields.map(({ key, label, large }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
              {label}
            </label>
            {editing === key ? (
              <div className="mt-2 flex gap-2">
                {large ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={3}
                    className="input-base flex-1"
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="input-base flex-1"
                    autoFocus
                  />
                )}
                <button onClick={handleSave} disabled={saving} className="btn-primary shrink-0">
                  {saving ? '...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="btn-secondary shrink-0"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <p
                className={`mt-2 text-slate-900 dark:text-white ${large ? 'text-lg' : ''}`}
              >
                {info[key] || '—'}
                {isAdmin && (
                  <button
                    onClick={() => handleEdit(key, info[key])}
                    className="ml-2 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Edit
                  </button>
                )}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default About
