import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon, Logo } from '../ui/Icons'

/* Signed-in app shell: sidebar + top bar.
   Items marked `soon` are shown in the menu but not built yet. */

const NAV = [
  { section: 'Overview', items: [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/projects', soon: true, label: 'Projects', icon: 'folder' },
    { to: '/scans/new', label: 'New scan', icon: 'upload' },
  ] },
  { section: 'Remediation', items: [
    { to: '/findings', soon: true, label: 'Findings', icon: 'bug' },
    { to: '/verifications', soon: true, label: 'Verification', icon: 'checkCircle' },
  ] },
  { section: 'Reports', items: [
    { to: '/report', soon: true, label: 'Security report', icon: 'report' },
    { to: '/history', soon: true, label: 'History & compare', icon: 'history' },
    { to: '/evaluation', soon: true, label: 'Evaluation', icon: 'flask' },
  ] },
]

export function AppLayout() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [lastPath, setLastPath] = useState(location.pathname)

  // Close the mobile drawer whenever the route changes
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setNavOpen(false)
  }

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''}`}>
      <aside className="sidebar">
        <Link to="/dashboard" className="sidebar-brand"><Logo light /></Link>
        <Link to="/scans/new" className="btn btn-primary btn-block sidebar-cta">
          <Icon name="plus" size={16} /> New scan
        </Link>
        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.section} className="nav-group">
              <div className="nav-section">{group.section}</div>
              {group.items.map((item) =>
                item.soon ? (
                  <span key={item.to} className="nav-item nav-item-soon" aria-disabled="true">
                    <Icon name={item.icon} size={18} />
                    {item.label}
                    <span className="soon-tag">Soon</span>
                  </span>
                ) : (
                  <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'} className="nav-item">
                    <Icon name={item.icon} size={18} />
                    {item.label}
                  </NavLink>
                )
              )}
            </div>
          ))}
          <div className="nav-group">
            <div className="nav-section">Account</div>
            <NavLink to="/settings" className="nav-item"><Icon name="settings" size={18} />Settings</NavLink>
            {role === 'admin' && <NavLink to="/admin" className="nav-item"><Icon name="key" size={18} />Admin</NavLink>}
          </div>
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{name.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-text">
            <strong>{name}</strong>
            <span>{user?.email}</span>
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Sign out" aria-label="Sign out">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
      <div className="sidebar-scrim" onClick={() => setNavOpen(false)} />
      <div className="app-main">
        <header className="topbar">
          <button className="icon-btn topbar-menu" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={20} />
          </button>
          <div className="topbar-search">
            <Icon name="search" size={16} />
            <input placeholder="Search findings (coming soon)" disabled />
          </div>
          <Link to="/" className="topbar-link"><Icon name="home" size={16} /> Back to website</Link>
        </header>
        {/* key restarts the enter animation on every route change */}
        <main className="app-content" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
