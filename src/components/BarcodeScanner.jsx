import { useEffect, useRef, useState } from 'react'
import { inputClass } from './Field'
import { isValidGtin } from '../lib/barcode'
import { createDetector } from '../lib/scanner'

const SCAN_EVERY_MS = 200

const MESSAGES = {
  starting: 'Starting the camera…',
  scanning: 'Point the camera at the barcode.',
  denied: 'Camera access was blocked. Allow it in your browser settings, or type the number below.',
  unavailable: 'No camera available here. Type the barcode number below.',
  failed: 'The scanner couldn’t start. Type the barcode number below.',
}

// UPC-E is a compressed code with its own check digit scheme; accept it as read.
const isAcceptable = ({ rawValue, format }) => (format === 'upc_e' ? /^\d{6,8}$/.test(rawValue) : isValidGtin(rawValue))

// Camera barcode scanner in a modal, with a typed-number fallback that always works.
export default function BarcodeScanner({ onDetected, onClose }) {
  const dialogRef = useRef(null)
  const videoRef = useRef(null)
  const trackRef = useRef(null)
  const [status, setStatus] = useState('starting')
  const [torch, setTorch] = useState(null) // null = not supported, otherwise on/off
  const [typed, setTyped] = useState('')
  const [typedError, setTypedError] = useState(null)
  // The camera starts once per opening; a re-render of the parent mustn't restart it.
  const detectedRef = useRef(onDetected)
  useEffect(() => {
    detectedRef.current = onDetected
  })

  useEffect(() => {
    dialogRef.current.showModal()
    let stopped = false
    let stream = null
    let timer = null

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) return setStatus('unavailable')
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch (err) {
        return setStatus(err?.name === 'NotAllowedError' ? 'denied' : 'unavailable')
      }
      if (stopped) return stream.getTracks().forEach((t) => t.stop())

      const video = videoRef.current
      video.srcObject = stream
      trackRef.current = stream.getVideoTracks()[0]
      if (trackRef.current.getCapabilities?.().torch) setTorch(false)

      let detector
      try {
        ;[detector] = await Promise.all([createDetector(), video.play()])
      } catch {
        return setStatus('failed')
      }
      if (stopped) return
      setStatus('scanning')

      // Check a few frames a second rather than every frame, to spare the battery.
      let busy = false
      timer = setInterval(async () => {
        if (busy || video.readyState < 2) return
        busy = true
        try {
          const found = (await detector.detect(video)).find(isAcceptable)
          if (found && !stopped) {
            stopped = true
            detectedRef.current(found.rawValue)
          }
        } catch {
          // A frame that can't be read is simply skipped.
        } finally {
          busy = false
        }
      }, SCAN_EVERY_MS)
    }

    start()
    return () => {
      stopped = true
      clearInterval(timer)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function toggleTorch() {
    const next = !torch
    try {
      await trackRef.current.applyConstraints({ advanced: [{ torch: next }] })
      setTorch(next)
    } catch {
      setTorch(null)
    }
  }

  function submitTyped(e) {
    e.preventDefault()
    const code = typed.replace(/\s/g, '')
    if (!isValidGtin(code)) return setTypedError('That doesn’t look like a product barcode. Check the digits.')
    onDetected(code)
  }

  const showVideo = status === 'starting' || status === 'scanning'

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
      aria-label="Scan a barcode"
    >
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scan a barcode</h2>
          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {showVideo && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-950">
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
            {/* Aiming guide: a wide box, since product barcodes are wider than tall. */}
            <div className="pointer-events-none absolute inset-x-[12%] top-1/2 h-[38%] -translate-y-1/2 rounded-lg border-2 border-white/80 shadow-[0_0_0_9999px_rgba(2,6,23,0.35)]" aria-hidden="true" />
            {torch !== null && (
              <button
                type="button"
                onClick={toggleTorch}
                aria-pressed={torch}
                className="absolute right-2 bottom-2 rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white"
              >
                {torch ? 'Light off' : 'Light on'}
              </button>
            )}
          </div>
        )}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300" role="status">
          {MESSAGES[status]}
        </p>

        <form onSubmit={submitTyped} className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <label htmlFor="barcode-number" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Or type the number under the barcode
          </label>
          <div className="flex gap-2">
            <input
              id="barcode-number"
              className={inputClass}
              inputMode="numeric"
              autoComplete="off"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value)
                setTypedError(null)
              }}
              placeholder="e.g. 5201004021328"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={!typed.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Look up
            </button>
          </div>
          {typedError && <p className="mt-1.5 text-sm text-rose-600 dark:text-rose-400">{typedError}</p>}
        </form>
      </div>
    </dialog>
  )
}
