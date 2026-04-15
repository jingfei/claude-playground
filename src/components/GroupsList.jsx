import { useState } from 'react'
import { Avatar, Button, Icons } from './ui.jsx'

export default function GroupsList({ groups, users, canEdit, navigate }) {
  const [search, setSearch] = useState('')

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.description.toLowerCase().includes(search.toLowerCase())
  )

  const membersOf = g => g.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean)

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Groups</h1>
          <p className="text-sm text-gray-500 mt-0.5">{groups.length} groups</p>
        </div>
        {canEdit && (
          <Button onClick={() => navigate('group', null, { editing: true })} size="sm">
            <Icons.Plus /> Add group
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          <Icons.Search />
        </span>
        <input
          type="search"
          placeholder="Search groups…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-gray-600 py-8">No groups match your search.</p>
      )}

      {/* Card grid — 2 cols on md+, 1 col on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(group => {
          const members = membersOf(group)
          return (
            <button
              key={group.id}
              onClick={() => navigate('group', group.id)}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:bg-gray-800/60 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-100 group-hover:text-white truncate">{group.name}</h2>
                  <p className="text-xs font-mono text-gray-600 mt-0.5">{group.id}</p>
                </div>
                {canEdit && (
                  <span
                    role="button"
                    onClick={e => { e.stopPropagation(); navigate('group', group.id, { editing: true }) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-700 transition-colors">
                      <Icons.Edit /> Edit
                    </span>
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{group.description}</p>

              {/* Member avatars */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                <div className="flex -space-x-2">
                  {members.slice(0, 5).map(u => (
                    <div key={u.id} title={u.name}>
                      <Avatar name={u.name} size="sm" />
                    </div>
                  ))}
                  {members.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs text-gray-400 font-medium">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-600">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
