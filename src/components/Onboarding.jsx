import { useState } from 'react'
import Field, { inputClass } from './Field'
import { ACTIVITY_LEVELS, GOAL_MODES, calculateBMR, calculateTDEE, goalForMode } from '../lib/nutrition'

const RANGES = {
  age: [10, 100],
  weight: [30, 300],
  height: [100, 250],
}

export default function Onboarding({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    sex: initial?.sex ?? 'male',
    age: initial?.age ?? '',
    weight: initial?.weight ?? '',
    height: initial?.height ?? '',
    activity: initial?.activity ?? 'light',
    mode: initial?.mode ?? 'maintain',
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const profile = {
    sex: form.sex,
    age: Number(form.age),
    weight: Number(form.weight),
    height: Number(form.height),
    activity: form.activity,
  }
  const valid = Object.entries(RANGES).every(([k, [min, max]]) => profile[k] >= min && profile[k] <= max)
  const bmr = valid ? calculateBMR(profile) : null
  const maintenance = valid ? Math.round(calculateTDEE(profile)) : null
  const goal = valid ? goalForMode(maintenance, form.mode) : null

  function handleSubmit(e) {
    e.preventDefault()
    if (!valid) return
    onSubmit({ ...profile, bmr: Math.round(bmr), maintenance, mode: form.mode, goal })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg items-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h1 className="text-xl font-semibold tracking-tight">
          {initial ? 'Edit profile' : 'Your details'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Used to calculate your daily calorie goal.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Sex</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['male', 'Male'],
                ['female', 'Female'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, sex: value }))}
                  aria-pressed={form.sex === value}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                    form.sex === value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Age" unit="years">
              <input type="number" inputMode="numeric" className={inputClass} value={form.age} onChange={set('age')} placeholder="25" required min={RANGES.age[0]} max={RANGES.age[1]} />
            </Field>
            <Field label="Weight" unit="kg">
              <input type="number" inputMode="decimal" step="0.1" className={inputClass} value={form.weight} onChange={set('weight')} placeholder="70" required min={RANGES.weight[0]} max={RANGES.weight[1]} />
            </Field>
            <Field label="Height" unit="cm">
              <input type="number" inputMode="numeric" className={inputClass} value={form.height} onChange={set('height')} placeholder="175" required min={RANGES.height[0]} max={RANGES.height[1]} />
            </Field>
          </div>

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Activity level</legend>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((level) => (
                <label
                  key={level.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                    form.activity === level.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
                      : 'border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="activity"
                    value={level.id}
                    checked={form.activity === level.id}
                    onChange={set('activity')}
                    className="accent-emerald-500"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{level.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{level.hint}</span>
                  </span>
                  <span className="text-xs text-slate-400">×{level.factor}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-300">Goal</legend>
            <div className="grid grid-cols-3 gap-2">
              {GOAL_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mode: m.id }))}
                  aria-pressed={form.mode === m.id}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                    form.mode === m.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              {GOAL_MODES.find((m) => m.id === form.mode).hint}
            </p>
          </fieldset>
        </div>

        <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800/60" aria-live="polite">
          {valid ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-slate-500 dark:text-slate-400">
                  BMR {Math.round(bmr)} kcal · maintenance {maintenance.toLocaleString('en-GB')} kcal
                </div>
                <div className="font-semibold">Daily goal</div>
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {goal.toLocaleString('en-GB')} <span className="text-sm font-medium">kcal</span>
              </div>
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">
              Fill in your details to see your daily goal.
            </span>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!valid}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {initial ? 'Save' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  )
}
