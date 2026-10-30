import { useState } from 'react'
import AddFood from './components/AddFood'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import MealLog from './components/MealLog'
import Onboarding from './components/Onboarding'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { itemKey, recentItems, toTemplate } from './lib/meals'
import { sumMacros, todayKey } from './lib/nutrition'

export default function App() {
  const [profile, setProfile] = useLocalStorage('calorie-tracker:profile', null)
  const [meals, setMeals] = useLocalStorage('calorie-tracker:meals', [])
  const [favorites, setFavorites] = useLocalStorage('calorie-tracker:favorites', [])
  const [dark, toggleTheme] = useTheme()
  const [editing, setEditing] = useState(false)

  if (!profile || editing) {
    return (
      <Onboarding
        initial={profile}
        onCancel={profile ? () => setEditing(false) : undefined}
        onSubmit={(p) => {
          setProfile(p)
          setEditing(false)
        }}
      />
    )
  }

  const today = todayKey()
  const todaysMeals = meals
    .filter((m) => m.date === today)
    .sort((a, b) => a.createdAt - b.createdAt)
  const totals = sumMacros(todaysMeals)

  const addMeal = (meal) =>
    setMeals((all) => [...all, { ...meal, id: crypto.randomUUID(), date: today, createdAt: Date.now() }])
  const deleteMeal = (id) => setMeals((all) => all.filter((m) => m.id !== id))
  const toggleFavorite = (item) =>
    setFavorites((all) =>
      all.some((f) => itemKey(f) === itemKey(item))
        ? all.filter((f) => itemKey(f) !== itemKey(item))
        : [...all, toTemplate(item)],
    )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Header date={today} dark={dark} onToggleTheme={toggleTheme} onEditProfile={() => setEditing(true)} />
      {/* On phones the add panel sits right under the summary; on desktop it is a sticky sidebar. */}
      <main className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:grid-rows-[auto_1fr] lg:items-start">
        <Dashboard goal={profile.goal} totals={totals} />
        <div className="lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <AddFood
            recents={recentItems(meals)}
            favorites={favorites}
            onAdd={addMeal}
            onToggleFavorite={toggleFavorite}
          />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <MealLog meals={todaysMeals} onDelete={deleteMeal} />
        </div>
      </main>
    </div>
  )
}
