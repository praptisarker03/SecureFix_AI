import { Navigate, useLocation } from 'react-router-dom'
import { LoadingScreen } from '../ui/Elements'
import { useAuth } from '../../context/AuthContext'

// Checks, in order: logged in -> email verified -> allowed role.
// This only protects the UI; the backend and Supabase RLS protect the data.
export function ProtectedRoute({ children, roles }) {
  const { user, loading, role, emailVerified, isPasswordRecovery } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
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
