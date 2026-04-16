/**
 * StarRating — accessible, reusable star rating component.
 *
 * Accessibility approach: visually-hidden radio inputs inside a <fieldset>.
 * This gives keyboard navigation (arrow keys), screen-reader announcements,
 * and form submission support for free. The visible stars are <label>
 * elements styled with SVG.
 *
 * Props
 * ─────────────────────────────────────────────────────────────
 * value        number          Current rating (0 = unrated)
 * onChange     (n: number) => void   Called with new rating
 * max          number = 5      Total number of stars
 * size         'sm'|'md'|'lg'  Visual size
 * readOnly     boolean         Hides inputs; purely decorative
 * clearable    boolean         Clicking the active star resets to 0
 * label        string          Describes what is being rated (sr text + legend)
 * showLabel    boolean         Render label visibly above the stars
 * name         string          HTML name for the radio group (needed for forms)
 * precision    'full'|'half'   (future; currently only full supported)
 */

import { useState, useId } from 'react'

// ─── star SVG ─────────────────────────────────────────────────────────────────

const STAR_PATH =
  'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z'

function StarIcon({ filled, active, size }) {
  const sz = { sm: 'w-5 h-5', md: 'w-7 h-7', lg: 'w-10 h-10' }[size]
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={[
        sz,
        'transition-all duration-100 ease-out',
        active  ? 'scale-125 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]' : 'scale-100',
        filled  ? 'text-amber-400' : 'text-gray-600',
      ].join(' ')}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      strokeLinejoin="round"
    >
      <path d={STAR_PATH} />
    </svg>
  )
}

// ─── component ────────────────────────────────────────────────────────────────

export default function StarRating({
  value     = 0,
  onChange,
  max       = 5,
  size      = 'md',
  readOnly  = false,
  clearable = false,
  label     = 'Rating',
  showLabel = false,
  name,
}) {
  const uid      = useId()
  const groupName = name ?? uid
  const [hovered, setHovered] = useState(null)

  // What is highlighted visually: hover preview takes precedence over current value
  const highlighted = hovered ?? value

  const gap = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1.5' }[size]

  const handleChange = (star) => {
    if (readOnly) return
    onChange?.(star)
  }

  const handleLabelClick = (star) => {
    // Clearable: clicking the already-selected star resets to 0.
    // The radio onChange won't fire because it's already checked,
    // so we handle it here on the label click.
    if (clearable && value === star) onChange?.(0)
  }

  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className={showLabel ? 'text-sm font-medium text-gray-300 mb-2' : 'sr-only'}>
        {label}
      </legend>

      <div
        className={`flex items-center ${gap}`}
        onMouseLeave={() => !readOnly && setHovered(null)}
        role={readOnly ? 'img' : undefined}
        aria-label={readOnly ? `${value} out of ${max} stars` : undefined}
      >
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
          const filled  = star <= highlighted
          const active  = !readOnly && hovered === star
          const checked = star === value

          if (readOnly) {
            return <StarIcon key={star} filled={filled} active={false} size={size} />
          }

          return (
            <label
              key={star}
              htmlFor={`${uid}-star-${star}`}
              title={`${star} star${star !== 1 ? 's' : ''}`}
              className="cursor-pointer rounded focus-within:outline-2 focus-within:outline-amber-400 focus-within:outline-offset-1"
              onMouseEnter={() => setHovered(star)}
              onClick={() => handleLabelClick(star)}
            >
              {/* Visually hidden radio — keyboard + AT accessible */}
              <input
                type="radio"
                id={`${uid}-star-${star}`}
                name={groupName}
                value={star}
                checked={checked}
                onChange={() => handleChange(star)}
                aria-label={`${star} out of ${max} stars`}
                className="sr-only"
              />
              <StarIcon filled={filled} active={active} size={size} />
            </label>
          )
        })}

        {/* Live region: announces value to screen readers on change */}
        {!readOnly && (
          <span role="status" aria-live="polite" className="sr-only">
            {value > 0 ? `Rated ${value} out of ${max} stars` : 'No rating selected'}
          </span>
        )}
      </div>
    </fieldset>
  )
}
