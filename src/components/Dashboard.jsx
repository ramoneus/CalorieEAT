import { useUnits } from '../hooks/useUnits'
import { addDays, formatDate, todayKey } from '../lib/dates'
import { fmtNumber } from '../lib/meals'
import { GOAL_MODES, daysToTarget, targetReached } from '../lib/nutrition'

const MACROS = [
  { key: 'protein', label: 'Protein', color: 'bg-protein', kcalPerGram: 4 },
  { key: 'carbs', label: 'Carbohydrates', short: 'Carbs', color: 'bg-carbs', kcalPerGram: 4 },
  { key: 'fat', label: 'Fat', color: 'bg-fat', kcalPerGram: 9 },
]

const fmt = (n) => Math.round(n).toLocaleString('en-GB')

// The day's state drives the whole card: the meter's fill and track, the badge and the number.
// Each state is one hue ramp (track = light step, fill = strong step) so it reads across the bar.
const STATES = {
  ok: {
    label: 'On track',
    fill: 'bg-emerald-500',
    track: 'bg-emerald-100 dark:bg-emerald-950',
    badge: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300',
    number: 'text-emerald-600 dark:text-emerald-400',
    card: 'border-slate-200 dark:border-slate-800',
  },
  close: {
    label: 'Almost there',
    fill: 'bg-amber-500',
    track: 'bg-amber-100 dark:bg-amber-950',
    badge: 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300',
    number: 'text-amber-600 dark:text-amber-400',
    card: 'border-slate-200 dark:border-slate-800',
  },
  over: {
    label: 'Over goal',
    fill: 'bg-rose-300 dark:bg-rose-900',
    track: 'bg-rose-100 dark:bg-rose-950',
    badge: 'bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300',
    number: 'text-rose-600 dark:text-rose-400',
    card: 'border-rose-300 ring-1 ring-rose-300/60 dark:border-rose-900 dark:ring-rose-900/60',
  },
}

// From 90% of the goal the bar turns amber, past it red.
const stateFor = (ratio) => (ratio > 1 ? 'over' : ratio >= 0.9 ? 'close' : 'ok')

const ICONS = {
  ok: <path d="M5 12l5 5L20 7" />,
  close: <path d="M12 8v5M12 16.5v.5M12 3l9.5 17h-19z" />,
  over: <path d="M12 7v6M12 16.5v.5M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />,
}

function StatusBadge({ state }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${STATES[state].badge}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {ICONS[state]}
      </svg>
      {STATES[state].label}
    </span>
  )
}

// Hatched fill for the part eaten beyond the goal, so "over" never relies on colour alone.
const OVERFLOW_STRIPES = {
  backgroundImage: 'repeating-linear-gradient(135deg, #e11d48 0 6px, #be123c 6px 9px)',
}

