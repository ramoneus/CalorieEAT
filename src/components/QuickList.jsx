import { useUnits } from '../hooks/useUnits'
import { amountLabel } from '../lib/meals'

export function StarButton({ active, onClick, name }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      title={active ? 'Remove from favorites' : 'Add to favorites'}
      className={`rounded-lg p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
        active ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
      </svg>
    </button>
  )
}

// One-tap list: tapping a row adds that exact entry again.
export default function QuickList({ title, items, onAdd, isFavorite, onToggleFavorite }) {
  const { fmtMass } = useUnits()
  if (items.length === 0) return null
  return (
    <section>
      <h3 className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={`${item.foodId ?? item.name}-${item.grams ?? item.calories}`} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`Add ${item.name}${amountLabel(item, fmtMass) ? `, ${amountLabel(item, fmtMass)}` : ''}, ${item.calories} calories`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.name}</span>
                {amountLabel(item, fmtMass) && (
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{amountLabel(item, fmtMass)}</span>
                )}
              </span>
              <span className="text-sm font-semibold whitespace-nowrap">
                {item.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <StarButton active={isFavorite(item)} onClick={() => onToggleFavorite(item)} name={item.name} />
          </li>
        ))}
      </ul>
    </section>
  )
}
