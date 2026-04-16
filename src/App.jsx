import useInfiniteScroll from './hooks/useInfiniteScroll'
import FeedCard from './components/FeedCard'
import SkeletonCard from './components/SkeletonCard'

const SKELETON_COUNT = 3

export default function App() {
  const { items, loading, error, hasMore, retry, sentinelRef } = useInfiniteScroll()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">Feed</h1>
          <span className="text-xs text-gray-500">{items.length} posts loaded</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Screen-reader live region for loading state */}
        <div role="status" aria-live="polite" className="sr-only">
          {loading && 'Loading more posts…'}
          {error && `Error: ${error}`}
          {!hasMore && items.length > 0 && 'All posts loaded.'}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4">
          {items.map((post) => (
            <FeedCard key={post.id} post={post} />
          ))}

          {/* Skeleton placeholders while loading */}
          {loading &&
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* End of feed */}
        {!hasMore && !loading && items.length > 0 && (
          <p className="mt-8 text-center text-xs text-gray-600 pb-8">
            You&rsquo;ve reached the end
          </p>
        )}

        {/* Sentinel – triggers next page load via IntersectionObserver */}
        {hasMore && !error && (
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
        )}
      </main>
    </div>
  )
}
