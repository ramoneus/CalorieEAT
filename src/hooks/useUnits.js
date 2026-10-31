import { createContext, useContext } from 'react'
import { unitsFor } from '../lib/units'

// The signed-in user's unit system, available to every component below the tracker.
export const UnitsContext = createContext(unitsFor('metric'))

export const useUnits = () => useContext(UnitsContext)
