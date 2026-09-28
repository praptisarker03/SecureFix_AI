import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <div className="auth-card" id="unauthorized-box">
      <div className="auth-header">
        <h2>Access Denied</h2>
        <p>Your account does not have permission to view this page.</p>
      </div>
      <Link to="/dashboard" className="btn-primary btn-block btn-link">
        Back to Dashboard
      </Link>
    </div>
  )
}
