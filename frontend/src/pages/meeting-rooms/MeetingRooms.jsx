import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getRooms, getBookings, cancelBooking } from '../../api/meetingRoomApi'

function formatTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function MeetingRooms() {
  const { user } = useAuth()
  const canCreate = user?.role === 'Admin' || user?.role === 'IT'
  const userId = user?._id?.toString?.() || user?.id?.toString?.()
  const [rooms, setRooms] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setError(null)
    Promise.all([
      getRooms(),
      getBookings({ from: new Date().toISOString() }),
    ])
      .then(([roomsRes, bookingsRes]) => {
        setRooms(roomsRes?.rooms || [])
        setBookings(bookingsRes?.bookings || [])
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || 'Failed to load')
        setRooms([])
        setBookings([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const handleCancel = (id) => {
    if (!confirm('Cancel this booking?')) return
    cancelBooking(id)
      .then(() => load())
      .catch((e) => setError(e.response?.data?.message || 'Failed to cancel'))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <svg className="h-10 w-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading meeting rooms...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Meeting Room Booking</h1>
        <Link to="/meeting-rooms/book" className="btn-primary inline-flex gap-2">
          Book a Room
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Rooms</h2>
          {rooms.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-slate-500 dark:text-slate-400">No meeting rooms yet</p>
              {canCreate && (
                <Link to="/meeting-rooms/new" className="btn-primary mt-4 inline-flex">
                  Add first room
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((r) => (
                <div
                  key={r._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{r.name}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Capacity: {r.capacity} · {r.floor ? `Floor ${r.floor}` : '—'}
                      </p>
                      {r.amenities?.length > 0 && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {r.amenities.join(', ')}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/meeting-rooms/book?room=${r._id}`}
                      className="btn-primary self-center text-sm"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))}
              {canCreate && (
                <Link
                  to="/meeting-rooms/new"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-600 transition-colors hover:border-primary-400 hover:bg-primary-50/30 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
                >
                  + Add Room
                </Link>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-semibold text-slate-900 dark:text-white">Upcoming Bookings</h2>
          {bookings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800">
              <p className="text-slate-500 dark:text-slate-400">No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
                >
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {b.room?.name} · {formatDate(b.startTime)} · {formatTime(b.startTime)} – {formatTime(b.endTime)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        by {b.user?.name || 'Unknown'}
                      </p>
                    </div>
                    {(b.user?._id?.toString?.() === userId || canCreate) && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingRooms
