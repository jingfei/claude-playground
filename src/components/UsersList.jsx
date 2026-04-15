import { useState } from 'react'
import { Avatar, RoleBadge, StatusBadge, Button, Icons } from './ui.jsx'

export default function UsersList({ users, canEdit, navigate }) {
  const [search, setSearch] = useState('')

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} members</p>
        </div>
        {canEdit && (
          <Button onClick={() => navigate('user', null, { editing: true })} size="sm">
            <Icons.Plus /> Add user
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
          placeholder="Search by name, email or role…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-600">No users match your search.</td></tr>
            ) : filtered.map(user => (
              <tr
                key={user.id}
                onClick={() => navigate('user', user.id)}
                className="bg-gray-900/30 hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.name} size="sm" />
                    <div>
                      <p className="font-medium text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{user.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{user.email}</td>
                <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                  {canEdit && (
                    <Button variant="ghost" size="sm" onClick={() => navigate('user', user.id, { editing: true })}>
                      <Icons.Edit /> Edit
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-600 py-8">No users match your search.</p>
        ) : filtered.map(user => (
          <button
            key={user.id}
            onClick={() => navigate('user', user.id)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-left hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar name={user.name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-gray-100 truncate">{user.name}</p>
                  <RoleBadge role={user.role} />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
