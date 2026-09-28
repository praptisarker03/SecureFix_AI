import { Link, Outlet } from 'react-router-dom'
import { ConfigBanner } from '../auth/ConfigBanner'
import { Logo } from '../ui/Icons'
import { LoopDiagram } from '../illustrations/LoopDiagram'

/* Auth pages: form on one side, the SecureFix loop on the other */

export function AuthLayout() {
  return (
    <div className="auth-split">
      <div className="auth-side-form">
        <Link to="/" className="auth-logo"><Logo /></Link>
        <ConfigBanner />
        <div className="auth-form-wrap">
          <Outlet />
        </div>
        <p className="auth-legal">Protected by Supabase Auth</p>
      </div>
      <aside className="auth-side-preview">
        <div className="auth-preview-copy">
          <p className="hero-kicker">The SecureFix loop</p>
          <h2>Nothing is marked fixed until it scans clean.</h2>
        </div>
        <LoopDiagram />
        <ul className="auth-facts">
          <li><b>Semgrep</b> rule packs</li>
          <li><b>Gemini</b> patches</li>
          <li><b>3-check</b> verification</li>
        </ul>
      </aside>
    </div>
  )
}
