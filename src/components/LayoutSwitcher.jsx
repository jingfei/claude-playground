import { useState, useRef, useLayoutEffect, useCallback } from 'react'

// ─── data ─────────────────────────────────────────────────────────────────────

const CARDS = [
  {
    id: 'a',
    label: 'Headline',
    body: 'The primary message. Bold, unmissable, front and centre.',
    from: '#7c3aed',
    to: '#c026d3',
    tag: 'Hero',
  },
  {
    id: 'b',
    label: 'Feature',
    body: 'A supporting point that adds depth and context to the story.',
    from: '#059669',
    to: '#0891b2',
    tag: 'Support',
  },
  {
    id: 'c',
    label: 'Detail',
    body: 'Fine print, supplementary info, and the nuanced specifics.',
    from: '#e11d48',
    to: '#ea580c',
    tag: 'Meta',
  },
]

/**
 * Each layout defines a CSS `grid-template` shorthand value.
 * Areas are named slot0, slot1, slot2 — cards are assigned to slots by index.
 */
const TEMPLATES = [
  {
    name: 'Sidebar',
    gridTemplate: '"slot0 slot1" 1fr "slot0 slot2" 1fr / 2fr 1fr',
    hint: 'One dominant left panel, two stacked right',
  },
  {
    name: 'Banner',
    gridTemplate: '"slot0 slot0" 180px "slot1 slot2" 1fr / 1fr 1fr',
    hint: 'Full-width top strip, two columns below',
  },
  {
    name: 'Columns',
    gridTemplate: '"slot0 slot1 slot2" 1fr / 1fr 1fr 1fr',
    hint: 'Three equal columns',
  },
  {
    name: 'Feature Right',
    gridTemplate: '"slot0 slot2" 1fr "slot1 slot2" 1fr / 1fr 2fr',
    hint: 'Two stacked left, one dominant right',
  },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle that guarantees a different permutation. */
function nextPermutation(arr) {
  let next
  do {
    next = [...arr]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
  } while (next.every((v, i) => v === arr[i]))
  return next
}

// ─── component ────────────────────────────────────────────────────────────────

export default function LayoutSwitcher() {
  // slots[i] = card id occupying slot i
  const [slots, setSlots]           = useState(['a', 'b', 'c'])
  const [tplIdx, setTplIdx]         = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const cardEls   = useRef({})    // { cardId → DOM element }
  const prevRects = useRef(null)  // BoundingClientRect snapshot taken before the update

  // ── shuffle: capture "First", then update state ───────────────────────────
  const shuffle = useCallback(() => {
    if (isAnimating) return

    // FLIP — First: record every card's current rect
    const snap = {}
    for (const [id, el] of Object.entries(cardEls.current)) {
      if (el) snap[id] = el.getBoundingClientRect()
    }
    prevRects.current = snap

    setTplIdx(i => (i + 1) % TEMPLATES.length)
    setSlots(prev => nextPermutation(prev))
    setIsAnimating(true)
  }, [isAnimating])

  // ── after React commits the new layout: Last → Invert → Play ─────────────
  useLayoutEffect(() => {
    if (!prevRects.current) return
    const firsts = prevRects.current
    prevRects.current = null

    const finished = []

    for (const [id, el] of Object.entries(cardEls.current)) {
      const first = firsts[id]
      if (!el || !first) continue

      const last = el.getBoundingClientRect()

      // Centre-to-centre translation (default transform-origin is 50% 50%)
      const dx = (first.left + first.width  / 2) - (last.left + last.width  / 2)
      const dy = (first.top  + first.height / 2) - (last.top  + last.height / 2)

      // Scale difference
      const sx = first.width  / last.width
      const sy = first.height / last.height

      // Skip if movement is imperceptible
      if (Math.abs(dx) + Math.abs(dy) + Math.abs(sx - 1) + Math.abs(sy - 1) < 0.5) continue

      const anim = el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
          { transform: 'translate(0, 0) scale(1, 1)' },
        ],
        {
          duration: 480,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          fill: 'none',
        },
      )
      finished.push(anim.finished)
    }

    if (finished.length === 0) {
      setIsAnimating(false)
    } else {
      Promise.all(finished).then(() => setIsAnimating(false))
    }
  }, [tplIdx, slots])

  const template = TEMPLATES[tplIdx]

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col gap-5 p-6 select-none">

      {/* ── header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Magic Layout Switcher</h1>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-gray-300">{template.name}</span>
            {' — '}
            {template.hint}
          </p>
        </div>

        <button
          onClick={shuffle}
          disabled={isAnimating}
          className="shrink-0 px-5 py-2 rounded-xl bg-white text-gray-950 text-sm font-semibold hover:bg-gray-100 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
        >
          Shuffle
        </button>
      </div>

      {/* ── grid ── */}
      <div
        className="grid gap-3 flex-1"
        style={{ gridTemplate: template.gridTemplate }}
      >
        {CARDS.map(card => {
          const slot = slots.indexOf(card.id)
          return (
            <div
              key={card.id}
              ref={el => { cardEls.current[card.id] = el }}
              style={{
                gridArea: `slot${slot}`,
                background: `linear-gradient(135deg, ${card.from}, ${card.to})`,
                willChange: 'transform',
              }}
              className="rounded-2xl p-5 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                  {card.tag}
                </span>
                <span className="text-xs font-mono text-white/40">
                  slot{slot}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{card.label}</h2>
                <p className="text-sm text-white/70 mt-1 leading-relaxed">{card.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── layout indicator dots ── */}
      <div className="flex justify-center items-center gap-2">
        {TEMPLATES.map((t, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${
              i === tplIdx
                ? 'w-4 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-gray-700'
            }`}
          />
        ))}
      </div>

    </div>
  )
}
