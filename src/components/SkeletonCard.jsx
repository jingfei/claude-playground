export default function SkeletonCard() {
  return (
    <div
      className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-800 animate-pulse flex-shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="h-3.5 w-28 rounded bg-gray-800 animate-pulse" />
          <div className="h-3 w-20 rounded bg-gray-800 animate-pulse" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-800 animate-pulse ml-auto flex-shrink-0" />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-4/5 rounded bg-gray-800 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-gray-800 animate-pulse" />
      </div>

      {/* Body lines */}
      <div className="flex flex-col gap-1.5">
        <div className="h-3 rounded bg-gray-800 animate-pulse" />
        <div className="h-3 rounded bg-gray-800 animate-pulse" />
        <div className="h-3 w-3/5 rounded bg-gray-800 animate-pulse" />
      </div>

      {/* Engagement */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-800">
        <div className="h-3 w-12 rounded bg-gray-800 animate-pulse" />
        <div className="h-3 w-16 rounded bg-gray-800 animate-pulse" />
      </div>
    </div>
  )
}
