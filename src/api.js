// ─── mock data ────────────────────────────────────────────────────────────────

export const CATEGORIES = ['Engineering', 'Design', 'Product', 'Culture', 'Data', 'Security']

const CAT_COLORS = {
  Engineering: 'bg-blue-500/15   text-blue-300   ring-blue-500/30',
  Design:      'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30',
  Product:     'bg-violet-500/15  text-violet-300  ring-violet-500/30',
  Culture:     'bg-emerald-500/15 text-emerald-300  ring-emerald-500/30',
  Data:        'bg-amber-500/15   text-amber-300   ring-amber-500/30',
  Security:    'bg-red-500/15     text-red-300     ring-red-500/30',
}

export function categoryStyle(cat) {
  return CAT_COLORS[cat] ?? CAT_COLORS.Engineering
}

const AUTHORS = [
  { name: 'Alice Chen',    avatar: '#7c3aed' },
  { name: 'Marcus Webb',   avatar: '#0891b2' },
  { name: 'Priya Nair',    avatar: '#059669' },
  { name: 'Jordan Blake',  avatar: '#e11d48' },
  { name: 'Sam Torres',    avatar: '#d97706' },
  { name: 'Elena Kowalski',avatar: '#8b5cf6' },
]

const POSTS = [
  { title: 'Rethinking component boundaries in large React apps',
    body:  'As codebases scale, the question of where to draw component boundaries becomes increasingly important. Splitting too early leads to premature abstraction; splitting too late creates unmaintainable monoliths. Here we explore a rule-of-thumb based on data dependencies rather than visual grouping.',
    category: 'Engineering', likes: 312, comments: 47 },

  { title: 'Why we rewrote our design system from scratch',
    body:  'Three years into our original design system, the technical debt had become crippling. Token naming collisions, inconsistent spacing scales, and a component library that no one trusted. This is the story of what we changed and what we would do differently.',
    category: 'Design', likes: 489, comments: 83 },

  { title: 'The hidden costs of feature flags at scale',
    body:  'Feature flags unlock powerful release workflows, but at scale they introduce a surprising set of problems: combinatorial state explosions, performance overhead on hot paths, and the cognitive burden of reasoning about which flags interact. Here is how we tackled each.',
    category: 'Engineering', likes: 271, comments: 34 },

  { title: 'Building trust in cross-functional teams',
    body:  'Trust is the highest-leverage investment a team can make. But trust is not a soft concept — it has measurable preconditions: predictability, consistency, and psychological safety. We break down how our engineering and product orgs deliberately build each one.',
    category: 'Culture', likes: 203, comments: 61 },

  { title: 'FLIP animations in production: lessons from two years',
    body:  'First, Last, Invert, Play — the FLIP technique promises buttery-smooth layout transitions at 60fps. In practice, getting it right in a live product with dynamic content, variable viewport sizes, and screen readers requires considerably more care than the tutorials suggest.',
    category: 'Engineering', likes: 388, comments: 52 },

  { title: 'Streaming data pipelines without Kafka: a pragmatic guide',
    body:  'Kafka is powerful, but it carries significant operational overhead. For teams below a certain scale, lighter-weight options often deliver 90% of the value at 10% of the cost. We survey the landscape and share the decision framework we use with customers.',
    category: 'Data', likes: 445, comments: 71 },

  { title: 'How we run design crits that engineers actually attend',
    body:  'Design critiques that exclude engineers create a costly feedback loop. Changes discovered in implementation are expensive to fix and demoralising for everyone. This post outlines the ritual changes that made our crits cross-functional by default.',
    category: 'Design', likes: 234, comments: 29 },

  { title: 'Zero-trust networking for early-stage startups',
    body:  'Zero-trust is no longer just for enterprises. With modern tooling, even a five-person team can adopt a zero-trust posture without dedicated security staff. Here is the minimal viable zero-trust stack we recommend for seed-stage companies.',
    category: 'Security', likes: 519, comments: 94 },

  { title: 'Shipping a product in 12 weeks: what we cut and why',
    body:  'Our team committed to a twelve-week hard launch. To hit it, we made dozens of deliberate cuts — features, polish, integrations. Looking back, most of those cuts were the right call. This post explores our prioritisation framework and the one cut we regret.',
    category: 'Product', likes: 376, comments: 68 },

  { title: 'The three failure modes of observability programs',
    body:  'Most observability initiatives fail for one of three reasons: they instrument the wrong things, they drown on-call engineers in noise, or they remain siloed in the platform team. Each failure mode has a distinct root cause — and a distinct fix.',
    category: 'Engineering', likes: 291, comments: 43 },

  { title: 'Accessible colour systems: beyond contrast ratios',
    body:  'WCAG contrast ratios are necessary but not sufficient for accessible colour. Colour-blind users, high-contrast mode, forced-colours environments, and dark-mode all introduce edge cases that a single contrast check will miss. Here is our expanded audit checklist.',
    category: 'Design', likes: 418, comments: 57 },

  { title: 'When to build vs. buy your ML infrastructure',
    body:  'The build-vs-buy calculus for ML infrastructure has shifted dramatically in three years. Managed feature stores, model registries, and experiment tracking platforms have matured to the point where building your own is often the wrong choice. Here is how we think about it.',
    category: 'Data', likes: 347, comments: 49 },

  { title: 'On-call rotations that do not burn people out',
    body:  'On-call rotation design is one of the highest-leverage levers for engineering team health. Small changes — alert ownership, runbook quality, and escalation paths — compound into dramatically different team experiences. This is our current setup.',
    category: 'Culture', likes: 502, comments: 88 },

  { title: 'Why we deprecated our GraphQL gateway after 18 months',
    body:  'We adopted GraphQL with high hopes: flexible queries, strong typing, great tooling. Eighteen months later we reversed course. The n+1 problem, over-fetching clients, schema governance overhead, and difficulty onboarding new engineers outweighed the benefits for our use case.',
    category: 'Engineering', likes: 634, comments: 121 },

  { title: 'Content strategy for technical products',
    body:  'Most technical product teams under-invest in content strategy, treating docs and marketing copy as afterthoughts. A strong content strategy defines not just what you write, but for whom, at what stage of their journey, and through which channel.',
    category: 'Product', likes: 167, comments: 22 },

  { title: 'Penetration testing for teams without a security budget',
    body:  'Formal penetration tests can cost tens of thousands of dollars. But many of the most impactful findings come from low-cost techniques that any engineer can run: OWASP ZAP scans, header audits, dependency vulnerability checks, and social engineering simulations.',
    category: 'Security', likes: 428, comments: 73 },

  { title: 'Designing for the 200ms rule',
    body:  'Perception research consistently shows that responses within 200ms feel instantaneous. Beyond that threshold, users begin to notice. Most product teams track p95 latency but ignore p50 — optimising for the tail while leaving the median experience mediocre.',
    category: 'Design', likes: 353, comments: 46 },

  { title: 'Event sourcing without the ceremony',
    body:  'Event sourcing is frequently over-engineered with Kafka, CQRS, and complex projections before the team has validated whether events are even the right model. Here is the minimum viable event sourcing approach we use to validate the pattern cheaply.',
    category: 'Engineering', likes: 279, comments: 38 },

  { title: 'The silent costs of a low-trust engineering culture',
    body:  'Low-trust manifests in ways that are easy to miss: excessive review cycles, defensive documentation, slow decisions, and high senior-engineer burnout. This post enumerates the signals we use to diagnose trust deficits early.',
    category: 'Culture', likes: 461, comments: 97 },

  { title: 'dbt patterns for teams graduating from SQL scripts',
    body:  'Most teams start with ad-hoc SQL scripts in a shared folder. dbt offers a better path, but the learning curve is steeper than its reputation suggests. These are the five dbt patterns we teach first to teams making the transition.',
    category: 'Data', likes: 322, comments: 44 },

  { title: 'Prototyping with real data without breaking production',
    body:  'Designing against realistic data is crucial — placeholder content hides layout failures that only appear at scale. But using real production data in prototyping tools raises privacy and security concerns. Here is how we solve both problems.',
    category: 'Design', likes: 195, comments: 31 },

  { title: 'Incident retrospectives that change behaviour',
    body:  'Post-mortems are common; behavioural change from post-mortems is rare. The gap is almost always in the action items: too vague, too many, no owner, no deadline. This is the retrospective template we use to maximise carry-through.',
    category: 'Engineering', likes: 537, comments: 102 },

  { title: 'Building an internal developer portal in 2025',
    body:  'Internal developer portals have moved from nice-to-have to table stakes for engineering teams above 30 engineers. The new generation of tools — Backstage, Cortex, Port — dramatically lower the build cost. Here is our evaluation framework.',
    category: 'Product', likes: 248, comments: 37 },

  { title: 'Supply chain attacks: what every engineer should know',
    body:  'The SolarWinds and XZ Utils incidents put supply chain security on every CISO\'s radar. But the defensive measures are not just for security teams — every engineer who runs npm install or pip install is a first line of defence.',
    category: 'Security', likes: 671, comments: 134 },

  { title: 'Async-first communication at distributed teams',
    body:  'Async communication is not just about reducing meetings. Done well, it creates a searchable institutional memory, reduces coordination overhead across time zones, and forces clearer thinking. Done poorly, it creates latency anxiety and information silos.',
    category: 'Culture', likes: 384, comments: 59 },
]

