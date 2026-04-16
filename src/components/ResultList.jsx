import { forwardRef } from 'react'

// Group heading labels
const GROUP_LABELS = {
  person: 'People',
  team:   'Teams',
  repo:   'Repositories',
  doc:    'Documents',
}

const ResultList = forwardRef(function ResultList(
  { id, optionIdPrefix, results, status, error, activeIdx, onSelect, onMouseEnter },
  ref
) {
  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 z-50
                 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl shadow-black/40
                 overflow-hidden"
    >
      {/* Error */}
      {status === 'error' && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-400">
          <ErrorIcon className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {status === 'loading' && (
        <div className="py-2 px-1" aria-hidden="true">
          {[80, 60, 70].map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-gray-800 animate-pulse flex-shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className={`h-3 rounded bg-gray-800 animate-pulse`} style={{ width: `${w}%` }} />
                <div className="h-2.5 w-1/2 rounded bg-gray-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {status === 'success' && results.length === 0 && (
        <div className="px-4 py-5 text-sm text-gray-500 text-center">
          No results found
        </div>
      )}

      {/* Results */}
      {status === 'success' && results.length > 0 && (
        <ul
          ref={ref}
          id={id}
          role="listbox"
          aria-label="Search results"
          className="py-1.5 max-h-80 overflow-y-auto"
        >
          {results.map((item, idx) => {
            const isFirst = idx === 0 || results[idx - 1].type !== item.type
            const isActive = idx === activeIdx

            return (
              <li key={item.id} role="none">
                {/* Group heading */}
                {isFirst && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 select-none">
                    {GROUP_LABELS[item.type] ?? item.type}
                  </div>
                )}

                <button
                  id={`${optionIdPrefix}-${idx}`}
                  role="option"
                  data-idx={idx}
                  aria-selected={isActive}
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                  onClick={() => onSelect(item)}
                  onMouseEnter={() => onMouseEnter(idx)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                    ${isActive ? 'bg-indigo-600/20 text-gray-100' : 'text-gray-300 hover:bg-gray-800'}
                  `}
                >
                  <ItemIcon type={item.type} active={isActive} />
                  <span className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    <span className="text-xs text-gray-500 truncate">{item.meta}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
})

export default ResultList

// ─── type icons ──────────────────────────────────────────────────────────────

function ItemIcon({ type, active }) {
  const base = `w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs
                ${active ? 'bg-indigo-600/30' : 'bg-gray-800'}`
  const icon = {
    person: <PersonIcon className="w-3.5 h-3.5" />,
    repo:   <RepoIcon   className="w-3.5 h-3.5" />,
    doc:    <DocIcon    className="w-3.5 h-3.5" />,
    team:   <TeamIcon   className="w-3.5 h-3.5" />,
  }[type]

  return <span className={base} aria-hidden="true">{icon}</span>
}

function PersonIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function RepoIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44z" />
    </svg>
  )
}

function DocIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z" />
    </svg>
  )
}

function TeamIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0z" />
    </svg>
  )
}

function ErrorIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  )
}
