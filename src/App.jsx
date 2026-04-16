import { useState } from 'react'
import StarRating from './components/StarRating.jsx'

// ─── helpers ──────────────────────────────────────────────────────────────────

function Section({ title, description, children }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:p-6 space-y-5">
        {children}
      </div>
    </section>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <span className="text-xs font-medium text-gray-500 sm:w-28 shrink-0">{label}</span>
      <div className="flex items-center gap-4 flex-wrap">{children}</div>
    </div>
  )
}

const LABEL_MAP = ['', 'Terrible', 'Poor', 'OK', 'Good', 'Excellent']

// ─── app ──────────────────────────────────────────────────────────────────────

export default function App() {
  // Basic controlled
  const [basic, setBasic] = useState(0)

  // Sizes demo
  const [sizeRating, setSizeRating] = useState(3)

  // Clearable demo
  const [clearable, setClearable] = useState(4)

  // Multi-category form
  const [form, setForm] = useState({ quality: 0, service: 0, value: 0, delivery: 0 })
  const [submitted, setSubmitted] = useState(false)
  const setFormField = (field) => (val) => setForm(f => ({ ...f, [field]: val }))

  const allRated = Object.values(form).every(v => v > 0)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  // Read-only samples (e.g. product reviews)
  const reviews = [
    { name: 'Alex R.',    rating: 5, text: 'Absolutely love it — exceeded every expectation.' },
    { name: 'Sam T.',     rating: 4, text: 'Great product, shipping was a little slow.'       },
    { name: 'Jordan M.',  rating: 3, text: 'Does the job, nothing special.'                   },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Star Rating Widget</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accessible, reusable — radio inputs, keyboard navigation, ARIA live regions.
          </p>
        </div>

        {/* ── Basic interactive ── */}
        <Section
          title="Interactive"
          description="Hover to preview, click to select. Keyboard: Tab into the group, arrow keys to move."
        >
          <div className="flex flex-col items-start gap-4">
            <StarRating
              value={basic}
              onChange={setBasic}
              label="Rate your experience"
              size="lg"
            />
            <div className="flex items-center gap-3 text-sm">
              {basic > 0 ? (
                <>
                  <span className="text-amber-400 font-semibold">{LABEL_MAP[basic]}</span>
                  <span className="text-gray-600">·</span>
                  <span className="text-gray-400">{basic} / 5 stars</span>
                  <button
                    onClick={() => setBasic(0)}
                    className="text-xs text-gray-600 hover:text-gray-400 underline underline-offset-2 transition-colors"
                  >
                    Clear
                  </button>
                </>
              ) : (
                <span className="text-gray-600">No rating selected</span>
              )}
            </div>
          </div>
        </Section>

        {/* ── Sizes ── */}
        <Section title="Sizes" description="sm · md · lg — the same controlled value across all three.">
          <div className="space-y-4">
            <Row label="Small">
              <StarRating value={sizeRating} onChange={setSizeRating} label="Small size rating" size="sm" />
            </Row>
            <Row label="Medium">
              <StarRating value={sizeRating} onChange={setSizeRating} label="Medium size rating" size="md" />
            </Row>
            <Row label="Large">
              <StarRating value={sizeRating} onChange={setSizeRating} label="Large size rating" size="lg" />
            </Row>
          </div>
        </Section>

        {/* ── Clearable ── */}
        <Section
          title="Clearable"
          description="Click the selected star again to reset the rating to zero."
        >
          <div className="flex items-center gap-5">
            <StarRating
              value={clearable}
              onChange={setClearable}
              label="Clearable rating"
              clearable
              size="md"
            />
            <span className="text-sm text-gray-500">
              {clearable > 0 ? `${clearable} star${clearable !== 1 ? 's' : ''}` : 'Cleared'}
            </span>
          </div>
        </Section>

        {/* ── Read-only ── */}
        <Section
          title="Read-only"
          description={"Display-only stars for showing stored ratings. Rendered as role=\"img\" with aria-label."}
        >
          <div className="divide-y divide-gray-800 -my-1">
            {reviews.map((r) => (
              <div key={r.name} className="py-4 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-200">{r.name}</span>
                  <StarRating value={r.rating} readOnly size="sm" label={`${r.name}'s rating`} />
                </div>
                <p className="text-sm text-gray-500">{r.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Multi-category form ── */}
        <Section
          title="Multi-category form"
          description="Each StarRating has its own fieldset and legend. Submit is disabled until all categories are rated."
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { field: 'quality',  label: 'Quality'  },
              { field: 'service',  label: 'Service'  },
              { field: 'value',    label: 'Value'    },
              { field: 'delivery', label: 'Delivery' },
            ].map(({ field, label }) => (
              <Row key={field} label={label}>
                <StarRating
                  value={form[field]}
                  onChange={setFormField(field)}
                  label={label}
                  name={field}
                  size="md"
                />
                <span className="text-xs text-gray-600 min-w-16">
                  {form[field] > 0 ? LABEL_MAP[form[field]] : 'Not rated'}
                </span>
              </Row>
            ))}

            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={!allRated}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-sm font-semibold disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
              >
                Submit review
              </button>
              {!allRated && (
                <span className="text-xs text-gray-600">Rate all categories to submit</span>
              )}
              {submitted && (
                <span className="text-xs text-emerald-400 animate-pulse">Review submitted!</span>
              )}
            </div>
          </form>
        </Section>

      </div>
    </div>
  )
}
