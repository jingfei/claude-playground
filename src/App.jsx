import { useState } from 'react'
import ProgressBar from './components/ProgressBar'

const PRESETS = [0, 25, 50, 75, 100]

export default function App() {
  const [value, setValue] = useState(40)

  // Simulated upload example
  const [uploadPct, setUploadPct]   = useState(0)
  const [uploadStatus, setUploadStatus] = useState(undefined) // undefined | 'success' | 'error'
  const [running, setRunning]       = useState(false)

  function startUpload() {
    setUploadPct(0)
    setUploadStatus(undefined)
    setRunning(true)

    const total = 2800 + Math.random() * 800   // 2.8–3.6 s total
    const start = performance.now()
    const fail  = Math.random() < 0.3           // 30% chance of failure

    function tick() {
      const elapsed  = performance.now() - start
      const progress = Math.min(elapsed / total, 1)
      const eased    = 1 - Math.pow(1 - progress, 2)  // ease-out quad
      const pct      = Math.round(eased * (fail ? 62 : 100))

      setUploadPct(pct)

      if (progress < 1 && !(fail && pct >= 62)) {
        requestAnimationFrame(tick)
      } else {
        setUploadStatus(fail ? 'error' : 'success')
        setRunning(false)
      }
    }
    requestAnimationFrame(tick)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center py-16 px-4 gap-14">

      {/* ── interactive demo ── */}
      <section className="w-full max-w-lg flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">Progress Bar</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-8">

          {/* Scrubber */}
          <div className="flex flex-col gap-4">
            <ProgressBar percentage={value} label="Progress" color="indigo" />

            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-label="Set progress percentage"
              className="w-full accent-indigo-500"
            />

            {/* Preset buttons */}
            <div className="flex gap-2 flex-wrap">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setValue(p)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                    ${value === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div className="flex flex-col gap-5 border-t border-gray-800 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600">Sizes</h2>
            <ProgressBar percentage={value} label="Small"  size="sm" color="sky"     showValue={false} />
            <ProgressBar percentage={value} label="Medium" size="md" color="indigo"  />
            <ProgressBar percentage={value} label="Large"  size="lg" color="amber"   />
          </div>

          <div className="flex flex-col gap-5 border-t border-gray-800 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600">Colors</h2>
            {['indigo','sky','emerald','amber','rose'].map((c) => (
              <ProgressBar key={c} percentage={value} label={c.charAt(0).toUpperCase() + c.slice(1)} color={c} />
            ))}
          </div>

          <div className="flex flex-col gap-5 border-t border-gray-800 pt-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-600">Status overrides</h2>
            <ProgressBar percentage={100} label="Upload complete" status="success" />
            <ProgressBar percentage={62}  label="Upload failed"   status="error"   />
          </div>
        </div>
      </section>

      {/* ── simulated upload ── */}
      <section className="w-full max-w-lg flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Simulated upload</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
          <ProgressBar
            percentage={uploadPct}
            label="Uploading file…"
            color="sky"
            duration={120}
            status={uploadStatus}
          />
          <button
            onClick={startUpload}
            disabled={running}
            className="self-start px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
                       disabled:opacity-40 disabled:cursor-not-allowed
                       text-sm font-medium transition-colors"
          >
            {running ? 'Uploading…' : 'Start upload'}
          </button>
          <p className="text-xs text-gray-600">30% chance of a simulated failure.</p>
        </div>
      </section>

    </div>
  )
}
