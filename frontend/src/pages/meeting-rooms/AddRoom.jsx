import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createRoom } from '../../api/meetingRoomApi'

const AMENITY_OPTIONS = ['Projector', 'Whiteboard', 'Video Conferencing', 'Screen', 'AC']

function AddRoom() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    capacity: 4,
    floor: '',
    amenities: [],
  })
  const [loading, setLoading] = useState(false)

  const toggleAmenity = (a) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Room name is required')
      return
    }
    setLoading(true)
    createRoom(form)
      .then(() => {
        toast.success('Room created')
        navigate('/meeting-rooms')
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to create')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Meeting Room</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Room Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="e.g. Conference A"
            className="input-base mt-1"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity *</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 4 })}
              className="input-base mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Floor</label>
            <input
              type="text"
              value={form.floor}
              onChange={(e) => setForm({ ...form, floor: e.target.value })}
              placeholder="e.g. 2"
              className="input-base mt-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amenities</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <label key={a} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-600">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{a}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : 'Create Room'}
          </button>
          <button type="button" onClick={() => navigate('/meeting-rooms')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddRoom
