import { fmtNumber } from './meals'

// Everything is stored in metric (kg, cm, g); these helpers only convert for display and input.
const KG_PER_LB = 0.45359237
const G_PER_OZ = 28.349523125
const CM_PER_IN = 2.54

export const UNIT_SYSTEMS = [
  { id: 'metric', label: 'Metric', hint: 'kg · cm · g' },
  { id: 'imperial', label: 'US', hint: 'lb · ft, in · oz' },
]

// First-time default: US units for US English browsers, metric everywhere else.
export const defaultUnits = () => (navigator.language === 'en-US' ? 'imperial' : 'metric')

const round1 = (n) => Math.round(n * 10) / 10

export function cmToFeetInches(cm) {
  const totalIn = Math.round(cm / CM_PER_IN)
  return { ft: Math.floor(totalIn / 12), in: totalIn % 12 }
}

export const feetInchesToCm = (ft, inches) => (ft * 12 + inches) * CM_PER_IN

export function unitsFor(system) {
  const imperial = system === 'imperial'
  const weightUnit = imperial ? 'lb' : 'kg'
  const massUnit = imperial ? 'oz' : 'g'
  const toWeight = (kg) => (imperial ? kg / KG_PER_LB : kg)
  const toMass = (g) => (imperial ? g / G_PER_OZ : g)

  return {
    imperial,
    weightUnit,
    massUnit,
    // Body weight: kg ⇄ the user's unit.
    toWeight,
    fromWeight: (value) => (imperial ? value * KG_PER_LB : value),
    fmtWeight: (kg) => `${fmtNumber(toWeight(kg))} ${weightUnit}`,
    // Food amounts: grams ⇄ the user's unit.
    toMass: (g) => round1(toMass(g)),
    fromMass: (value) => (imperial ? value * G_PER_OZ : value),
    fmtMass: (g) => `${fmtNumber(imperial ? round1(toMass(g)) : g)} ${massUnit}`,
    fmtHeight(cm) {
      if (!imperial) return `${fmtNumber(cm)} cm`
      const { ft, in: inches } = cmToFeetInches(cm)
      return `${ft} ft ${inches} in`
    },
  }
}
