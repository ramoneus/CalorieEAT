import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import MealForm from './components/MealForm'
import MealLog from './components/MealLog'
import Onboarding from './components/Onboarding'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { sumMacros, todayKey } from './lib/nutrition'

export default function App() {
  const [profile, setProfile] = useLocalStorage('calorie-tracker:profile', null)
  const [meals, setMeals] = useLocalStorage('calorie-tracker:meals', [])
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
    .sort((a, b) => b.createdAt - a.createdAt)
  const totals = sumMacros(todaysMeals)

  const addMeal = (meal) =>
    setMeals((all) => [...all, { ...meal, id: crypto.randomUUID(), date: today, createdAt: Date.now() }])
  const deleteMeal = (id) => setMeals((all) => all.filter((m) => m.id !== id))

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Header date={today} dark={dark} onToggleTheme={toggleTheme} onEditProfile={() => setEditing(true)} />
      <main className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Dashboard goal={profile.goal} totals={totals} />
          <MealLog meals={todaysMeals} onDelete={deleteMeal} />
        </div>
        <div>
          <div className="lg:sticky lg:top-6">
            <MealForm onAdd={addMeal} />
          </div>
        </div>
      </main>
    </div>
  )
}
