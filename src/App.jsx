import { useCallback, useEffect, useState } from 'react'
import AddFood from './components/AddFood'
import Dashboard from './components/Dashboard'
import EditMeal from './components/EditMeal'
import DateNav from './components/DateNav'
import Header from './components/Header'
import MealLog from './components/MealLog'
import Onboarding from './components/Onboarding'
import Progress from './components/Progress'
import UserPicker from './components/UserPicker'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { useUsers, userKey } from './hooks/useUsers'
import { addDays, formatDate, todayKey } from './lib/dates'
import { caloriesByDay, goalFor, withGoal, withWeight } from './lib/history'
import { itemKey, recentItems, toTemplate } from './lib/meals'
import { sumMacros } from './lib/nutrition'

const VIEWS = [
  ['day', 'Day'],
  ['progress', 'Progress'],
]

export default function App() {
  const { users, current, addUser, deleteUser, selectUser, signOut } = useUsers()

  if (!current) return <UserPicker users={users} onSelect={selectUser} onAdd={addUser} onDelete={deleteUser} />
  // Keyed by user so every switch remounts with that user's own storage.
  return <Tracker key={current.id} user={current} onSwitchUser={signOut} />
}

function Tracker({ user, onSwitchUser }) {
  const key = (name) => userKey(user.id, name)
  const [profile, setProfile] = useLocalStorage(key('profile'), null)
  const [meals, setMeals] = useLocalStorage(key('meals'), [])
  const [favorites, setFavorites] = useLocalStorage(key('favorites'), [])
  const [savedGoals, setGoals] = useLocalStorage(key('goals'), [])
  const [weights, setWeights] = useLocalStorage(key('weights'), [])
  const [dark, toggleTheme] = useTheme()
  const [editing, setEditing] = useState(false)
  const [view, setView] = useState('day')
  const [selected, setSelected] = useState(todayKey)
  const [editingMeal, setEditingMeal] = useState(null)
  const [deleted, setDeleted] = useState(null)
  const dismissDeleted = useCallback(() => setDeleted(null), [])

  const today = todayKey()
  // Profiles saved before goal history existed: their goal applies to every past day.
  const goals = savedGoals.length || !profile ? savedGoals : [{ from: '0000-01-01', goal: profile.goal }]

  if (!profile || editing) {
    return (
      <Onboarding
        initial={profile}
        onCancel={profile ? () => setEditing(false) : undefined}
        onSubmit={(p) => {
          if (goalFor(goals, today) !== p.goal) setGoals(withGoal(goals, today, p.goal))
          if (p.weight !== profile?.weight) setWeights((w) => withWeight(w, today, p.weight))
          setProfile(p)
          setEditing(false)
        }}
      />
    )
  }

  const date = selected > today ? today : selected
  const daysMeals = meals.filter((m) => m.date === date).sort((a, b) => a.createdAt - b.createdAt)
  const totals = sumMacros(daysMeals)
  const byDay = caloriesByDay(meals)

  const prevMeals = meals.filter((m) => m.date === addDays(date, -1)).sort((a, b) => a.createdAt - b.createdAt)

  const addMeals = (items) =>
    setMeals((all) => [
      ...all,
      ...items.map((item, i) => ({ ...item, id: crypto.randomUUID(), date, createdAt: Date.now() + i })),
    ])
  const addMeal = (meal) => addMeals([meal])
  const updateMeal = (id, changes) => setMeals((all) => all.map((m) => (m.id === id ? { ...m, ...changes } : m)))
  function deleteMeal(id) {
    setDeleted(meals.find((m) => m.id === id))
    setMeals((all) => all.filter((m) => m.id !== id))
  }
  function undoDelete() {
    setMeals((all) => [...all, deleted])
    setDeleted(null)
  }
  const toggleFavorite = (item) =>
    setFavorites((all) =>
      all.some((f) => itemKey(f) === itemKey(item))
        ? all.filter((f) => itemKey(f) !== itemKey(item))
        : [...all, toTemplate(item)],
    )
  const statusFor = (d) => (byDay[d] ? (byDay[d] > goalFor(goals, d) ? 'over' : 'under') : null)

  function exportData() {
    const data = { app: 'calorEAT', version: 1, exportedAt: new Date().toISOString(), profile, meals, favorites, goals, weights }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `calorEAT-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(data) {
    if (data.profile) setProfile(data.profile)
    setMeals(data.meals)
    setFavorites(Array.isArray(data.favorites) ? data.favorites : [])
    setGoals(Array.isArray(data.goals) ? data.goals : [])
    setWeights(Array.isArray(data.weights) ? data.weights : [])
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Header
        userName={user.name}
        dark={dark}
        onToggleTheme={toggleTheme}
        onEditProfile={() => setEditing(true)}
        onSwitchUser={onSwitchUser}
      />

      <nav className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-slate-200/70 p-1 dark:bg-slate-800" role="tablist">
          {VIEWS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                view === id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {view === 'day' && <DateNav date={date} today={today} statusFor={statusFor} onChange={setSelected} />}
      </nav>

      {view === 'day' ? (
        // On phones the add panel sits right under the summary; on desktop it is a sticky sidebar.
        <main className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:grid-rows-[auto_1fr] lg:items-start">
          <Dashboard goal={goalFor(goals, date)} totals={totals} />
          <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <AddFood
              recents={recentItems(meals)}
              favorites={favorites}
              dayMeals={daysMeals}
              previousMeals={prevMeals}
              previousLabel={date === today ? 'yesterday' : 'the previous day'}
              onAdd={addMeal}
              onAddMany={addMeals}
              onToggleFavorite={toggleFavorite}
            />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <MealLog
              title={date === today ? 'Today' : formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}
              meals={daysMeals}
              onEdit={(meal) => setEditingMeal(meal)}
              onDelete={deleteMeal}
            />
          </div>
          {editingMeal && (
            <EditMeal
              meal={editingMeal}
              isFavorite={(item) => favorites.some((f) => itemKey(f) === itemKey(item))}
              onToggleFavorite={toggleFavorite}
              onSave={(changes) => {
                updateMeal(editingMeal.id, changes)
                setEditingMeal(null)
              }}
              onDelete={() => {
                deleteMeal(editingMeal.id)
                setEditingMeal(null)
              }}
              onClose={() => setEditingMeal(null)}
            />
          )}
        </main>
      ) : (
        <main className="mt-6">
          <Progress
            meals={meals}
            goals={goals}
            weights={weights}
            onLogWeight={(d, kg) => setWeights((w) => withWeight(w, d, kg))}
            onDeleteWeight={(d) => setWeights((w) => w.filter((x) => x.date !== d))}
            onSelectDay={(d) => {
              setSelected(d)
              setView('day')
            }}
            onExport={exportData}
            onImport={importData}
          />
        </main>
      )}

      {deleted && <UndoToast key={deleted.id} name={deleted.name} onUndo={undoDelete} onDismiss={dismissDeleted} />}
    </div>
  )
}

// "Deleted · Undo" bar shown for a few seconds after removing an entry.
function UndoToast({ name, onUndo, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-white dark:text-slate-900"
    >
      <span className="min-w-0 flex-1 truncate">Deleted: {name}</span>
      <button type="button" onClick={onUndo} className="font-semibold text-emerald-400 hover:underline dark:text-emerald-700">
        Undo
      </button>
    </div>
  )
}
