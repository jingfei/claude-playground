import { useEffect, useId, useRef, useState } from 'react'
import useTypeahead from '../hooks/useTypeahead'
import ResultList from './ResultList'

export default function SearchBox() {
  const id = useId()
  const inputRef     = useRef(null)
  const listboxRef   = useRef(null)
  const [open, setOpen]       = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)

  const { query, setQuery, results, status, error, clear } = useTypeahead()

  const listboxId = `${id}-listbox`
  const statusId  = `${id}-status`

  // Open whenever there's a non-empty query (regardless of results count)
  useEffect(() => {
    setOpen(query.trim().length > 0)
    setActiveIdx(-1)
  }, [query, status])

  // ── keyboard navigation ───────────────────────────────────────────────────
  function handleKeyDown(e) {
    if (!open) return

    const count = results.length
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, count - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, -1))
        break
      case 'Home':
        if (count) { e.preventDefault(); setActiveIdx(0) }
        break
      case 'End':
        if (count) { e.preventDefault(); setActiveIdx(count - 1) }
        break
      case 'Enter':
        if (activeIdx >= 0 && results[activeIdx]) {
          e.preventDefault()
          selectItem(results[activeIdx])
        }
        break
      case 'Escape':
        setOpen(false)
        setActiveIdx(-1)
        inputRef.current?.focus()
        break
      default:
        break
    }
  }

  function selectItem(item) {
    setQuery(item.label)
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.focus()
  }

  // Scroll active option into view
  useEffect(() => {
    if (activeIdx < 0 || !listboxRef.current) return
    const el = listboxRef.current.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const activeOptionId = activeIdx >= 0 ? `${id}-option-${activeIdx}` : undefined

  return (
    <div className="relative w-full max-w-xl" onKeyDown={handleKeyDown}>
      {/* Input */}
      <div className="relative flex items-center">
        {/* Search icon */}
        <SearchIcon className="absolute left-3.5 w-4 h-4 text-gray-500 pointer-events-none" />

        <input
          ref={inputRef}
          id={`${id}-input`}
          type="search"
          role="combobox"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="Search people, repos, docs, teams…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          onBlur={(e) => {
            // Close unless focus moved inside the listbox
            if (!e.relatedTarget?.closest('[role="listbox"]')) {
              setOpen(false)
              setActiveIdx(-1)
            }
          }}
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-describedby={statusId}
          className={`
            w-full bg-gray-900 border text-sm text-gray-100 rounded-xl
            pl-9 pr-9 py-2.5 outline-none transition-colors placeholder:text-gray-600
            ${open
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-gray-700 hover:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
            }
          `}
        />

        {/* Loading spinner / clear button */}
        <div className="absolute right-3 flex items-center">
          {status === 'loading' && (
            <Spinner className="w-4 h-4 text-indigo-400" aria-hidden="true" />
          )}
          {query && status !== 'loading' && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { clear(); inputRef.current?.focus() }}
              className="text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ClearIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Visually-hidden live region for AT announcements */}
      <div id={statusId} role="status" aria-live="polite" className="sr-only">
        {status === 'loading' && 'Searching…'}
        {status === 'success' && results.length === 0 && 'No results found.'}
        {status === 'success' && results.length > 0 && `${results.length} result${results.length === 1 ? '' : 's'} found.`}
        {status === 'error' && error}
      </div>

      {/* Dropdown */}
      {open && (
        <ResultList
          ref={listboxRef}
          id={listboxId}
          inputId={`${id}-input`}
          optionIdPrefix={`${id}-option`}
          results={results}
          status={status}
          error={error}
          activeIdx={activeIdx}
          onSelect={selectItem}
          onMouseEnter={(idx) => setActiveIdx(idx)}
        />
      )}
    </div>
  )
}

// ─── small inline icons ───────────────────────────────────────────────────────

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

function ClearIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

function Spinner({ className }) {
  return (
    <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
