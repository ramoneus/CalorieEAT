import { afterEach, describe, expect, it, vi } from 'vitest'
import { isStoreCode, isValidGtin, lookupBarcode, offProductUrl, productId } from './barcode'

describe('isValidGtin', () => {
  it('accepts codes with a correct check digit', () => {
    expect(isValidGtin('4006381333931')).toBe(true) // EAN-13
    expect(isValidGtin('5449000000996')).toBe(true) // EAN-13
    expect(isValidGtin('96385074')).toBe(true) // EAN-8
    expect(isValidGtin('036000291452')).toBe(true) // UPC-A
  })

  it('rejects a misread check digit', () => {
    expect(isValidGtin('4006381333932')).toBe(false)
    expect(isValidGtin('036000291453')).toBe(false)
  })

  it('rejects anything that is not 8 or 12–14 digits', () => {
    expect(isValidGtin('')).toBe(false)
    expect(isValidGtin('12345')).toBe(false)
    expect(isValidGtin('1234567890')).toBe(false)
    expect(isValidGtin('400638133393A')).toBe(false)
    expect(isValidGtin('400638133393123')).toBe(false)
  })
})

describe('isStoreCode', () => {
  it('flags shop-printed EAN-13 codes starting with 2', () => {
    expect(isStoreCode('2012345678901')).toBe(true)
    expect(isStoreCode('4006381333931')).toBe(false)
    expect(isStoreCode('20123456')).toBe(false)
  })
})

describe('ids and links', () => {
  it('builds the product id and Open Food Facts URL', () => {
    expect(productId('5449000000996')).toBe('off:5449000000996')
    expect(offProductUrl('5449000000996')).toBe('https://world.openfoodfacts.org/product/5449000000996')
  })
})

// Fakes the Open Food Facts API: `responses` are returned in order, one per request.
function mockFetch(...responses) {
  const fetch = vi.fn()
  for (const r of responses) {
    fetch.mockResolvedValueOnce({
      ok: r.status === undefined || r.status < 400,
      status: r.status ?? 200,
      json: async () => r.body,
    })
  }
  vi.stubGlobal('fetch', fetch)
  return fetch
}

const found = (product) => ({ body: { status: 1, product } })

describe('lookupBarcode', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('maps a product to a food with values per 100 g', async () => {
    mockFetch(
      found({
        product_name: 'Coca-Cola',
        brands: 'Coca-Cola',
        quantity: '330 ml',
        serving_quantity: 330,
        nutriments: { 'energy-kcal_100g': 42, proteins_100g: 0, carbohydrates_100g: 10.6, fat_100g: 0 },
      }),
    )
    const food = await lookupBarcode('5449000000996')
    expect(food).toMatchObject({
      id: 'off:5449000000996',
      code: '5449000000996',
      source: 'off',
      name: 'Coca-Cola',
      kcal: 42,
      protein: 0,
      carbs: 10.6,
      fat: 0,
      complete: true,
    })
    // The serving and the can are the same size, so only one portion is offered.
    expect(food.portions).toEqual([{ label: 'serving', grams: 330 }])
  })

  it('puts the brand in front of the name unless the name already has it', async () => {
    mockFetch(found({ product_name: 'Greek yogurt 2%', brands: 'Fage, Fage International', nutriments: { 'energy-kcal_100g': 73 } }))
    expect((await lookupBarcode('5201054017906')).name).toBe('Fage Greek yogurt 2%')
  })

  it('skips company names as brands and transliterates Greek names', async () => {
    mockFetch(found({ product_name: 'Γιαούρτι στραγγιστό', brands: 'ΔΕΛΤΑ Α.Ε.', nutriments: { 'energy-kcal_100g': 95 } }))
    const food = await lookupBarcode('5201005000000')
    expect(food.name).toBe('Giaourti strangisto')
    // The original Greek stays searchable.
    expect(food.extra).toContain('Γιαούρτι στραγγιστό')
  })

  it('converts kilojoules when there are no kilocalories', async () => {
    mockFetch(found({ product_name: 'Crackers', nutriments: { energy_100g: 418.4 } }))
    expect((await lookupBarcode('4006381333931')).kcal).toBe(100)
  })

  it('reads the package size as a portion', async () => {
    mockFetch(found({ product_name: 'Water', quantity: '1,5 l', nutriments: { 'energy-kcal_100g': 0 } }))
    expect((await lookupBarcode('4006381333931')).portions).toEqual([{ label: 'package', grams: 1500 }])
  })

  it('marks a product without energy values as incomplete', async () => {
    mockFetch(found({ product_name: 'Mystery snack', nutriments: {} }))
    const food = await lookupBarcode('4006381333931')
    expect(food.kcal).toBeNull()
    expect(food.complete).toBe(false)
  })

  it('returns null for an unknown product', async () => {
    mockFetch({ status: 404 })
    expect(await lookupBarcode('4006381333931')).toBeNull()
  })

  it('retries a 12-digit UPC as a 13-digit EAN', async () => {
    const fetch = mockFetch({ status: 404 }, found({ product_name: 'Cereal', nutriments: { 'energy-kcal_100g': 380 } }))
    const food = await lookupBarcode('036000291452')
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toContain('/product/0036000291452.json')
    expect(food.code).toBe('036000291452')
  })

  it('throws when the service fails, so the app can say it is offline', async () => {
    mockFetch({ status: 503 })
    await expect(lookupBarcode('4006381333931')).rejects.toThrow('503')
  })
})
