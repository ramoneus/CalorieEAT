import { useState } from 'react'
import { useWidth } from '../hooks/useWidth'
import { formatDate } from '../lib/dates'
import { fmtNumber } from '../lib/meals'

const HEIGHT = 200
const PAD = { top: 12, right: 12, bottom: 24, left: 44 }

const fmtKcal = (n) => Math.round(n).toLocaleString('en-GB')
const shortDate = (date) => formatDate(date, { weekday: 'short', day: 'numeric', month: 'short' })

// Rounded 4px data-end, square at the baseline.
function barPath(x, top, w, base) {
  const r = Math.min(4, w / 2, base - top)
  return `M${x} ${base}V${top + r}Q${x} ${top} ${x + r} ${top}H${x + w - r}Q${x + w} ${top} ${x + w} ${top + r}V${base}Z`
}

// Which x positions get a date label: every day for a week, otherwise whole weeks counting back
// from today, spaced so labels stay at least ~48px apart.
function xLabel(days, i, band) {
  const every = days.length <= 7 ? 1 : 7 * Math.max(1, Math.ceil(48 / (band * 7)))
  if ((days.length - 1 - i) % every !== 0) return null
  return days.length <= 7
    ? formatDate(days[i].date, { weekday: 'short' })
    : formatDate(days[i].date, { day: 'numeric', month: 'numeric' })
}

function Frame({ width, ticks, y, format, days, band, children }) {
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="1" />
          <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px] tabular-nums">
            {format(t)}
          </text>
        </g>
      ))}
      {children}
      {days.map((d, i) => {
        const label = xLabel(days, i, band)
        const x = PAD.left + (i + 0.5) * band
        // Keep the last label inside the chart instead of centring it past the edge.
        const atEdge = x > width - 24
        return (
          label && (
            <text key={d.date} x={atEdge ? width - 2 : x} y={HEIGHT - 6} textAnchor={atEdge ? 'end' : 'middle'} className="fill-slate-400 text-[11px]">
              {label}
            </text>
          )
        )
      })}
    </>
  )
}

function Tooltip({ x, y, width, children }) {
  const left = Math.min(Math.max(x, 70), width - 70)
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs whitespace-nowrap shadow-md dark:border-slate-700 dark:bg-slate-900"
      style={{ left, top: y - 8 }}
    >
      {children}
    </div>
  )
}

