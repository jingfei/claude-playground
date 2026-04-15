import { useState } from 'react'
import { Avatar, RoleBadge, StatusBadge, Button, Input, Select, Field, Icons } from './ui.jsx'
import { ROLES, STATUSES } from '../data.js'

export default function UserDetail({ user, isNew, canEdit, navigate, onSave, onDelete }) {
  const [editing, setEditing] = useState(isNew)
  const [form, setForm]       = useState(
    user ?? { id: `u${Date.now()}`, name: '', email: '', role: 'viewer', status: 'active' }
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    onSave(form)
    setEditing(false)
    if (isNew) navigate('users')
  }

  const handleCancel = () => {
    if (isNew) { navigate('users'); return }
    setForm(user)
    setEditing(false)
  }

  const handleDelete = () => {
    onDelete(form.id)
    navigate('users')
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-6">
      {/* Back + actions bar */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => navigate('users')}>
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
              <Button size="sm" onClick={handleSave} disabled={!form.name.trim() || !form.email.trim()}>
                <Icons.Check /> Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Profile header */}
      {!isNew && (
        <div className="flex items-center gap-4">
          <Avatar name={form.name || '?'} size="lg" />
          <div>
            <h1 className="text-xl font-semibold text-white">{form.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={form.role} />
              <StatusBadge status={form.status} />
            </div>
          </div>
        </div>
      )}
      {isNew && (
        <div>
          <h1 className="text-xl font-semibold text-white">New User</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in the details below to add a new user.</p>
        </div>
      )}

      {/* Fields */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        <Section label="Identity">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isNew && <Field label="ID" value={form.id} />}
            {editing ? (
              <Input label="Name" id="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
            ) : (
              <Field label="Name" value={form.name} />
            )}
            {editing ? (
              <Input label="Email" id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@example.com" />
            ) : (
              <Field label="Email" value={form.email} />
            )}
          </div>
        </Section>

        <Section label="Access">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editing ? (
              <Select label="Role" id="role" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </Select>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Role</span>
                <RoleBadge role={form.role} />
              </div>
            )}
            {editing ? (
              <Select label="Status" id="status" value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </Select>
            ) : (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500">Status</span>
                <StatusBadge status={form.status} />
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
