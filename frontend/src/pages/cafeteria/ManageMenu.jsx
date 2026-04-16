import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getMenuForDate, updateMenu } from '../../api/cafeteriaApi'

function ManageMenu() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = (d = date) => {
    setLoading(true)
    getMenuForDate(d)
      .then((res) => setItems(res?.items?.length ? res.items : [{ name: '', type: 'Veg', price: 0 }]))
      .catch(() => setItems([{ name: '', type: 'Veg', price: 0 }]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(date)
  }, [date])

  const addItem = () => setItems([...items, { name: '', type: 'Veg', price: 0 }])
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i, field, value) => {
    const next = [...items]
    next[i] = { ...next[i], [field]: value }
    setItems(next)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const valid = items.filter((i) => i.name?.trim())
    if (valid.length === 0) {
      toast.error('Add at least one menu item')
      return
    }
    setSaving(true)
    updateMenu(date, valid)
      .then(() => {
        toast.success('Menu saved')
        load(date)
      })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to save'))
      .finally(() => setSaving(false))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Today&apos;s Menu</h1>
        <button onClick={() => navigate(-1)} className="btn-secondary">
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-base mt-1"
          />
        </div>

        {loading ? (
          <p className="text-slate-500 dark:text-slate-400">Loading...</p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Menu Items</label>
              <button type="button" onClick={addItem} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                + Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(i, 'name', e.target.value)}
                    placeholder="Item name"
                    className="input-base flex-1"
                  />
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(i, 'type', e.target.value)}
                    className="input-base w-28"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={item.price || ''}
                    onChange={(e) => updateItem(i, 'price', Number(e.target.value) || 0)}
                    placeholder="₹"
                    className="input-base w-20"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving || loading} className="btn-primary">
            {saving ? 'Saving...' : 'Save Menu'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default ManageMenu
