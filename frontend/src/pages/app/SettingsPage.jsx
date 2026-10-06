import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Icon } from '../../components/ui/Icons'
import { Card, PageHeader } from '../../components/ui/Elements'
import { PasswordStrength } from '../../components/auth/PasswordStrength'
import { PasswordInput } from '../../components/auth/PasswordInput'
import { validatePassword } from '../../lib/passwordPolicy'

function PasswordField({ id, label, value, onChange, autoComplete, children }) {
  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <PasswordInput id={id} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} required />
      {children}
    </div>
  )
}

function SecurityCard() {
  const { user, signIn, updatePassword, resetPassword } = useAuth()
  const provider = user?.app_metadata?.provider || 'email'
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [busy, setBusy] = useState('')

  const close = () => {
    setOpen(false)
    setCurrent('')
    setPassword('')
    setConfirm('')
  }

  const changePassword = async (e) => {
    e.preventDefault()
    const err = validatePassword(password, user?.email)
    if (err) return setMsg({ text: err, type: 'error' })
    if (password !== confirm) return setMsg({ text: 'New passwords do not match.', type: 'error' })
    if (password === current) return setMsg({ text: 'Choose a password different from your current one.', type: 'error' })
    setBusy('save')
    setMsg({ text: '', type: '' })
    try {
      // Confirm it is really the account owner before changing the password
      try {
        await signIn(user.email, current)
      } catch {
        throw new Error('Your current password is incorrect.')
      }
      await updatePassword(password)
      close()
      setMsg({ text: 'Your password has been changed.', type: 'success' })
    } catch (e2) {
      setMsg({ text: e2.message || 'Could not update password.', type: 'error' })
    } finally {
      setBusy('')
    }
  }

  const sendReset = async () => {
    setBusy('reset')
    try {
      await resetPassword(user.email)
      close()
      setMsg({ text: `A reset link has been sent to ${user.email}.`, type: 'success' })
    } catch (e2) {
      setMsg({ text: e2.message || 'Could not send the reset email.', type: 'error' })
    } finally {
      setBusy('')
    }
  }

  return (
    <Card title={<><Icon name="lock" size={16} /> Password & security</>}>
      {msg.text && <div className={`alert alert-${msg.type}`} role="status">{msg.text}</div>}
      {provider !== 'email' ? (
        <div className="sec-row">
          <span className="sec-icon"><Icon name="key" size={18} /></span>
          <div className="sec-text">
            <strong>Signed in with {provider}</strong>
            <span>Your password is managed by {provider}, so there is nothing to change here.</span>
          </div>
        </div>
      ) : (
        <>
          <div className="sec-row">
            <span className="sec-icon"><Icon name="key" size={18} /></span>
            <div className="sec-text">
              <strong>Password</strong>
              <span className="sec-dots">••••••••••••</span>
            </div>
            {!open && (
              <button className="btn btn-outline" onClick={() => { setOpen(true); setMsg({ text: '', type: '' }) }}>
                Change password
              </button>
            )}
          </div>
          {open && (
            <form onSubmit={changePassword} className="form sec-form">
              <PasswordField id="current-pw" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
              <PasswordField id="new-pw" label="New password" value={password} onChange={setPassword} autoComplete="new-password">
                <PasswordStrength password={password} />
              </PasswordField>
              <PasswordField id="confirm-pw" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
              <div className="sec-actions">
                <button className="btn btn-primary" disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Save new password'}</button>
                <button type="button" className="btn btn-ghost" onClick={close} disabled={!!busy}>Cancel</button>
              </div>
              <p className="sec-forgot">
                <Icon name="mail" size={14} /> Forgot your current password?{' '}
                <button type="button" className="link-btn" onClick={sendReset} disabled={!!busy}>
                  {busy === 'reset' ? 'Sending…' : 'Email me a reset link'}
                </button>
              </p>
            </form>
          )}
        </>
      )}
    </Card>
  )
}

export function SettingsPage() {
  const { user, role, emailVerified } = useAuth()
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const provider = user?.app_metadata?.provider || 'email'

  return (
    <>
      <PageHeader title="Settings" subtitle="Your profile and password." />
      <div className="settings-body stack">
        <Card title="Profile">
          <div className="profile-row">
            <div className="avatar avatar-lg">{(name || user?.email || 'U').charAt(0).toUpperCase()}</div>
            <dl className="details">
              <dt>Name</dt><dd>{name || '—'}</dd>
              <dt>Email</dt><dd>{user?.email} {emailVerified && <span className="pill pill-good">Verified</span>}</dd>
              <dt>Sign-in method</dt><dd>{provider}</dd>
              <dt>Role</dt><dd>{role}</dd>
              <dt>Member since</dt><dd>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</dd>
            </dl>
          </div>
        </Card>
        <SecurityCard />
      </div>
    </>
  )
}
