import { Icons } from './ui.jsx'

const NAV_ITEMS = [
  { screen: 'users',  label: 'Users',  Icon: Icons.Users  },
  { screen: 'groups', label: 'Groups', Icon: Icons.Groups },
]

function NavItem({ screen, label, Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? 'bg-violet-600/20 text-violet-300'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
    >
      <Icon />
      {label}
    </button>
  )
}

/** Desktop sidebar */
export function Sidebar({ screen, navigate, viewerRole, setViewerRole, currentUser }) {
  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-gray-800">
        <span className="text-base font-bold text-white tracking-tight">TeamOS</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.screen}
            {...item}
            active={screen === item.screen}
            onClick={() => navigate(item.screen)}
          />
        ))}
      </nav>

      {/* Current user + role toggle */}
      <div className="p-4 border-t border-gray-800 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {currentUser.name.split(' ').map(w => w[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-200 truncate">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
          </div>
        </div>
        <RoleToggle viewerRole={viewerRole} setViewerRole={setViewerRole} />
      </div>
    </aside>
  )
}

/** Mobile top bar */
export function MobileTopBar({ screen, currentUser }) {
  const label = NAV_ITEMS.find(i => i.screen === screen)?.label ?? 'TeamOS'
  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-20">
      <span className="font-bold text-white tracking-tight">TeamOS</span>
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold text-white">
        {currentUser.name.split(' ').map(w => w[0]).join('')}
      </div>
    </header>
  )
}

/** Mobile bottom navigation */
export function MobileBottomNav({ screen, navigate, viewerRole, setViewerRole }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex items-stretch z-20">
      {NAV_ITEMS.map(({ screen: s, label, Icon }) => (
        <button
          key={s}
          onClick={() => navigate(s)}
          aria-current={screen === s ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors
            ${screen === s ? 'text-violet-300' : 'text-gray-500'}`}
        >
          <Icon />
          {label}
        </button>
      ))}
      {/* role toggle in bottom bar */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
        <button
          onClick={() => setViewerRole(r => r === 'admin' ? 'viewer' : 'admin')}
          className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors
            ${viewerRole === 'admin' ? 'bg-violet-600/25 text-violet-300' : 'bg-gray-700 text-gray-400'}`}
        >
          {viewerRole === 'admin' ? 'Admin' : 'Viewer'}
        </button>
        <span className="text-xs text-gray-600">Role</span>
      </div>
    </nav>
  )
}

function RoleToggle({ viewerRole, setViewerRole }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-600">Viewing as</p>
      <div className="flex gap-1 bg-gray-800 p-0.5 rounded-lg">
        {['admin','viewer'].map(r => (
          <button
            key={r}
            onClick={() => setViewerRole(r)}
            className={`flex-1 py-1 rounded-md text-xs font-medium capitalize transition-colors
              ${viewerRole === r ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}
