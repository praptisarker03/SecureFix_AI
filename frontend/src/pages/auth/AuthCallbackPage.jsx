import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { LoadingScreen } from '../../components/ui/Elements'
import { useAuth } from '../../context/AuthContext'

// Supabase puts link errors (expired / already used) in the hash or query string
function readLinkError() {
  const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
  const error = params.get('error_description') || params.get('error')
  return error ? error.replace(/\+/g, ' ') : ''
}

// Landing page for the signup confirmation link and Google sign-in.
// Supabase signs the user in from the URL, then we send them into the app.
export function AuthCallbackPage() {
  const { user, loading, emailVerified } = useAuth()
  const [linkError] = useState(readLinkError)

  if (linkError) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <h2>Link Not Valid</h2>
          <p>{linkError}. Sign in to request a new confirmation email.</p>
        </div>
        <Link to="/login" className="btn-primary btn-block btn-link">
          Back to Sign In
        </Link>
      </div>
    )
  }

  if (loading) return <LoadingScreen text="Signing you in..." />
  if (!user) return <Navigate to="/login" replace />
  if (!emailVerified) return <Navigate to="/verify-email" replace />
  return <Navigate to="/dashboard" replace />
}
