import { useRef, useState } from 'react'
import { BalanceChart, CaloriesChart, WeightChart } from './charts'
import Field, { inputClass } from './Field'
import { daysBetween, lastDays, todayKey } from '../lib/dates'
import { balanceSeries, caloriesByDay, goalFor, maintenanceFor, modeFor } from '../lib/history'
import { fmtNumber } from '../lib/meals'
import { KCAL_PER_KG, modeById } from '../lib/nutrition'

const RANGES = [7, 30, 90, 'all']
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
  const firstLogged = Object.keys(byDay).sort()[0]
  // "All" runs from the first logged day (at least a week) up to today.
  const rangeDays = range === 'all' ? Math.max(7, firstLogged ? daysBetween(firstLogged, today) + 1 : 0) : range
  const days = lastDays(today, rangeDays).map((date) => ({
    date,
    kcal: byDay[date] ?? null,
    goal: goalFor(goals, date),
    maintenance: maintenanceFor(goals, date),
    mode: modeFor(goals, date),
  }))
  const series = balanceSeries(meals, goals, today)
  const balance = series.at(-1)?.balance ?? 0
  const loggedTotal = series.filter((d) => d.kcal).length
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
            {r === 'all' ? 'All time' : `${r} days`}
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
        <Stat label="Days within goal" value={`${within} / ${logged.length}`} sub={`${logged.length} of ${rangeDays} logged`} />
      </div>

      <section className={card} aria-label="Calories">
        <h2 className="mb-3 text-lg font-semibold">Calories per day</h2>
        <CaloriesChart days={days} onSelectDay={onSelectDay} />
      </section>

      <section className={card} aria-label="Overall progress">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Overall progress</h2>
          {series.length > 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {modeById(modeFor(goals, today)).label} now
            </span>
          )}
        </div>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Your running surplus or deficit against maintenance since you started logging. Days with nothing logged are not counted.
        </p>
        {series.length > 0 ? (
          <>
            <div className="mb-4 grid grid-cols-3 gap-3">
              <Stat label="Days logged" value={loggedTotal} sub={`since ${series[0].date}`} />
              <Stat
                label="Total balance"
                value={`${balance > 0 ? '+' : balance < 0 ? '−' : ''}${fmtKcal(Math.abs(balance))}`}
                sub="kcal vs maintenance"
              />
              <Stat
                label="Estimated change"
                value={`${balance > 0 ? '+' : balance < 0 ? '−' : ''}${fmtNumber(Math.abs(balance) / KCAL_PER_KG)}`}
                sub="kg, rough estimate"
              />
            </div>
            <BalanceChart days={series} onSelectDay={onSelectDay} />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Log some meals to start tracking your overall progress.
          </div>
        )}
      </section>

      <section className={card} aria-label="Weight">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Weight</h2>
          {latest && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Latest: <span className="font-semibold text-slate-900 dark:text-slate-100">{fmtNumber(latest.kg)} kg</span>
              {change !== null && ` · ${change > 0 ? '+' : change < 0 ? '−' : ''}${fmtNumber(Math.abs(change))} kg in ${rangeDays} days`}
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
