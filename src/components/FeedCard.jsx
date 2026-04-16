import { categoryStyle } from '../api'

export default function FeedCard({ post }) {
  const { author, authorBg, timestamp, category, title, body, likes, comments } = post

  const initials = author
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <article className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
          style={{ backgroundColor: authorBg }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate">{author}</p>
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
        <span
          className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ring-1 flex-shrink-0 ${categoryStyle(category)}`}
        >
          {category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-semibold text-gray-50 leading-snug">{title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{body}</p>
      </div>

      {/* Engagement */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-800 text-gray-500">
        <button
          className="flex items-center gap-1.5 text-xs hover:text-rose-400 transition-colors"
          aria-label={`${likes} likes`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <span>{likes}</span>
        </button>
        <button
          className="flex items-center gap-1.5 text-xs hover:text-sky-400 transition-colors"
          aria-label={`${comments} comments`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <span>{comments}</span>
        </button>
      </div>
    </article>
  )
}
