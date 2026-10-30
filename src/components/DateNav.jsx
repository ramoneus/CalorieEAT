import { useEffect, useRef, useState } from 'react'
import { addDays, dateFromKey, formatDate, todayKey } from '../lib/dates'

const WEEKDAYS = ['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ']
const STATUS = {
  under: { dot: 'bg-emerald-600', label: 'εντός στόχου' },
  over: { dot: 'bg-rose-500', label: 'πάνω από τον στόχο' },
}

const iconBtn =
  'rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30 ' +
  'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'

function Chevron({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'} />
    </svg>
  )
}

function dayLabel(date, today) {
  const dayMonth = formatDate(date, { day: 'numeric', month: 'long' })
  if (date === today) return `Σήμερα, ${dayMonth}`
  if (date === addDays(today, -1)) return `Χθες, ${dayMonth}`
  return formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })
}

function Calendar({ selected, today, statusFor, onSelect }) {
  const [month, setMonth] = useState(() => `${selected.slice(0, 7)}-01`)
  const first = dateFromKey(month)
  const offset = (first.getDay() + 6) % 7 // Monday-first grid
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const cells = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => addDays(month, i)),
  ]
  const shiftMonth = (n) => setMonth(todayKey(new Date(first.getFullYear(), first.getMonth() + n, 1)))
  const isCurrentMonth = month === `${today.slice(0, 7)}-01`

  return (
    <div className="w-72">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className={iconBtn} onClick={() => shiftMonth(-1)} aria-label="Προηγούμενος μήνας">
          <Chevron dir="left" />
        </button>
        <span className="text-sm font-semibold capitalize">
          {first.toLocaleDateString('el-GR', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" className={iconBtn} onClick={() => shiftMonth(1)} disabled={isCurrentMonth} aria-label="Επόμενος μήνας">
          <Chevron dir="right" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-xs font-medium text-slate-400">
            {d}
          </span>
        ))}
        {cells.map((date, i) => {
          if (!date) return <span key={`pad-${i}`} />
          const status = STATUS[statusFor(date)]
          const isSelected = date === selected
          return (
            <button
              key={date}
              type="button"
              disabled={date > today}
              onClick={() => onSelect(date)}
              aria-current={date === today ? 'date' : undefined}
              aria-pressed={isSelected}
              aria-label={`${formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}${status ? `, ${status.label}` : ''}`}
              className={`flex h-9 flex-col items-center justify-center rounded-lg text-sm transition disabled:opacity-30 ${
                isSelected
                  ? 'bg-emerald-600 font-semibold text-white'
                  : `hover:bg-slate-100 dark:hover:bg-slate-800 ${date === today ? 'font-semibold ring-1 ring-slate-300 dark:ring-slate-600' : ''}`
              }`}
            >
              {Number(date.slice(8))}
              <span
                className={`mt-0.5 h-1.5 w-1.5 rounded-full ${status ? (isSelected ? 'bg-white' : status.dot) : 'bg-transparent'}`}
                aria-hidden="true"
              />
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex gap-4 border-t border-slate-200 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {Object.values(STATUS).map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden="true" />
            {s.label[0].toUpperCase() + s.label.slice(1)}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DateNav({ date, today, statusFor, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      <button type="button" className={iconBtn} onClick={() => onChange(addDays(date, -1))} aria-label="Προηγούμενη μέρα">
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition hover:bg-slate-200 dark:hover:bg-slate-800"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-slate-400">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span className="first-letter:uppercase">{dayLabel(date, today)}</span>
      </button>
      <button type="button" className={iconBtn} onClick={() => onChange(addDays(date, 1))} disabled={date >= today} aria-label="Επόμενη μέρα">
        <Chevron dir="right" />
      </button>
      {date !== today && (
        <button
          type="button"
          onClick={() => onChange(today)}
          className="ml-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Σήμερα
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Επιλογή ημέρας"
          className="absolute top-full right-0 z-20 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:left-0 sm:right-auto dark:border-slate-800 dark:bg-slate-900"
        >
          <Calendar
            selected={date}
            today={today}
            statusFor={statusFor}
            onSelect={(d) => {
              onChange(d)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
