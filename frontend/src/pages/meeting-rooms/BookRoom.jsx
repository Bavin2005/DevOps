import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getRooms, createBooking } from '../../api/meetingRoomApi'

function BookRoom() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedRoom = searchParams.get('room')
  const [rooms, setRooms] = useState([])
  const [form, setForm] = useState({
    roomId: preselectedRoom || '',
    title: '',
    startTime: '',
    endTime: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getRooms()
      .then((res) => {
        setRooms(res?.rooms || [])
        if (preselectedRoom && !form.roomId) setForm((f) => ({ ...f, roomId: preselectedRoom }))
      })
      .catch(() => setRooms([]))
  }, [preselectedRoom])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.roomId || !form.title || !form.startTime || !form.endTime) {
      toast.error('Please fill all required fields')
      return
    }
    const start = new Date(form.startTime)
    const end = new Date(form.endTime)
    if (end <= start) {
      toast.error('End time must be after start time')
      return
    }
    setLoading(true)
    createBooking(form)
      .then(() => {
        toast.success('Room booked successfully')
        navigate('/meeting-rooms')
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to book')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Book Meeting Room</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room *</label>
          <select
            value={form.roomId}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
            required
            className="input-base mt-1"
          >
            <option value="">Select room</option>
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name} (Capacity: {r.capacity})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Meeting title"
            className="input-base mt-1"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start *</label>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
              className="input-base mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">End *</label>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
              className="input-base mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Optional notes"
            className="input-base mt-1"
          />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Booking...' : 'Book Room'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/meeting-rooms')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookRoom
