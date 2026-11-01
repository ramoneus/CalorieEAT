import { toGreeklish } from './greeklish'

// GTIN check digit (EAN-8, UPC-A, EAN-13, GTIN-14). Rejects misreads before we look anything up.
export function isValidGtin(code) {
  if (!/^(\d{8}|\d{12,14})$/.test(code)) return false
  const digits = [...code].map(Number)
  const check = digits.pop()
  const sum = digits.reverse().reduce((s, d, i) => s + d * (i % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === check
}

// Shop-printed codes (EAN-13 starting with 2) on weighed fresh food: they encode the shop's
// price or weight, so no product database has them.
export const isStoreCode = (code) => code.length === 13 && code[0] === '2'

export const productId = (code) => `off:${code}`

export const offProductUrl = (code) => `https://world.openfoodfacts.org/product/${code}`

const FIELDS = 'code,product_name,product_name_en,product_name_el,brands,quantity,serving_quantity,nutriments'

// "COCA-COLA SERVICES SA/NV", "ΔΕΛΤΑ Α.Ε.": legal entities some products list as the brand.
const COMPANY = /(^|[\s,/])(s\.?a\.?|n\.?v\.?|ltd|gmbh|inc|srl|spa|a\.?e\.?|α\.?ε\.?|services)([\s,./]|$)/i

const round1 = (n) => Math.round(n * 10) / 10
const num = (v) => (v === '' || v === null || v === undefined || !Number.isFinite(Number(v)) ? null : Number(v))

// "400 g", "115g", "1,5 l", "330 ml" → grams (liquids counted as 1 ml ≈ 1 g).
function packageGrams(quantity = '') {
  const m = /([\d.,]+)\s*(kg|g|l|cl|ml)\b/i.exec(quantity)
  if (!m) return null
  const value = Number(m[1].replace(',', '.'))
  const factor = { kg: 1000, g: 1, l: 1000, cl: 10, ml: 1 }[m[2].toLowerCase()]
  return value > 0 ? round1(value * factor) : null
}

// Open Food Facts product → our food shape. `complete` is false when there are no calories.
function toFood(code, p) {
  const n = p.nutriments ?? {}
  const kj = num(n.energy_100g) ?? num(n['energy-kj_100g'])
  const kcal = num(n['energy-kcal_100g']) ?? (kj !== null ? kj / 4.184 : null)
  const rawName = (p.product_name_en || p.product_name || p.product_name_el || '').trim()
  const brand = (p.brands ?? '').split(',')[0].trim()
  // Prefix the brand unless the name already starts with it or it's a company name, not a brand.
  const brandWord = brand.split(/\s+/)[0].toLowerCase()
  const useBrand = brand && !rawName.toLowerCase().includes(brandWord) && !COMPANY.test(brand)
  const fullName = (useBrand ? `${brand} ${rawName}` : rawName || brand).trim()

  const portions = []
  const serving = num(p.serving_quantity)
  if (serving > 0) portions.push({ label: 'serving', grams: round1(serving) })
  const pack = packageGrams(p.quantity)
  if (pack && pack !== serving) portions.push({ label: 'package', grams: pack })

  return {
    id: productId(code),
    code,
    source: 'off',
    name: toGreeklish(fullName) || `Product ${code}`,
    kcal: kcal === null ? null : Math.round(kcal),
    protein: round1(num(n.proteins_100g) ?? 0),
    carbs: round1(num(n.carbohydrates_100g) ?? 0),
    fat: round1(num(n.fat_100g) ?? 0),
    portions,
    // The original (often Greek) name and the barcode stay searchable.
    extra: `${fullName} ${code}`,
    complete: kcal !== null,
  }
}

async function fetchProduct(code, signal) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${FIELDS}`, { signal })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Open Food Facts answered ${res.status}`)
  const data = await res.json()
  return data.status === 1 ? data.product : null
}

// Looks a barcode up on Open Food Facts. Resolves to a food, or null when it isn't listed;
// throws when the service can't be reached (offline, timeout, server error).
export async function lookupBarcode(code, { timeout = 10000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    let product = await fetchProduct(code, controller.signal)
    // A 12-digit UPC-A is the same product as the 13-digit EAN with a leading zero.
    if (!product && code.length === 12) product = await fetchProduct(`0${code}`, controller.signal)
    return product && toFood(code, product)
  } finally {
    clearTimeout(timer)
  }
}
