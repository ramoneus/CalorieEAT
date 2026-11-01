// Greek → Latin transliteration for scanned product names, so a Greek-only label reads
// naturally in the English UI ("ΦΑΓΕ Γιαούρτι" → "FAGE Giaourti"). Latin text passes through.
const LETTERS = {
  α: 'a', β: 'v', γ: 'g', δ: 'd', ε: 'e', ζ: 'z', η: 'i', θ: 'th', ι: 'i', κ: 'k', λ: 'l', μ: 'm',
  ν: 'n', ξ: 'x', ο: 'o', π: 'p', ρ: 'r', σ: 's', ς: 's', τ: 't', υ: 'y', φ: 'f', χ: 'ch', ψ: 'ps', ω: 'o',
}
const PAIRS = { ου: 'ou', αυ: 'av', ευ: 'ev', γγ: 'ng', γκ: 'gk', μπ: 'mp', ντ: 'nt' }
// At the start of a word these sound like b, d, g ("Μπανάνα" → "Banana").
const WORD_START = { μπ: 'b', ντ: 'd', γκ: 'g' }

const GREEK = /[Ͱ-Ͽ]/
const isUpper = (c) => c !== undefined && c !== c.toLowerCase()

export function toGreeklish(text) {
  if (!GREEK.test(text)) return text
  // Drop accents on Greek letters only; Latin brand names keep theirs.
  const plain = text.normalize('NFD').replace(/([Ͱ-Ͽ])[̀-ͯ]+/g, '$1')
  return plain
    .replace(/ου|αυ|ευ|γγ|γκ|μπ|ντ|[α-ω]/giu, (match, offset) => {
      const lower = match.toLowerCase()
      const wordStart = offset === 0 || !/\p{L}/u.test(plain[offset - 1])
      const latin = (wordStart && WORD_START[lower]) || PAIRS[lower] || LETTERS[lower]
      if (!isUpper(match[0])) return latin
      // "ΦΑΓΕ" stays all caps; "Φέτα" only gets a capital first letter.
      const allCaps = match.length > 1 ? isUpper(match[1]) : isUpper(plain[offset + 1])
      return allCaps ? latin.toUpperCase() : latin[0].toUpperCase() + latin.slice(1)
    })
    .normalize('NFC')
}
