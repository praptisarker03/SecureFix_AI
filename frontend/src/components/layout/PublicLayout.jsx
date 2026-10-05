import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Icon, Logo } from '../ui/Icons'

/* Public site (landing, docs): top nav + footer.
   Links without `to` are planned pages, shown greyed out. */

function PublicNav() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const links = [
    { to: '/#features', label: 'Platform' },
    { to: '/how-it-works', label: 'How it works' },
    { label: 'Services' },
    { label: 'Results' },
  ]
  return (
    <header className="pub-nav">
      <div className="pub-nav-inner">
        <Link to="/" className="pub-brand" onClick={() => setOpen(false)}>
          <Logo light />
        </Link>
        <nav className={`pub-links ${open ? 'open' : ''}`}>
          {links.map((l) =>
            l.to ? (
              <Link key={l.label} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ) : (
              <span key={l.label} className="pub-soon" aria-disabled="true">
                {l.label}
              </span>
            )
          )}
          <div className="pub-cta-mobile">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost-light">Log in</Link>
                <Link to="/signup" className="btn btn-primary">Sign up free</Link>
              </>
            )}
          </div>
        </nav>
        <div className="pub-cta">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="pub-login">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up free</Link>
            </>
          )}
        </div>
        <button className="pub-menu" aria-label="Menu" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'x' : 'menu'} size={22} />
        </button>
      </div>
    </header>
  )
}

function PublicFooter() {
  const cols = [
    { title: 'Product', links: [['/how-it-works', 'How it works'], [null, 'Services'], ['/#try-it', 'Try before sign up'], [null, 'Evaluation'], ['/signup', 'Get started']] },
    { title: 'Resources', links: [['/how-it-works#languages', 'Supported languages'], ['/how-it-works#verification', 'Verification logic'], ['/how-it-works#privacy', 'Data & privacy'], ['/how-it-works#faq', 'FAQ']] },
    { title: 'Standards', links: [['/how-it-works#standards', 'OWASP Top 10'], ['/how-it-works#standards', 'CWE mapping'], ['/how-it-works#pipeline', 'Semgrep rules'], ['/how-it-works#pipeline', 'Gemini prompts']] },
  ]
  return (
    <footer className="pub-footer">
      <div className="pub-footer-inner">
        <div className="pub-footer-brand">
          <Logo light />
          <p>Detect, fix and verify vulnerabilities in your source code with static analysis and AI, in one loop.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title} className="pub-footer-col">
            <h4>{c.title}</h4>
            {c.links.map(([to, label]) =>
              to ? <Link key={label} to={to}>{label}</Link> : <span key={label} className="pub-soon">{label}</span>
            )}
          </div>
        ))}
      </div>
      <div className="pub-footer-bottom">
        <span>© {new Date().getFullYear()} SecureFix AI</span>
        <span>Built with React, FastAPI, Semgrep & Gemini</span>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  return (
    <div className="pub">
      <PublicNav />
      <Outlet />
      <PublicFooter />
    </div>
  )
}
