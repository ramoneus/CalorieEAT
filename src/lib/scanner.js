// Product barcodes only: EAN-13/8 (Europe) and UPC-A/E (US).
const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e']

// The browser's own detector where there is one (Chrome on Android, macOS); otherwise the
// ZXing WebAssembly fallback (iPhone, Firefox, Windows), which is downloaded only at this point
// and served from our own site so it also works offline once cached.
export async function createDetector() {
  if ('BarcodeDetector' in window) {
    const supported = await window.BarcodeDetector.getSupportedFormats()
    const formats = FORMATS.filter((f) => supported.includes(f))
    if (formats.length) return new window.BarcodeDetector({ formats })
  }
  const [{ BarcodeDetector, prepareZXingModule }, { default: wasmUrl }] = await Promise.all([
    import('barcode-detector/ponyfill'),
    import('zxing-wasm/reader/zxing_reader.wasm?url'),
  ])
  prepareZXingModule({
    overrides: { locateFile: (path, prefix) => (path.endsWith('.wasm') ? wasmUrl : prefix + path) },
  })
  return new BarcodeDetector({ formats: FORMATS })
}
