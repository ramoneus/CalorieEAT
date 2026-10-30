// Days are local "YYYY-MM-DD" keys (not UTC), so a day rolls over at the user's midnight.
export function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const dateFromKey = (key) => new Date(`${key}T00:00:00`)

export function addDays(key, n) {
  const d = dateFromKey(key)
  d.setDate(d.getDate() + n)
  return todayKey(d)
}

// The n days ending on (and including) endKey, oldest first.
export const lastDays = (endKey, n) => Array.from({ length: n }, (_, i) => addDays(endKey, i - n + 1))

export const formatDate = (key, options) => dateFromKey(key).toLocaleDateString('el-GR', options)
