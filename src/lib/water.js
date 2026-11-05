// Water is logged as a glass count per day: { 'YYYY-MM-DD': glasses }. Glass size lives in the
// profile, so changing it re-expresses past days instead of silently mixing sizes.
const ML_PER_FL_OZ = 29.5735

export const GLASS_SIZES = {
  metric: [200, 250, 330],
  imperial: [8, 12, 16].map((oz) => Math.round(oz * ML_PER_FL_OZ)),
}

export const WATER_GOAL_RANGE = [1, 20]

const sizesFor = (units) => GLASS_SIZES[units === 'imperial' ? 'imperial' : 'metric']

// The offered glass size closest to `ml`, so switching units keeps a sensible choice.
export function pickGlass(units, ml) {
  const sizes = sizesFor(units)
  if (!ml) return sizes[units === 'imperial' ? 0 : 1]
  return sizes.reduce((best, s) => (Math.abs(s - ml) < Math.abs(best - ml) ? s : best))
}

export const glassOptions = sizesFor

// Settings with defaults filled in: on, 8 glasses, 250 ml (or 8 fl oz).
export function waterSettings(profile) {
  const w = profile?.water ?? {}
  return {
    enabled: w.enabled ?? true,
    goal: w.goal ?? 8,
    glassMl: pickGlass(profile?.units, w.glassMl),
  }
}

export function fmtVolume(ml, imperial) {
  if (imperial) return `${Math.round(ml / ML_PER_FL_OZ)} fl oz`
  if (ml < 1000) return `${ml} ml`
  return `${(ml / 1000).toLocaleString('en-GB', { maximumFractionDigits: 2 })} L`
}

export const withWater = (water, date, glasses) => {
  const { [date]: _old, ...rest } = water
  return glasses > 0 ? { ...rest, [date]: glasses } : rest
}
