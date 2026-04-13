import { useState, useRef, useCallback, useEffect } from 'react'

// ─── constants ────────────────────────────────────────────────────────────────

const MASK_COLOR   = 'rgba(220, 38, 38, 0.45)'   // red, semi-transparent
const MASK_SOLID   = 'rgb(220, 38, 38)'
const MAX_H        = 520                           // max canvas height (px)

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Get pointer position relative to canvas, accounting for CSS scaling. */
function getPos(canvas, e) {
  const rect = canvas.getBoundingClientRect()
  const sx   = canvas.width  / rect.width
  const sy   = canvas.height / rect.height
  const src  = e.touches ? e.touches[0] : e
  return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy }
}

/** Draw a single stroke (array of {x,y}) onto ctx with given style. */
function drawStroke(ctx, stroke, color, size) {
  if (stroke.length === 0) return
  ctx.strokeStyle = color
  ctx.lineWidth   = size
  ctx.lineCap     = 'round'
  ctx.lineJoin    = 'round'
  ctx.beginPath()
  ctx.moveTo(stroke[0].x, stroke[0].y)
  for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y)
  ctx.stroke()
  // dot for single-point strokes
  if (stroke.length === 1) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(stroke[0].x, stroke[0].y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** Paint a radial glow at pos onto ctx. */
function drawGlow(ctx, pos, radius) {
  const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius)
  g.addColorStop(0,   'rgba(255, 230,  50, 0.95)')
  g.addColorStop(0.4, 'rgba(255, 100,  20, 0.55)')
  g.addColorStop(1,   'rgba(255,  40,   0, 0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2)
  ctx.fill()
}

// ─── component ────────────────────────────────────────────────────────────────

export default function MaskPainter() {
  // ── state ──────────────────────────────────────────────────────────────────
  const [phase, setPhase]         = useState('idle')   // idle | ready | processing | done
  const [progress, setProgress]   = useState(0)
  const [brushSize, setBrushSize] = useState(24)
  const [hasMask, setHasMask]     = useState(false)

  // ── refs ───────────────────────────────────────────────────────────────────
  const wrapperRef      = useRef(null)
  const imgCanvasRef    = useRef(null)   // bottom layer: image
  const maskCanvasRef   = useRef(null)   // top layer:   mask + animation
  const isDrawingRef    = useRef(false)
  const strokesRef      = useRef([])     // committed strokes
  const liveStrokeRef   = useRef([])     // stroke in progress
  const brushSizeRef    = useRef(brushSize)
  const rafRef          = useRef(null)

  // keep ref in sync so canvas handlers always read the latest brush size
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])

  // ── image loading ──────────────────────────────────────────────────────────
  const loadImage = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      const maxW  = wrapperRef.current.clientWidth
      const scale = Math.min(1, maxW / img.naturalWidth, MAX_H / img.naturalHeight)
      const w     = Math.round(img.naturalWidth  * scale)
      const h     = Math.round(img.naturalHeight * scale)

      for (const ref of [imgCanvasRef, maskCanvasRef]) {
        ref.current.width  = w
        ref.current.height = h
      }
      imgCanvasRef.current.getContext('2d').drawImage(img, 0, 0, w, h)
      maskCanvasRef.current.getContext('2d').clearRect(0, 0, w, h)

      strokesRef.current = []
      liveStrokeRef.current = []
      setHasMask(false)
      setProgress(0)
      setPhase('ready')
    }
    img.src = url
  }, [])

  // ── drawing ────────────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    if (phase !== 'ready') return
    e.preventDefault()
    maskCanvasRef.current.setPointerCapture(e.pointerId)
    isDrawingRef.current = true
    const pos = getPos(maskCanvasRef.current, e)
    liveStrokeRef.current = [pos]
    drawStroke(
      maskCanvasRef.current.getContext('2d'),
      [pos], MASK_COLOR, brushSizeRef.current,
    )
    setHasMask(true)
  }, [phase])

  const onPointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return
    e.preventDefault()
    const pos    = getPos(maskCanvasRef.current, e)
    const stroke = liveStrokeRef.current
    const ctx    = maskCanvasRef.current.getContext('2d')
    // incremental: only draw the new segment
    if (stroke.length > 0) {
      drawStroke(ctx, [stroke[stroke.length - 1], pos], MASK_COLOR, brushSizeRef.current)
    }
    stroke.push(pos)
  }, [])

  const onPointerUp = useCallback(() => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    if (liveStrokeRef.current.length > 0) {
      strokesRef.current.push([...liveStrokeRef.current])
      liveStrokeRef.current = []
    }
  }, [])

  // ── clear ──────────────────────────────────────────────────────────────────
  const clearMask = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const c = maskCanvasRef.current
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    strokesRef.current    = []
    liveStrokeRef.current = []
    setHasMask(false)
    setProgress(0)
    setPhase('ready')
  }, [])

  // ── apply / animation ──────────────────────────────────────────────────────
  const handleApply = useCallback(() => {
    // Build a flat point array with stroke-break markers
    const flatPts = []
    for (const stroke of strokesRef.current) {
      for (let i = 0; i < stroke.length; i++) {
        flatPts.push({ ...stroke[i], newStroke: i === 0 })
      }
    }
    if (flatPts.length === 0) return

    setPhase('processing')
    setProgress(0)

    const canvas      = maskCanvasRef.current
    const ctx         = canvas.getContext('2d')
    const { width, height } = canvas
    const strokes     = strokesRef.current
    const size        = brushSizeRef.current
    const total       = flatPts.length
    // advance fast enough to finish in ~1.5 s regardless of path length
    const speed       = Math.max(1, Math.ceil(total / 90))
    let   index       = 0

    const tick = () => {
      index = Math.min(index + speed, total)
      const pct = Math.round((index / total) * 100)
      setProgress(pct)

      ctx.clearRect(0, 0, width, height)

      // ── dim background: full mask at low opacity ──────────────────────────
      ctx.globalAlpha = 0.25
      for (const s of strokes) drawStroke(ctx, s, MASK_SOLID, size)
      ctx.globalAlpha = 1

      // ── bright "scanned so far" overlay ──────────────────────────────────
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)'
      ctx.lineWidth   = size
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.beginPath()
      for (let i = 0; i < index; i++) {
        const pt = flatPts[i]
        if (pt.newStroke) ctx.moveTo(pt.x, pt.y)
        else              ctx.lineTo(pt.x, pt.y)
      }
      ctx.stroke()

      // ── travelling glow dot ───────────────────────────────────────────────
      const cur = flatPts[Math.min(index, total - 1)]
      drawGlow(ctx, cur, size * 2)

      if (index < total) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        // restore full mask at normal opacity
        ctx.clearRect(0, 0, width, height)
        for (const s of strokes) drawStroke(ctx, s, MASK_COLOR, size)
        setPhase('done')
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // ── reset to painting after "done" ────────────────────────────────────────
  const handleReset = useCallback(() => {
    setPhase('ready')
    setProgress(0)
  }, [])

  // ── drag-and-drop ──────────────────────────────────────────────────────────
  const onDrop = useCallback((e) => {
    e.preventDefault()
    loadImage(e.dataTransfer.files[0])
  }, [loadImage])

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div ref={wrapperRef} className="min-h-screen bg-gray-950 text-gray-100 flex flex-col p-5 gap-4">

      {/* ── header ── */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold tracking-tight">Mask Painter</h1>
        {phase === 'ready' && (
          <span className="text-xs text-gray-500">Paint a red mask, then click Apply</span>
        )}
        {phase === 'processing' && (
          <span className="text-xs text-orange-400 animate-pulse">Processing…</span>
        )}
        {phase === 'done' && (
          <span className="text-xs text-green-400">Done — paint more or upload a new image</span>
        )}
      </div>

      {/* ── upload zone (idle only) ── */}
      <label
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`flex-1 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:border-gray-500 transition-colors min-h-64 ${phase !== 'idle' ? 'hidden' : ''}`}
      >
        <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span className="text-gray-500 text-sm">Drop an image here or click to upload</span>
        <input
          type="file" accept="image/*" className="hidden"
          onChange={(e) => loadImage(e.target.files[0])}
        />
      </label>

      {/* ── canvas area — always in DOM so refs are populated on first load ── */}
      <div className={`flex flex-col gap-4 ${phase === 'idle' ? 'hidden' : ''}`}>

          {/* stacked canvases */}
          <div className="relative mx-auto rounded-xl overflow-hidden shadow-2xl" style={{ lineHeight: 0 }}>
            <canvas ref={imgCanvasRef} className="block" />
            <canvas
              ref={maskCanvasRef}
              className={`absolute inset-0 ${phase === 'ready' ? 'cursor-crosshair' : 'cursor-default'}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          </div>

          {/* ── toolbar ── */}
          <div className="flex flex-wrap items-center gap-3">

            {/* brush size */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Brush</span>
              <input
                type="range" min={6} max={64} value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                disabled={phase === 'processing'}
                className="w-24 accent-red-500"
              />
              <span className="w-6 tabular-nums">{brushSize}</span>
            </div>

            <div className="flex-1" />

            {/* change image */}
            <label className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors">
              Change image
              <input
                type="file" accept="image/*" className="hidden"
                onChange={(e) => loadImage(e.target.files[0])}
              />
            </label>

            {/* clear */}
            <button
              onClick={clearMask}
              disabled={!hasMask || phase === 'processing'}
              className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Clear mask
            </button>

            {/* apply / reset */}
            {phase === 'done' ? (
              <button
                onClick={handleReset}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-green-700 hover:bg-green-600 transition-colors"
              >
                Paint more
              </button>
            ) : (
              <button
                onClick={handleApply}
                disabled={!hasMask || phase === 'processing'}
                className="px-4 py-1.5 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Apply
              </button>
            )}
          </div>

          {/* ── progress bar ── */}
          {(phase === 'processing' || phase === 'done') && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{phase === 'done' ? 'Complete' : 'Simulating API call…'}</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${progress}%`,
                    background: phase === 'done'
                      ? '#22c55e'
                      : 'linear-gradient(to right, #dc2626, #f97316)',
                  }}
                />
              </div>
            </div>
          )}

      </div>
    </div>
  )
}
