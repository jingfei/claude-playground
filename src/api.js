// ─── mock data ────────────────────────────────────────────────────────────────

const ITEMS = [
  // People
  { id: 'p1',  type: 'person',  label: 'Alice Chen',       meta: 'Engineering · Senior Engineer' },
  { id: 'p2',  type: 'person',  label: 'Marcus Webb',      meta: 'Design · Lead Designer' },
  { id: 'p3',  type: 'person',  label: 'Priya Nair',       meta: 'Product · Product Manager' },
  { id: 'p4',  type: 'person',  label: 'Jordan Blake',     meta: 'Data · Data Scientist' },
  { id: 'p5',  type: 'person',  label: 'Sam Torres',       meta: 'Security · Security Engineer' },
  { id: 'p6',  type: 'person',  label: 'Elena Kowalski',   meta: 'Engineering · Staff Engineer' },
  { id: 'p7',  type: 'person',  label: 'David Lee',        meta: 'Culture · People Ops' },
  { id: 'p8',  type: 'person',  label: 'Emma Wilson',      meta: 'Product · Designer' },

  // Repos
  { id: 'r1',  type: 'repo',    label: 'frontend-core',    meta: 'TypeScript · Updated 2h ago' },
  { id: 'r2',  type: 'repo',    label: 'api-gateway',      meta: 'Go · Updated 5h ago' },
  { id: 'r3',  type: 'repo',    label: 'design-system',    meta: 'TypeScript · Updated yesterday' },
  { id: 'r4',  type: 'repo',    label: 'data-pipeline',    meta: 'Python · Updated 3 days ago' },
  { id: 'r5',  type: 'repo',    label: 'auth-service',     meta: 'Rust · Updated 1 week ago' },
  { id: 'r6',  type: 'repo',    label: 'mobile-app',       meta: 'Swift · Updated 2 days ago' },

  // Docs
  { id: 'd1',  type: 'doc',     label: 'Onboarding Guide', meta: 'HR · Last edited by Alice' },
  { id: 'd2',  type: 'doc',     label: 'API Reference',    meta: 'Engineering · Last edited by Marcus' },
  { id: 'd3',  type: 'doc',     label: 'Design Tokens',    meta: 'Design · Last edited by Priya' },
  { id: 'd4',  type: 'doc',     label: 'Incident Runbooks',meta: 'Engineering · Last edited by Sam' },
  { id: 'd5',  type: 'doc',     label: 'Data Dictionary',  meta: 'Data · Last edited by Jordan' },
  { id: 'd6',  type: 'doc',     label: 'Security Policy',  meta: 'Security · Last edited by Elena' },

  // Teams
  { id: 't1',  type: 'team',    label: 'Engineering',      meta: '14 members' },
  { id: 't2',  type: 'team',    label: 'Design',           meta: '6 members' },
  { id: 't3',  type: 'team',    label: 'Product',          meta: '8 members' },
  { id: 't4',  type: 'team',    label: 'Data',             meta: '5 members' },
  { id: 't5',  type: 'team',    label: 'Security',         meta: '3 members' },
]

const TYPE_ORDER = ['person', 'team', 'repo', 'doc']
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/**
 * Simulates a search API with 200–500 ms latency.
 * Occasionally throws to exercise the error state (~10% chance).
 */
export async function search(query) {
  await delay(200 + Math.random() * 300)

  if (Math.random() < 0.1) {
    throw new Error('Search failed — please try again.')
  }

  const q = query.trim().toLowerCase()
  if (!q) return []

  const matches = ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.meta.toLowerCase().includes(q)
  )

  // Group by type in a stable order
  const grouped = []
  for (const type of TYPE_ORDER) {
    const group = matches.filter((m) => m.type === type)
    if (group.length) grouped.push(...group)
  }

  return grouped
}

export const TYPE_ICONS = {
  person: 'person',
  repo:   'repo',
  doc:    'doc',
  team:   'team',
}