// The calorie meter. Under the goal it is a plain fill against the goal. Once over, the scale
// stretches to fit what was eaten: a tick marks the goal and the excess is drawn in hatched red.
// While losing, a second tick shows maintenance, the point where the day stops being a deficit.
function CalorieMeter({ eaten, goal, maintenance, mode, state }) {
  const over = eaten > goal
  const showMaintenance = over && mode === 'cut' && maintenance > goal
  const scale = Math.max(goal, eaten, showMaintenance ? maintenance * 1.04 : 0)
  const pct = (v) => `${(v / scale) * 100}%`
  const s = STATES[state]

  return (
    <div className="mt-5">
      <div className="relative py-1.5">
        <div
          className={`relative flex h-4 gap-0.5 overflow-hidden rounded-full transition-colors ${s.track}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.round(eaten)}
          aria-valuetext={`${fmt(eaten)} of ${fmt(goal)} kcal${over ? `, ${fmt(eaten - goal)} over` : ''}`}
          aria-label="Calories eaten"
        >
          <div
            className={`h-full shrink-0 rounded-l-full motion-safe:transition-all motion-safe:duration-500 ${s.fill} ${over ? '' : 'rounded-r-full'}`}
            style={{ width: pct(Math.min(eaten, goal)) }}
          />
          {over && <div className="h-full flex-1 rounded-r-full" style={OVERFLOW_STRIPES} />}
        </div>
        {over && <Tick at={pct(goal)} className="bg-slate-900 dark:bg-white" />}
        {showMaintenance && <Tick at={pct(maintenance)} className="bg-slate-400 dark:bg-slate-500" />}
      </div>
      {over && (
        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0.5 rounded-full bg-slate-900 dark:bg-white" aria-hidden="true" />
            Goal {fmt(goal)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-3 rounded-sm" style={OVERFLOW_STRIPES} aria-hidden="true" />
            Over by {fmt(eaten - goal)}
          </span>
          {showMaintenance && (
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-0.5 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden="true" />
              Maintenance {fmt(maintenance)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// A marker line crossing the bar, with a 2px surface ring so it stays visible on any fill.
function Tick({ at, className }) {
  return (
    <span
      className={`absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full ring-2 ring-white dark:ring-slate-900 ${className}`}
      style={{ left: at }}
      aria-hidden="true"
    />
  )
}

// One plain-language line about what today's number means for the plan.
function Insight({ eaten, goal, maintenance, mode, ratio }) {
  let text
  if (!eaten) text = 'Nothing logged yet.'
  else if (eaten <= goal) {
    text = mode === 'bulk' && ratio < 0.9 ? `Eat ${fmt(goal - eaten)} kcal more to hit today's gain goal.` : `${Math.round(ratio * 100)}% of your goal.`
  } else if (mode === 'cut' && eaten < maintenance) {
    text = `Over your goal, but still ${fmt(maintenance - eaten)} kcal under maintenance, so today is still a deficit.`
  } else if (mode === 'cut') {
    text = `${fmt(eaten - maintenance)} kcal above maintenance, so today is a surplus rather than a deficit.`
  } else if (mode === 'bulk') {
    text = 'Over your goal. A little extra is fine while gaining; a lot mostly adds fat.'
  } else {
    text = `${fmt(eaten - goal)} kcal above maintenance today.`
  }
  return <p className="mt-2 text-right text-xs text-slate-500 dark:text-slate-400">{text}</p>
}

// "0.5 kg/week · 4.5 kg to go · around 12 March 2027", or the floor / target-reached notes.
function PlanLine({ plan, goal, maintenance, onEditPlan }) {
  const { fmtRate, fmtWeight } = useUnits()
  const parts = [fmtRate(plan.rate)]
  if (plan.target) {
    if (targetReached(plan.mode, plan.current, plan.target)) {
      parts.push(`target ${fmtWeight(plan.target)} reached`)
    } else {
      parts.push(`${fmtWeight(Math.abs(plan.target - plan.current))} to go`)
      const days = daysToTarget({ current: plan.current, target: plan.target, maintenance, goal })
      if (days !== null) parts.push(`around ${formatDate(addDays(todayKey(), days), { day: 'numeric', month: 'long', year: 'numeric' })}`)
    }
  }

  return (
    <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
      <span>{parts.join(' · ')}</span>
      {plan.limited && <span className="text-amber-700 dark:text-amber-400">· held at the minimum daily goal</span>}
      <button type="button" onClick={onEditPlan} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
        {plan.target ? 'Edit plan' : 'Set a target'}
      </button>
    </div>
  )
}

export default function Dashboard({ goal, totals, mode, maintenance, onSetMode, plan, onEditPlan }) {
  const delta = goal - maintenance
  const remaining = goal - totals.calories
  const over = remaining < 0
  const ratio = totals.calories / goal
  const state = stateFor(ratio)

  const macroKcal = MACROS.reduce((s, m) => s + totals[m.key] * m.kcalPerGram, 0)

  return (
    <section className="space-y-4" aria-label="Daily summary">
      <div className={`rounded-2xl border bg-white p-5 shadow-sm transition-colors sm:p-6 dark:bg-slate-900/60 ${STATES[state].card}`}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="radiogroup" aria-label="Goal mode">
            {GOAL_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                disabled={!onSetMode}
                onClick={() => onSetMode?.(m.id)}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition sm:text-sm ${
                  mode === m.id
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                } ${onSetMode && mode !== m.id ? 'hover:text-slate-900 dark:hover:text-white' : ''} ${!onSetMode && mode !== m.id ? 'opacity-50' : ''}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} aria-hidden="true" />
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pr-2.5 pl-2 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z" />
              </svg>
              Burn <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{fmt(maintenance)}</span> kcal/day
            </span>
            {delta !== 0 && (
              <span
                className={`inline-flex items-center gap-1 rounded-full py-1 pr-2.5 pl-2 font-semibold tabular-nums ${
                  delta > 0
                    ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300'
                }`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={delta > 0 ? 'M12 19V5M5 12l7-7 7 7' : 'M12 5v14M19 12l-7 7-7-7'} />
                </svg>
                {fmt(Math.abs(delta))} kcal/day {delta > 0 ? 'surplus' : 'deficit'}
              </span>
            )}
          </div>
        </div>
        {plan && mode !== 'maintain' && <PlanLine plan={plan} goal={goal} maintenance={maintenance} onEditPlan={onEditPlan} />}
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Eaten</div>
            <div className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
              {fmt(totals.calories)}
              <span className="ml-1 text-base font-medium text-slate-400"> / {fmt(goal)} kcal</span>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge state={state} />
            <div className={`mt-1 text-2xl font-bold tabular-nums sm:text-3xl ${STATES[state].number}`}>
              {over && '+'}
              {fmt(Math.abs(remaining))}
              <span className="ml-1 text-sm font-medium">{over ? 'kcal over' : 'kcal left'}</span>
            </div>
          </div>
        </div>

        <CalorieMeter eaten={totals.calories} goal={goal} maintenance={maintenance} mode={mode} state={state} />
        <Insight eaten={totals.calories} goal={goal} maintenance={maintenance} mode={mode} ratio={ratio} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {MACROS.map((m) => {
          const share = macroKcal ? Math.round(((totals[m.key] * m.kcalPerGram) / macroKcal) * 100) : 0
          return (
            <div
              key={m.key}
              className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 sm:text-sm dark:text-slate-400">
                <span className={`h-2.5 w-2.5 rounded-full ${m.color}`} />
                <span className="sm:hidden">{m.short ?? m.label}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </div>
              <div className="mt-1 text-2xl font-bold sm:text-3xl">
                {fmtNumber(totals[m.key])}
                <span className="ml-0.5 text-sm font-medium text-slate-400">g</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-full rounded-full ${m.color}`} style={{ width: `${share}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-400">{share}% of calories</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
