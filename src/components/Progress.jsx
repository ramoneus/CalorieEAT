import { useRef, useState } from 'react'
import { CaloriesChart, WeightChart } from './charts'
import Field, { inputClass } from './Field'
import { lastDays, todayKey } from '../lib/dates'
import { caloriesByDay, goalFor } from '../lib/history'
import { fmtNumber } from '../lib/meals'

const RANGES = [7, 30, 90]
const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60'
const fmtKcal = (n) => Math.round(n).toLocaleString('en-GB')

function Stat({ label, value, sub }) {
  return (
    <div className={`${card} !p-4`}>
      <div className="text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-semibold whitespace-nowrap sm:text-3xl">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

function WeightForm({ onLog }) {
  const [date, setDate] = useState(todayKey)
  const [kg, setKg] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const value = Number(kg)
    if (value < 30 || value > 300) return
    onLog(date, Math.round(value * 10) / 10)
    setKg('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="w-28">
        <Field label="Weight" unit="kg">
          <input type="number" inputMode="decimal" step="0.1" min={30} max={300} className={inputClass} value={kg} onChange={(e) => setKg(e.target.value)} placeholder="70,5" required />
        </Field>
      </div>
      <div className="w-40">
        <Field label="Day">
          <input type="date" className={inputClass} value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} required />
        </Field>
      </div>
      <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
        Log
      </button>
    </form>
  )
}

function Backup({ onExport, onImport }) {
  const fileRef = useRef(null)
  const [message, setMessage] = useState(null)

  async function handleFile(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (data?.app !== 'calorEAT' || !Array.isArray(data.meals)) throw new Error('not a backup')
      const ok = window.confirm(
        `Your current data will be replaced with the data in this file (${data.meals.length} food entries). Continue?`,
      )
      if (!ok) return
      onImport(data)
      setMessage('Restore complete.')
    } catch {
      setMessage('This file is not a calorEAT backup.')
    }
  }

  const btn =
    'rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'

  return (
    <section className={card} aria-label="Backup">
      <h2 className="text-lg font-semibold">Backup</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Your data is stored only in this browser. Download a backup so it isn't lost, or to move it to another
        device.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={onExport} className={btn}>
          Download backup
        </button>
        <button type="button" onClick={() => fileRef.current.click()} className={btn}>
          Restore from file
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFile} />
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">
        {message}
      </p>
    </section>
  )
}

export default function Progress({ meals, goals, weights, onLogWeight, onDeleteWeight, onSelectDay, onExport, onImport }) {
  const [range, setRange] = useState(7)
  const today = todayKey()
  const byDay = caloriesByDay(meals)
  const days = lastDays(today, range).map((date) => ({ date, kcal: byDay[date] ?? null, goal: goalFor(goals, date) }))
  const logged = days.filter((d) => d.kcal)
  const avg = logged.length ? logged.reduce((s, d) => s + d.kcal, 0) / logged.length : null
  const diff = logged.length ? logged.reduce((s, d) => s + d.kcal - d.goal, 0) / logged.length : null
  const within = logged.filter((d) => d.kcal <= d.goal).length

  const points = weights.filter((w) => w.date >= days[0].date)
  const change = points.length > 1 ? points.at(-1).kg - points[0].kg : null
  const latest = weights.at(-1)

  return (
    <div className="space-y-6">
      <div className="flex gap-1" role="radiogroup" aria-label="Time range">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={range === r}
            onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              range === r
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {r} days
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Average / day" value={avg ? `${fmtKcal(avg)}` : '—'} sub={avg ? 'kcal' : 'Nothing logged'} />
        <Stat
          label="Compared with goal"
          value={diff === null ? '—' : `${diff > 0 ? '+' : '−'}${fmtKcal(Math.abs(diff))}`}
          sub={diff === null ? null : diff > 0 ? 'kcal/day over' : 'kcal/day under'}
        />
        <Stat label="Days within goal" value={`${within} / ${logged.length}`} sub={`${logged.length} of ${range} logged`} />
      </div>

      <section className={card} aria-label="Calories">
        <h2 className="mb-3 text-lg font-semibold">Calories per day</h2>
        <CaloriesChart days={days} onSelectDay={onSelectDay} />
      </section>

      <section className={card} aria-label="Weight">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Weight</h2>
          {latest && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Latest: <span className="font-semibold text-slate-900 dark:text-slate-100">{fmtNumber(latest.kg)} kg</span>
              {change !== null && ` · ${change > 0 ? '+' : change < 0 ? '−' : ''}${fmtNumber(Math.abs(change))} kg in ${range} days`}
            </span>
          )}
        </div>
        <WeightForm onLog={onLogWeight} />
        <div className="mt-5">
          {points.length > 0 ? (
            <WeightChart days={days} points={points} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No weight entries in this period.
            </div>
          )}
        </div>
        {latest && (
          <button
            type="button"
            onClick={() => onDeleteWeight(latest.date)}
            className="mt-3 text-xs text-slate-500 hover:text-rose-500 dark:text-slate-400"
          >
            Delete latest entry
          </button>
        )}
      </section>

      <Backup onExport={onExport} onImport={onImport} />
    </div>
  )
}
