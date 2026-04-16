import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getEmergencyContacts } from '../api/emergencyContactApi'

function EmergencyContactsWidget() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEmergencyContacts()
      .then((res) => setContacts(res?.contacts || []))
      .catch(() => setContacts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || contacts.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">Emergency Contacts</h3>
        <Link to="/emergency" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          View all
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {contacts.slice(0, 4).map((c) => (
          <li key={c._id} className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">{c.name}</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">{c.role}</span>
            <a href={`tel:${c.phone}`} className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              {c.phone}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default EmergencyContactsWidget
