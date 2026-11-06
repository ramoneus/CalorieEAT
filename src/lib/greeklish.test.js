import { describe, expect, it } from 'vitest'
import { toGreeklish } from './greeklish'

describe('toGreeklish', () => {
  it('leaves Latin text untouched', () => {
    expect(toGreeklish('Crème brûlée')).toBe('Crème brûlée')
  })

  it('keeps all-caps words in caps and capitalises the rest', () => {
    expect(toGreeklish('ΦΑΓΕ Γιαούρτι')).toBe('FAGE Giaourti')
    expect(toGreeklish('Φέτα')).toBe('Feta')
  })

  it('reads μπ, ντ and γκ as b, d and g at the start of a word', () => {
    expect(toGreeklish('Μπανάνα')).toBe('Banana')
    expect(toGreeklish('Ντομάτα')).toBe('Domata')
    expect(toGreeklish('λάμπα')).toBe('lampa')
  })

  it('handles letter pairs and final sigma', () => {
    expect(toGreeklish('αυγό')).toBe('avgo')
    expect(toGreeklish('ψωμί σταρένιος')).toBe('psomi starenios')
  })

  it('removes Greek accents but keeps accents on Latin brand names', () => {
    expect(toGreeklish('Nestlé Δημητριακά')).toBe('Nestlé Dimitriaka')
  })
})
