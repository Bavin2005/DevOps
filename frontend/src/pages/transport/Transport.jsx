import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import {
  getTransportRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
  bookCab,
  getMyCabBookings,
  getAllCabBookings,
  updateCabBooking,
  deleteCabBooking
} from '../../api/transportApi'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const CAB_TYPES = ['Sedan', 'SUV', 'Hatchback']

function Transport() {
  const { user } = useAuth()
  const canManage = user?.role === 'Admin' || user?.role === 'IT'
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', pickupPoints: [], timings: [] })

  // Cab booking state
  const [showBookCab, setShowBookCab] = useState(false)
  const [cabBookings, setCabBookings] = useState([])
  const [cabForm, setCabForm] = useState({
    pickupLocation: '',
    dropLocation: '',
    pickupDate: '',
    pickupTime: '',
    cabType: 'Sedan',
    passengerCount: 1,
    purpose: ''
  })
  const [bookingLoading, setBookingLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('routes') // 'routes' or 'cabs'

  const load = () => {
    setError(null)
    getTransportRoutes()
      .then((res) => setRoutes(res?.routes || []))
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load routes')
        setRoutes([])
      })
      .finally(() => setLoading(false))
  }

  const loadCabBookings = () => {
    const apiCall = canManage ? getAllCabBookings() : getMyCabBookings()
    apiCall
      .then((res) => setCabBookings(res?.bookings || []))
      .catch((err) => {
        console.error('Failed to load cab bookings:', err)
        setCabBookings([])
      })
  }

  useEffect(() => {
    load()
    loadCabBookings()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return
    try {
      if (editing) {
        await updateRoute(editing._id, form)
        setEditing(null)
      } else {
        await createRoute(form)
      }
      setForm({ name: '', pickupPoints: [], timings: [] })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this route?')) return
    try {
      await deleteRoute(id)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleBookCab = async (e) => {
    e.preventDefault()
    if (!cabForm.pickupLocation || !cabForm.dropLocation || !cabForm.pickupDate || !cabForm.pickupTime) {
      toast.error('Please fill all required fields')
      return
    }
    setBookingLoading(true)
    try {
      await bookCab(cabForm)
      toast.success('Cab booking submitted successfully')
      setCabForm({
        pickupLocation: '',
        dropLocation: '',
        pickupDate: '',
        pickupTime: '',
        cabType: 'Sedan',
        passengerCount: 1,
        purpose: ''
      })
      setShowBookCab(false)
      loadCabBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book cab')
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async (id) => {
    if (!confirm('Cancel this cab booking?')) return
    try {
      await updateCabBooking(id, { status: 'Cancelled' })
      toast.success('Booking cancelled')
      loadCabBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const handleConfirmBooking = async (id) => {
    const driverName = prompt('Enter driver name:')
    const driverPhone = prompt('Enter driver phone:')
    const cabNumber = prompt('Enter cab number:')
    if (!driverName || !driverPhone || !cabNumber) return

    try {
      await updateCabBooking(id, { status: 'Confirmed', driverName, driverPhone, cabNumber })
      toast.success('Booking confirmed')
      loadCabBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to confirm')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading transport schedule...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transport</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Shuttle routes and cab bookings</p>
        </div>
        {!showBookCab && activeTab === 'cabs' && (
          <button onClick={() => setShowBookCab(true)} className="btn-primary">
            Book a Cab
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setActiveTab('routes'); setShowBookCab(false) }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'routes'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Shuttle Routes
        </button>
        <button
          onClick={() => { setActiveTab('cabs'); setShowBookCab(false) }}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'cabs'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Cab Bookings
          {cabBookings.filter((b) => b.status === 'Pending').length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
              {cabBookings.filter((b) => b.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Routes Tab */}
      {activeTab === 'routes' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Shuttle Routes</h2>
          {routes.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-slate-500 dark:text-slate-400">No transport routes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {routes.map((r) => (
                <div
                  key={r._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{r.name}</h3>
                      {r.pickupPoints?.length > 0 && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Pickup: {r.pickupPoints.join(', ')}
                        </p>
                      )}
                      {r.timings?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {r.timings.map((t) => (
                            <p key={t.dayOfWeek} className="text-xs text-slate-600 dark:text-slate-400">
                              {DAY_NAMES[t.dayOfWeek]}: {t.times?.join(', ') || '—'}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditing(r); setForm({ name: r.name, pickupPoints: r.pickupPoints || [], timings: r.timings || [] }) }}
                          className="btn-secondary text-sm"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDelete(r._id)} className="text-sm text-red-600 hover:text-red-700">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {canManage && (
          <div>
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">{editing ? 'Edit Route' : 'Add Route'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Route Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Route A - Downtown"
                  className="input-base mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Points (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(form.pickupPoints) ? form.pickupPoints.join(', ') : ''}
                  onChange={(e) => setForm({ ...form, pickupPoints: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="Point 1, Point 2, Point 3"
                  className="input-base mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Timings (Day: times)</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">e.g. Mon: 08:00,18:00 | Tue: 08:30,18:30</p>
                <textarea
                  value={form.timings?.map((t) => `${DAY_NAMES[t.dayOfWeek]}: ${t.times?.join(',') || ''}`).join('\n') || ''}
                  onChange={(e) => {
                    const lines = e.target.value.split('\n').filter(Boolean)
                    const timings = lines.map((line) => {
                      const [dayStr, timesStr] = line.split(':').map((s) => s.trim())
                      const dayOfWeek = DAY_NAMES.indexOf(dayStr)
                      const times = timesStr ? timesStr.split(',').map((s) => s.trim()).filter(Boolean) : []
                      return { dayOfWeek: dayOfWeek >= 0 ? dayOfWeek : 1, times }
                    }).filter((t) => t.dayOfWeek >= 0)
                    setForm({ ...form, timings })
                  }}
                  rows={4}
                  placeholder="Mon: 08:00, 18:00&#10;Tue: 08:00, 18:00"
                  className="input-base mt-1"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  {editing ? 'Update' : 'Add Route'}
                </button>
                {editing && (
                  <button type="button" onClick={() => { setEditing(null); setForm({ name: '', pickupPoints: [], timings: [] }) }} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
        </div>
      )}

      {/* Cab Bookings Tab */}
      {activeTab === 'cabs' && (
        <div>
          {showBookCab && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Book a Cab</h2>
                <button onClick={() => setShowBookCab(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleBookCab} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Location *</label>
                  <input
                    type="text"
                    value={cabForm.pickupLocation}
                    onChange={(e) => setCabForm({ ...cabForm, pickupLocation: e.target.value })}
                    required
                    placeholder="e.g. Office Main Gate"
                    className="input-base mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Drop Location *</label>
                  <input
                    type="text"
                    value={cabForm.dropLocation}
                    onChange={(e) => setCabForm({ ...cabForm, dropLocation: e.target.value })}
                    required
                    placeholder="e.g. Airport Terminal 2"
                    className="input-base mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Date *</label>
                  <input
                    type="date"
                    value={cabForm.pickupDate}
                    onChange={(e) => setCabForm({ ...cabForm, pickupDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="input-base mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pickup Time *</label>
                  <input
                    type="time"
                    value={cabForm.pickupTime}
                    onChange={(e) => setCabForm({ ...cabForm, pickupTime: e.target.value })}
                    required
                    className="input-base mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cab Type</label>
                  <select
                    value={cabForm.cabType}
                    onChange={(e) => setCabForm({ ...cabForm, cabType: e.target.value })}
                    className="input-base mt-1"
                  >
                    {CAB_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Passengers</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={cabForm.passengerCount}
                    onChange={(e) => setCabForm({ ...cabForm, passengerCount: parseInt(e.target.value) || 1 })}
                    className="input-base mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Purpose</label>
                  <input
                    type="text"
                    value={cabForm.purpose}
                    onChange={(e) => setCabForm({ ...cabForm, purpose: e.target.value })}
                    placeholder="e.g. Client meeting, Airport pickup"
                    className="input-base mt-1"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button type="submit" disabled={bookingLoading} className="btn-primary">
                    {bookingLoading ? 'Submitting...' : 'Submit Booking'}
                  </button>
                  <button type="button" onClick={() => setShowBookCab(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cab Bookings List */}
          <div>
            <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">
              {canManage ? 'All Cab Bookings' : 'My Cab Bookings'}
            </h2>
            {cabBookings.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
                <p className="text-slate-500 dark:text-slate-400">No cab bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cabBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {booking.pickupLocation} → {booking.dropLocation}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              booking.status === 'Confirmed'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : booking.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          <p>
                            📅 {new Date(booking.pickupDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} at {booking.pickupTime}
                          </p>
                          <p>🚗 {booking.cabType} · {booking.passengerCount} passenger(s)</p>
                          {booking.purpose && <p>📝 {booking.purpose}</p>}
                          {canManage && booking.user && (
                            <p>👤 {booking.user.name} ({booking.user.email})</p>
                          )}
                          {booking.status === 'Confirmed' && booking.driverName && (
                            <p className="mt-2 font-medium text-green-700 dark:text-green-400">
                              Driver: {booking.driverName} · {booking.driverPhone} · {booking.cabNumber}
                            </p>
                          )}
                          {booking.notes && <p className="italic">Note: {booking.notes}</p>}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        {booking.status === 'Pending' && canManage && (
                          <button
                            onClick={() => handleConfirmBooking(booking._id)}
                            className="text-sm text-green-600 hover:text-green-700"
                          >
                            Confirm
                          </button>
                        )}
                        {booking.status === 'Pending' && !canManage && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Transport
