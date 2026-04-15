import { useState } from 'react'
import { seedUsers, seedGroups, CURRENT_USER } from './data.js'
import { Sidebar, MobileTopBar, MobileBottomNav } from './components/Nav.jsx'
import UsersList   from './components/UsersList.jsx'
import UserDetail  from './components/UserDetail.jsx'
import GroupsList  from './components/GroupsList.jsx'
import GroupDetail from './components/GroupDetail.jsx'

export default function App() {
  const [users,      setUsers]      = useState(seedUsers)
  const [groups,     setGroups]     = useState(seedGroups)
  const [nav,        setNav]        = useState({ screen: 'users' })
  const [viewerRole, setViewerRole] = useState('admin')

  const canEdit = viewerRole === 'admin'

  // navigate(screen, id?, opts?)
  const navigate = (screen, id = null, opts = {}) => setNav({ screen, id, ...opts })

  // ── user mutations ──────────────────────────────────────────────────────────
  const saveUser = (updated) => {
    setUsers(prev =>
      prev.find(u => u.id === updated.id)
        ? prev.map(u => u.id === updated.id ? updated : u)
        : [...prev, updated]
    )
  }

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setGroups(prev => prev.map(g => ({ ...g, memberIds: g.memberIds.filter(mid => mid !== id) })))
  }

  // ── group mutations ─────────────────────────────────────────────────────────
  const saveGroup = (updated) => {
    setGroups(prev =>
      prev.find(g => g.id === updated.id)
        ? prev.map(g => g.id === updated.id ? updated : g)
        : [...prev, updated]
    )
  }

  const deleteGroup = (id) => setGroups(prev => prev.filter(g => g.id !== id))

  // ── resolve current screen ──────────────────────────────────────────────────
  const renderScreen = () => {
    const { screen, id, editing } = nav

    if (screen === 'user') {
      const user  = id ? users.find(u => u.id === id) : null
      const isNew = !id
      if (!isNew && !user) { navigate('users'); return null }
      return (
        <UserDetail
          key={id ?? 'new'}
          user={user}
          isNew={isNew}
          canEdit={canEdit}
          navigate={navigate}
          onSave={saveUser}
          onDelete={deleteUser}
        />
      )
    }

    if (screen === 'group') {
      const group = id ? groups.find(g => g.id === id) : null
      const isNew = !id
      if (!isNew && !group) { navigate('groups'); return null }
      return (
        <GroupDetail
          key={id ?? 'new'}
          group={group}
          users={users}
          isNew={isNew}
          canEdit={canEdit}
          navigate={navigate}
          onSave={saveGroup}
          onDelete={deleteGroup}
        />
      )
    }

    if (screen === 'groups') {
      return <GroupsList groups={groups} users={users} canEdit={canEdit} navigate={navigate} />
    }

    return <UsersList users={users} canEdit={canEdit} navigate={navigate} />
  }

  const topLevel = nav.screen === 'users' || nav.screen === 'groups' ? nav.screen : null

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        screen={topLevel ?? nav.screen}
        navigate={navigate}
        viewerRole={viewerRole}
        setViewerRole={setViewerRole}
        currentUser={CURRENT_USER}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MobileTopBar screen={nav.screen} currentUser={CURRENT_USER} />

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {renderScreen()}
        </main>

        <MobileBottomNav
          screen={topLevel ?? nav.screen}
          navigate={navigate}
          viewerRole={viewerRole}
          setViewerRole={setViewerRole}
        />
      </div>
    </div>
  )
}
