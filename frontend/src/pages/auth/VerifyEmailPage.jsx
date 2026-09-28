import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Shown to signed-in users whose email address is not confirmed yet.
export function VerifyEmailPage() {
  const { user, loading: authLoading, emailVerified, resendVerification, refreshUser, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loader-pulse"></div>
        <p>Verifying secure session...</p>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (emailVerified) return <Navigate to="/dashboard" replace />

  const run = async (action) => {
    setLoading(true)
    setMessage({ text: '', type: '' })
    try {
      await action()
    } catch (err) {
      setMessage({ text: err.message || 'Something went wrong.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () =>
    run(async () => {
      await resendVerification(user.email)
      setMessage({ text: 'Verification email sent. Please check your inbox.', type: 'success' })
    })

  const handleCheckAgain = () =>
    run(async () => {
      const refreshed = await refreshUser()
      if (!refreshed?.email_confirmed_at) {
        setMessage({ text: 'Your email is not verified yet.', type: 'info' })
      }
    })

  const handleSignOut = () =>
    run(async () => {
      await signOut()
      navigate('/login', { replace: true })
    })

  return (
    <div className="auth-card" id="verify-email-box">
      <div className="auth-header">
        <h2>Verify Your Email</h2>
        <p>
          We sent a confirmation link to <strong>{user.email}</strong>. Open it to activate your
          account, then come back here.
        </p>
      </div>

      {message.text && (
        <div className={`alert-message alert-${message.type}`} id="status-message">
          {message.text}
        </div>
      )}

      <div className="auth-form">
        <button type="button" id="btn-check-verified" className="btn-primary btn-block" onClick={handleCheckAgain} disabled={loading}>
          I&apos;ve Verified My Email
        </button>
        <button type="button" id="btn-resend-verification" className="btn-oauth btn-block" onClick={handleResend} disabled={loading}>
          Resend Verification Email
        </button>
      </div>

      <div className="auth-footer">
        <p>
          Wrong account?{' '}
          <button type="button" className="link-btn" onClick={handleSignOut} disabled={loading}>
            Sign Out
          </button>
        </p>
      </div>
    </div>
  )
}
