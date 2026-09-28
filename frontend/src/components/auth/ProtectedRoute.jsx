import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Guards a route in three steps:
//   1. authentication - a logged-in user is required
//   2. verification   - the user's email must be confirmed
//   3. authorization  - optional `roles` list the user's role must be in
// This only controls the UI. Real data must be protected by the backend
// (JWT checks in FastAPI) and by Row Level Security in Supabase.
export function ProtectedRoute({ children, roles }) {
  const { user, loading, role, emailVerified, isPasswordRecovery } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-screen" id="protected-route-loader">
        <div className="loader-pulse"></div>
        <p>Verifying secure session...</p>
      </div>
    )
  }

  if (!user) {
    // Redirect to /login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isPasswordRecovery) {
    // A password-reset link signed the user in; make them set a new password first
    return <Navigate to="/reset-password" replace />
  }

  if (!emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  if (roles && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
