import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFeed } from '../api'

export default function useInfiniteScroll() {
  const [items, setItems]     = useState([])
  const [page, setPage]       = useState(0)     // 0 = not yet started
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [hasMore, setHasMore] = useState(true)

  // Keep mutable copies so callbacks never go stale
  const loadingRef = useRef(false)
  const pageRef    = useRef(0)
  const hasMoreRef = useRef(true)

  const load = useCallback(async (pageToLoad) => {
    if (loadingRef.current || !hasMoreRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFeed(pageToLoad)
      setItems((prev) => [...prev, ...data.posts])
      setHasMore(data.hasMore)
      hasMoreRef.current = data.hasMore
      setPage(pageToLoad)
      pageRef.current = pageToLoad
    } catch (err) {
      setError(err.message)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  // Initial load
  useEffect(() => {
    load(1)
  }, [load])

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMoreRef.current) return
    load(pageRef.current + 1)
  }, [load])

  const retry = useCallback(() => {
    load(pageRef.current + 1)
  }, [load])

  // IntersectionObserver sentinel
  const sentinelRef = useRef(null)
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return { items, page, loading, error, hasMore, retry, sentinelRef }
}
