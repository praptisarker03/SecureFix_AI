import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LoadingScreen } from '../../components/ui/Elements'
import { useAuth } from '../../context/AuthContext'
import { PasswordStrength } from '../../components/auth/PasswordStrength'
import { validatePassword } from '../../lib/passwordPolicy'

// Opened from the password-reset email. Supabase signs the user in from the
// link, then this page lets them choose a new password.
export function ResetPasswordPage() {
  const { user, loading: authLoading, updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  if (authLoading) {
    return <LoadingScreen text="Checking reset link..." />
  }

  if (!user) {
    return (
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Link Invalid</h2>
          <p>This password reset link is invalid or has expired.</p>
        </div>
        <Link to="/login" className="btn-primary btn-block btn-link">
          Back to Sign In
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const passwordError = validatePassword(password, user.email)
    if (passwordError) {
      setMessage({ text: passwordError, type: 'error' })
      return
    }
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      await updatePassword(password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setMessage({ text: err.message || 'Could not update password.', type: 'error' })
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>Choose a New Password</h2>
        <p>Setting a new password for {user.email}</p>
      </div>

      {message.text && (
        <div className={`alert-message alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="input-new-password">New Password</label>
          <input
            id="input-new-password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordStrength password={password} />
        </div>

        <div className="form-group">
          <label htmlFor="input-confirm-new-password">Confirm New Password</label>
          <input
            id="input-confirm-new-password"
            type="password"
            placeholder="••••••••••••"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-block" disabled={loading}>
          {loading ? <span className="spinner-text">Processing...</span> : 'Update Password'}
        </button>
      </form>
    </div>
  )
}
