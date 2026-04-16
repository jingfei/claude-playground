import { useCallback, useEffect, useRef, useState } from 'react'
import { search } from '../api'

const DEBOUNCE_MS = 300

export default function useTypeahead() {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus]   = useState('idle') // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError]     = useState(null)

  // Cancellation: each search run increments a generation counter.
  // When the response arrives, it's dropped if its generation is stale.
  const genRef     = useRef(0)
  const timerRef   = useRef(null)

  const run = useCallback(async (q, gen) => {
    if (!q.trim()) {
      setResults([])
      setStatus('idle')
      setError(null)
      return
    }
    setStatus('loading')
    setError(null)
    try {
      const data = await search(q)
      // Drop stale responses
      if (gen !== genRef.current) return
      setResults(data)
      setStatus('success')
    } catch (err) {
      if (gen !== genRef.current) return
      setError(err.message)
      setStatus('error')
      setResults([])
    }
  }, [])

  useEffect(() => {
    // Clear any pending debounce timer
    clearTimeout(timerRef.current)

    if (!query.trim()) {
      genRef.current += 1
      setResults([])
      setStatus('idle')
      setError(null)
      return
    }

    const gen = ++genRef.current
    timerRef.current = setTimeout(() => run(query, gen), DEBOUNCE_MS)

    return () => clearTimeout(timerRef.current)
  }, [query, run])

  const clear = useCallback(() => {
    genRef.current += 1
    clearTimeout(timerRef.current)
    setQuery('')
    setResults([])
    setStatus('idle')
    setError(null)
  }, [])

  return { query, setQuery, results, status, error, clear }
}
