import { useState } from 'react'
import { Avatar, RoleBadge, Button, Input, Textarea, Field, Icons } from './ui.jsx'

export default function GroupDetail({ group, users, isNew, canEdit, navigate, onSave, onDelete }) {
  const [editing, setEditing]       = useState(isNew)
  const [form, setForm]             = useState(
    group ?? { id: `g${Date.now()}`, name: '', description: '', memberIds: [] }
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [memberSearch, setMemberSearch]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return
    onSave(form)
    setEditing(false)
    if (isNew) navigate('groups')
  }

  const handleCancel = () => {
    if (isNew) { navigate('groups'); return }
    setForm(group)
    setEditing(false)
    setMemberSearch('')
  }

  const toggleMember = (userId) => {
    set('memberIds', form.memberIds.includes(userId)
      ? form.memberIds.filter(id => id !== userId)
      : [...form.memberIds, userId])
  }

  const handleDelete = () => {
    onDelete(form.id)
    navigate('groups')
  }

  const members    = form.memberIds.map(id => users.find(u => u.id === id)).filter(Boolean)
  const nonMembers = users.filter(u => !form.memberIds.includes(u.id))
  const searchedNonMembers = nonMembers.filter(u =>
    u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate('groups')}>
          <Icons.Back /> Back
        </Button>
        <div className="flex items-center gap-2">
          {canEdit && !editing && !isNew && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Icons.Edit /> Edit
              </Button>
              {!confirmDelete ? (
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                  <Icons.Trash /> Delete
                </Button>
              ) : (
                <>
                  <span className="text-xs text-red-400">Confirm?</span>
                  <Button variant="danger" size="sm" onClick={handleDelete}><Icons.Check /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}><Icons.X /></Button>
                </>
              )}
            </>
          )}
          {editing && (
            <>
              <Button variant="secondary" size="sm" onClick={handleCancel}><Icons.X /> Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!form.name.trim()}>
                <Icons.Check /> Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Group header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
          <Icons.Groups />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">{form.name || 'New Group'}</h1>
          {!isNew && <p className="text-xs font-mono text-gray-600 mt-0.5">{form.id}</p>}
        </div>
      </div>

      {/* Info fields */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        <Section label="Details">
          <div className="space-y-4">
            {!isNew && <Field label="ID" value={form.id} />}
            {editing ? (
              <Input label="Name" id="gname" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Group name" />
            ) : (
              <Field label="Name" value={form.name} />
            )}
            {editing ? (
              <Textarea label="Description" id="desc" value={form.description} onChange={e => set('description', e.target.value)} placeholder="What does this group do?" />
            ) : (
              <Field label="Description" value={form.description || '—'} />
            )}
          </div>
        </Section>

        {/* Members section */}
        <Section label={`Members (${form.memberIds.length})`}>
          <div className="space-y-3">
            {/* Current members */}
            {members.length === 0 ? (
              <p className="text-sm text-gray-600">No members yet.</p>
            ) : (
              <div className="space-y-1">
                {members.map(u => (
                  <div key={u.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-800/60 transition-colors">
                    <Avatar name={u.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <RoleBadge role={u.role} />
                    {editing && (
                      <button
                        onClick={() => toggleMember(u.id)}
                        aria-label={`Remove ${u.name}`}
                        className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                      >
                        <Icons.X />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add members (edit mode) */}
            {editing && nonMembers.length > 0 && (
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <p className="text-xs font-medium text-gray-500">Add members</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                    <Icons.Search />
                  </span>
                  <input
                    type="search"
                    placeholder="Search users to add…"
                    value={memberSearch}
                    onChange={e => setMemberSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="max-h-44 overflow-y-auto space-y-0.5">
                  {searchedNonMembers.length === 0 && (
                    <p className="text-xs text-gray-600 py-2">No users found.</p>
                  )}
                  {searchedNonMembers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => toggleMember(u.id)}
                      className="w-full flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-gray-700/60 transition-colors text-left"
                    >
                      <Avatar name={u.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">{u.name}</p>
                        <p className="text-xs text-gray-600 truncate">{u.email}</p>
                      </div>
                      <Icons.Plus />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="p-4 md:p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</h2>
      {children}
    </div>
  )
}