// Attach deterministic author + timestamp to each post
const TIMES = [
  '2 minutes ago','15 minutes ago','1 hour ago','3 hours ago','6 hours ago',
  '12 hours ago','Yesterday','2 days ago','3 days ago','5 days ago','1 week ago',
]

export const ALL_POSTS = POSTS.map((p, i) => ({
  id:        String(i + 1),
  ...p,
  author:    AUTHORS[i % AUTHORS.length].name,
  authorBg:  AUTHORS[i % AUTHORS.length].avatar,
  timestamp: TIMES[i % TIMES.length],
}))

// ─── simulated API ────────────────────────────────────────────────────────────

export const PAGE_SIZE = 6

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

/**
 * Fetches a page of posts.
 * Simulates network latency (600–1000 ms) and occasional failures
 * (~25% chance on pages after the first) to demonstrate error handling.
 */
export async function fetchFeed(page) {
  await delay(600 + Math.random() * 400)

  if (page > 1 && Math.random() < 0.25) {
    throw new Error('Network error — could not load more posts.')
  }

  const start = (page - 1) * PAGE_SIZE
  const slice = ALL_POSTS.slice(start, start + PAGE_SIZE)
  return {
    posts:   slice,
    hasMore: start + PAGE_SIZE < ALL_POSTS.length,
    page,
  }
}
