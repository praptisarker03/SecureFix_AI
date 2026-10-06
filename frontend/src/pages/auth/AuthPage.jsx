import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PasswordStrength } from '../../components/auth/PasswordStrength'
import { PasswordInput } from '../../components/auth/PasswordInput'
import { Icon } from '../../components/ui/Icons'
import { validatePassword } from '../../lib/passwordPolicy'

const CONFIG_MISSING_MESSAGE = {
  text: 'Supabase credentials missing! Please configure frontend/.env file.',
  type: 'error',
}

function isEmailNotConfirmedError(err) {
  return err?.code === 'email_not_confirmed' || /email not confirmed/i.test(err?.message || '')
}

const MODE_PATHS = { login: '/login', signup: '/signup', forgot: '/forgot-password' }

const MODE_TEXT = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to review findings and verify AI fixes.',
    submit: 'Log in',
  },
  signup: {
    title: 'Create your free account',
    subtitle: 'Scan your first project in under a minute. No credit card needed.',
    submit: 'Create account',
  },
  forgot: {
    title: 'Forgot your password?',
    subtitle: 'No worries. Enter the email you signed up with and we will send you a link to set a new password.',
    submit: 'Send reset link',
  },
}

export function AuthPage({ mode = 'login' }) {
  const {
    user,
    loading: authLoading,
    isSupabaseConfigured,
    signIn,
    signUp,
    signInWithGoogle,
    resendVerification,
    resetPassword,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  // Email that still needs confirming; shows the "resend" button when set
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('')

  if (!authLoading && user) {
    return <Navigate to={redirectTo} replace />
  }

  const clearMessage = () => setMessage({ text: '', type: '' })

  const switchMode = (nextMode) => {
    navigate(MODE_PATHS[nextMode], { state: location.state })
    clearMessage()
    setPendingVerificationEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  const checkConfigured = () => {
    if (!isSupabaseConfigured) setMessage(CONFIG_MISSING_MESSAGE)
    return isSupabaseConfigured
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!checkConfigured()) return

    setLoading(true)
    clearMessage()
    setPendingVerificationEmail('')

    try {
      await signIn(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (isEmailNotConfirmedError(err)) {
        setPendingVerificationEmail(email)
        setMessage({ text: 'Please verify your email address before signing in.', type: 'error' })
      } else {
        setMessage({ text: err.message || 'Login failed. Please verify credentials.', type: 'error' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!checkConfigured()) return

    const passwordError = validatePassword(password, email)
    if (passwordError) {
      setMessage({ text: passwordError, type: 'error' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' })
      return
    }

    setLoading(true)
    clearMessage()

    try {
      const data = await signUp(email, password, fullName)
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        // Same message whether or not the email is already registered,
        // so the form cannot be used to discover which emails have accounts.
        setPendingVerificationEmail(email)
        setMessage({
          text: 'Check your inbox for a confirmation link to activate your account.',
          type: 'success',
        })
      }
    } catch (err) {
      setMessage({ text: err.message || 'Registration failed.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!checkConfigured()) return

    setLoading(true)
    clearMessage()

    try {
      await resetPassword(email)
      setMessage({
        text: 'If an account exists for this email, a password reset link has been sent.',
        type: 'success',
      })
    } catch (err) {
      setMessage({ text: err.message || 'Could not send reset link.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setLoading(true)
    try {
      await resendVerification(pendingVerificationEmail)
      setMessage({ text: 'Verification email sent. Please check your inbox.', type: 'success' })
    } catch (err) {
      setMessage({ text: err.message || 'Could not resend verification email.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async () => {
    if (!checkConfigured()) return

    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      setMessage({ text: err.message || 'Google OAuth failed.', type: 'error' })
      setLoading(false)
    }
  }

  const submitHandler = {
    login: handleLogin,
    signup: handleSignUp,
    forgot: handleForgotPassword,
  }[mode]

  return (
    <div className="auth-card">
      <div className="auth-header">
        {mode === 'forgot' && (
          <span className="auth-badge"><Icon name="key" size={22} /></span>
        )}
        <h2>{MODE_TEXT[mode].title}</h2>
        <p>{MODE_TEXT[mode].subtitle}</p>
      </div>

      {mode !== 'forgot' && (
        <div className="tab-container" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            role="tab"
            aria-selected={mode === 'signup'}
            className={`tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
        </div>
      )}

      {message.text && !(mode === 'forgot' && message.type === 'success') && (
        <div className={`alert-message alert-${message.type}`}>
          {message.text}
          {pendingVerificationEmail && (
            <button
              type="button"
              className="link-btn"
              onClick={handleResendVerification}
              disabled={loading}
            >
              Resend verification email
            </button>
          )}
        </div>
      )}

      {/* Reset link sent: show next steps instead of the form */}
      {mode === 'forgot' && message.type === 'success' ? (
        <div className="reset-sent">
          <span className="reset-sent-icon"><Icon name="mail" size={26} /></span>
          <h3>Check your inbox</h3>
          <p>If an account exists for <b>{email}</b>, a reset link is on its way. It may take a minute, and check your spam folder too.</p>
          <ol>
            <li>Open the email from SecureFix AI</li>
            <li>Click the reset link</li>
            <li>Choose a new password</li>
          </ol>
          <button type="button" className="btn btn-outline btn-block" onClick={clearMessage}>
            Use a different email
          </button>
        </div>
      ) : (
      <form onSubmit={submitHandler} className="auth-form">
        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="input-fullname">Full Name</label>
            <input
              id="input-fullname"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="input-email">Email Address</label>
          <input
            id="input-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode !== 'forgot' && (
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="input-password">Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  className="link-btn link-btn-small"
                  onClick={() => switchMode('forgot')}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <PasswordInput
              id="input-password"
              placeholder="••••••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === 'signup' && <PasswordStrength password={password} />}
          </div>
        )}

        {mode === 'signup' && (
          <div className="form-group">
            <label htmlFor="input-confirm-password">Confirm Password</label>
            <PasswordInput
              id="input-confirm-password"
              placeholder="••••••••••••"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        <button
          type="submit"
          className="btn-primary btn-block"
          disabled={loading}
        >
          {loading ? <span className="spinner-text">Processing...</span> : MODE_TEXT[mode].submit}
        </button>
      </form>
      )}

      {mode !== 'forgot' && (
        <>
          <div className="divider">
            <span>OR CONTINUE WITH</span>
          </div>

          <button
            type="button"
            className="btn-oauth btn-block"
            onClick={handleOAuth}
            disabled={loading}
          >
            <svg className="google-icon" width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>
        </>
      )}

      <div className="auth-footer">
        <p>
          {mode === 'login' && (
            <>
              Don&apos;t have an account?{' '}
              <button type="button" className="link-btn" onClick={() => switchMode('signup')}>
                Sign Up here
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => switchMode('login')}>
                Sign In here
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <button type="button" className="link-btn back-link-btn" onClick={() => switchMode('login')}>
              <Icon name="arrowLeft" size={14} /> Back to sign in
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