function TableView({ caption, head, rows }) {
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        Show as table
      </summary>
      <div className="mt-2 max-h-64 overflow-y-auto">
        <table className="w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr>
              {head.map((h) => (
                <th key={h} className="py-1 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.map((r) => (
              <tr key={r[0]} className="border-t border-slate-200 dark:border-slate-800">
                {r.slice(1).map((c, i) => (
                  <td key={i} className="py-1">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}

// days: [{ date, kcal (null when nothing was logged), goal }]
export function CaloriesChart({ days, onSelectDay }) {
  const [ref, width] = useWidth()
  const [active, setActive] = useState(null)

  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const band = plotW / days.length
  const barW = Math.max(2, Math.min(24, band - 2))
  const step = 1000
  const max = Math.max(step, Math.ceil((Math.max(...days.map((d) => Math.max(d.kcal ?? 0, d.goal ?? 0))) * 1.05) / step) * step)
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step)
  const y = (v) => PAD.top + plotH - (v / max) * plotH
  const base = y(0)
  const goalPath = days
    .map((d, i) => `${i ? 'L' : 'M'}${PAD.left + i * band} ${y(d.goal)}H${PAD.left + (i + 1) * band}`)
    .join('')
  const a = active !== null ? days[active] : null

  return (
    <div>
      <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label="Calories per day compared with the goal">
            <Frame width={width} ticks={ticks} y={y} format={fmtKcal} days={days} band={band}>
              {days.map((d, i) =>
                d.kcal ? (
                  <path
                    key={d.date}
                    d={barPath(PAD.left + i * band + (band - barW) / 2, y(d.kcal), barW, base)}
                    className={`fill-[#059669] transition-opacity ${active !== null && active !== i ? 'opacity-50' : ''}`}
                  />
                ) : null,
              )}
              <path d={goalPath} fill="none" className="stroke-slate-500 dark:stroke-slate-400" strokeWidth="1.5" strokeLinejoin="round" />
              {days.map((d, i) => (
                <rect
                  key={d.date}
                  x={PAD.left + i * band}
                  y={PAD.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  role="button"
                  aria-label={`${shortDate(d.date)}: ${d.kcal ? `${fmtKcal(d.kcal)} kcal` : 'nothing logged'}. Open day`}
                  className="cursor-pointer outline-none"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => onSelectDay(d.date)}
                  onKeyDown={(e) => e.key === 'Enter' && onSelectDay(d.date)}
                />
              ))}
            </Frame>
          </svg>
        )}
        {a && (
          <Tooltip x={PAD.left + (active + 0.5) * band} y={y(Math.max(a.kcal ?? 0, a.goal))} width={width}>
            <div className="text-sm font-semibold">{a.kcal ? `${fmtKcal(a.kcal)} kcal` : 'Nothing logged'}</div>
            <div className="text-slate-500 dark:text-slate-400">{shortDate(a.date)}</div>
            <div className="text-slate-500 dark:text-slate-400">
              Goal {fmtKcal(a.goal)}
              {a.kcal ? ` · ${a.kcal > a.goal ? '+' : '−'}${fmtKcal(Math.abs(a.kcal - a.goal))}` : ''}
            </div>
          </Tooltip>
        )}
      </div>
      <div className="mt-1 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#059669]" aria-hidden="true" />
          Calories
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 bg-slate-500 dark:bg-slate-400" aria-hidden="true" />
          Goal
        </span>
      </div>
      <TableView
        caption="Calories per day"
        head={['Day', 'Calories', 'Goal']}
        rows={[...days].reverse().map((d) => [d.date, shortDate(d.date), d.kcal ? fmtKcal(d.kcal) : '—', fmtKcal(d.goal)])}
      />
    </div>
  )
}

// points: [{ date, kg }] inside the range of `days`, oldest first.
export function WeightChart({ days, points }) {
  const [ref, width] = useWidth()
  const [active, setActive] = useState(null)

  const index = Object.fromEntries(days.map((d, i) => [d.date, i]))
  const plotW = Math.max(0, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const band = plotW / days.length
  const kgs = points.map((p) => p.kg)
  const lo = Math.floor(Math.min(...kgs) - 1)
  const hi = Math.ceil(Math.max(...kgs) + 1)
  const ticks = [lo, (lo + hi) / 2, hi]
  const x = (p) => PAD.left + (index[p.date] + 0.5) * band
  const y = (kg) => PAD.top + plotH - ((kg - lo) / (hi - lo)) * plotH
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p)} ${y(p.kg)}`).join('')
  const a = active !== null ? points[active] : null

  // Crosshair: snap to the nearest weigh-in, so the pointer never has to land on a dot.
  function onMove(e) {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left
    let best = 0
    points.forEach((p, i) => {
      if (Math.abs(x(p) - px) < Math.abs(x(points[best]) - px)) best = i
    })
    setActive(best)
  }

  return (
    <div>
      <div ref={ref} className="relative" onPointerLeave={() => setActive(null)}>
        {width > 0 && (
          <svg width={width} height={HEIGHT} role="img" aria-label="Weight per day" onPointerMove={onMove}>
            <Frame width={width} ticks={ticks} y={y} format={fmtNumber} days={days} band={band}>
              {a && (
                <line x1={x(a)} x2={x(a)} y1={PAD.top} y2={PAD.top + plotH} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1" />
              )}
              <path d={line} fill="none" stroke="#059669" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => (
                <circle
                  key={p.date}
                  cx={x(p)}
                  cy={y(p.kg)}
                  r={active === i ? 5 : 4}
                  fill="#059669"
                  strokeWidth="2"
                  className="stroke-white dark:stroke-slate-900"
                  tabIndex={0}
                  aria-label={`${shortDate(p.date)}: ${fmtNumber(p.kg)} kg`}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  style={{ outline: 'none' }}
                />
              ))}
            </Frame>
          </svg>
        )}
        {a && (
          <Tooltip x={x(a)} y={y(a.kg)} width={width}>
            <div className="text-sm font-semibold">{fmtNumber(a.kg)} kg</div>
            <div className="text-slate-500 dark:text-slate-400">{shortDate(a.date)}</div>
          </Tooltip>
        )}
      </div>
      <TableView
        caption="Weight entries"
        head={['Day', 'Weight (kg)']}
        rows={[...points].reverse().map((p) => [p.date, shortDate(p.date), fmtNumber(p.kg)])}
      />
    </div>
  )
}
