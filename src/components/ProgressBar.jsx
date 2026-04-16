import { useEffect, useId, useRef, useState } from 'react'

/**
 * ProgressBar
 *
 * Props:
 *   percentage  – 0–100 target value (animates whenever it changes)
 *   label       – accessible label (default "Progress")
 *   showValue   – show the numeric percentage next to the bar (default true)
 *   size        – 'sm' | 'md' | 'lg'  (bar height)
 *   color       – 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky'
 *   duration    – animation duration in ms (default 600)
 *   striped     – show animated diagonal stripes while < 100 (default false)
 *   status      – undefined | 'success' | 'error'  (overrides color + shows icon)
 */
export default function ProgressBar({
  percentage  = 0,
  label       = 'Progress',
  showValue   = true,
  size        = 'md',
  color       = 'indigo',
  duration    = 600,
  striped     = false,
  status,
}) {
  const id = useId()
  const clampedTarget = Math.min(100, Math.max(0, percentage))

  // Animate from the previous value to the new target
  const [displayed, setDisplayed] = useState(0)
  const rafRef     = useRef(null)
  const startRef   = useRef(null)
  const fromRef    = useRef(0)

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    const from = fromRef.current
    const delta = clampedTarget - from
    if (delta === 0) return

    startRef.current = null

    function tick(ts) {
      if (!startRef.current) startRef.current = ts
      const elapsed  = ts - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const value = from + delta * eased

      fromRef.current = value
      setDisplayed(value)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = clampedTarget
        setDisplayed(clampedTarget)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [clampedTarget, duration])

  const resolvedColor = status === 'success'
    ? 'emerald'
    : status === 'error'
    ? 'rose'
    : color

  const trackClass  = TRACK_COLORS[resolvedColor]  ?? TRACK_COLORS.indigo
  const fillClass   = FILL_COLORS[resolvedColor]   ?? FILL_COLORS.indigo
  const heightClass = HEIGHT[size] ?? HEIGHT.md

  const isComplete = clampedTarget === 100 && !status
  const showStripes = striped && clampedTarget > 0 && clampedTarget < 100 && !status

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Label row */}
      <div className="flex items-center justify-between text-sm">
        <span id={id} className="font-medium text-gray-200">{label}</span>
        {showValue && (
          <span
            className="tabular-nums text-gray-400 text-xs min-w-[3ch] text-right"
            aria-hidden="true"
          >
            {Math.round(displayed)}%
          </span>
        )}
      </div>

      {/* Track */}
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuenow={Math.round(displayed)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`relative overflow-hidden rounded-full ${heightClass} ${trackClass}`}
      >
        {/* Fill */}
        <div
          className={`
            h-full rounded-full transition-none
            ${fillClass}
            ${showStripes ? 'progress-stripes' : ''}
          `}
          style={{ width: `${displayed}%` }}
        />

        {/* Shimmer overlay while animating */}
        {displayed > 0 && displayed < 100 && (
          <div
            className="absolute inset-y-0 left-0 w-full pointer-events-none"
            style={{ width: `${displayed}%` }}
            aria-hidden="true"
          >
            <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        )}
      </div>

      {/* Status message */}
      {status && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-center gap-1.5 text-xs font-medium
            ${status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}
        >
          {status === 'success' ? <CheckIcon /> : <XIcon />}
          {status === 'success' ? 'Complete' : 'Failed'}
        </div>
      )}

      {isComplete && !status && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-400"
        >
          <CheckIcon />
          Done
        </div>
      )}
    </div>
  )
}

// ─── color maps ───────────────────────────────────────────────────────────────

const TRACK_COLORS = {
  indigo:  'bg-indigo-950',
  emerald: 'bg-emerald-950',
  amber:   'bg-amber-950',
  rose:    'bg-rose-950',
  sky:     'bg-sky-950',
}

const FILL_COLORS = {
  indigo:  'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  sky:     'bg-sky-500',
}

const HEIGHT = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

// ─── icons ────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}
