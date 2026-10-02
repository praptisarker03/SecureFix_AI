import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, PageHeader, ProgressBar } from '../../components/ui/Elements'
import { PasswordStrength } from '../../components/auth/PasswordStrength'
import { validatePassword } from '../../lib/passwordPolicy'

const TABS = [
  ['profile', 'Profile', 'user'],
  ['usage', 'API usage', 'zap'],
  ['integrations', 'Integrations', 'github'],
  ['rules', 'False-positive rules', 'filter'],
]

function PasswordField({ id, label, value, onChange, autoComplete, children }) {
  const [show, setShow] = useState(false)
  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <div className="pw-input">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} required />
        <button type="button" className="pw-toggle" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'}>
          <Icon name={show ? 'x' : 'eye'} size={16} />
        </button>
      </div>
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

function ProfileTab() {
  const { user, role, emailVerified } = useAuth()
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const provider = user?.app_metadata?.provider || 'email'

  return (
    <div className="stack">
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
  )
}

function UsageTab() {
  return (
    <div className="stack">
      <div className="grid-2">
        <Card title="Gemini requests">
          <div className="usage-num"><b>0</b> this month</div>
          <ProgressBar value={0} />
        </Card>
        <Card title="Scans">
          <div className="usage-num"><b>0</b> this month</div>
          <ProgressBar value={0} />
        </Card>
      </div>
      <p className="small muted">Usage is counted once scanning is connected.</p>
    </div>
  )
}

function IntegrationsTab() {
  return (
    <Card title="GitHub">
      <div className="integration">
        <span className="integration-icon"><Icon name="github" size={26} /></span>
        <div>
          <strong>Not connected</strong>
          <p className="muted small">Import repositories directly instead of uploading a .zip, and open pull requests with verified fixes.</p>
        </div>
        <button className="btn btn-outline" disabled title="Coming soon">Coming soon</button>
      </div>
    </Card>
  )
}

function RulesTab() {
  const { fpRules, addFpRule, removeFpRule } = useData()
  const [pattern, setPattern] = useState('')
  const [rule, setRule] = useState('')
  const [reason, setReason] = useState('')

  const add = (e) => {
    e.preventDefault()
    if (!pattern.trim()) return
    addFpRule({ pattern: pattern.trim(), rule: rule.trim() || '*', reason: reason.trim() })
    setPattern('')
    setRule('')
    setReason('')
  }

  return (
    <Card title="False-positive rules" pad={false}>
      <p className="card-intro muted small">Findings matching a rule will be hidden in future scans. Use glob patterns for paths and a Semgrep rule ID (or *) for rules.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Path pattern</th><th>Rule ID</th><th>Reason</th><th /></tr></thead>
          <tbody>
            {fpRules.length === 0 && <tr><td colSpan={4} className="muted">No rules yet.</td></tr>}
            {fpRules.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.pattern}</td>
                <td className="mono">{r.rule}</td>
                <td>{r.reason || <span className="muted">—</span>}</td>
                <td><button className="icon-btn" onClick={() => removeFpRule(r.id)} aria-label="Delete rule"><Icon name="trash" size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="rule-form" onSubmit={add}>
        <input placeholder="Path, e.g. tests/**" value={pattern} onChange={(e) => setPattern(e.target.value)} aria-label="Path pattern" />
        <input placeholder="Rule ID or *" value={rule} onChange={(e) => setRule(e.target.value)} aria-label="Rule ID" />
        <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
        <button className="btn btn-primary"><Icon name="plus" size={16} /> Add rule</button>
      </form>
    </Card>
  )
}

export function SettingsPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some(([id]) => id === params.get('tab')) ? params.get('tab') : 'profile'
  const Panel = { profile: ProfileTab, usage: UsageTab, integrations: IntegrationsTab, rules: RulesTab }[tab]

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, usage, integrations and scan rules." />
      <div className="settings">
        <nav className="settings-nav">
          {TABS.map(([id, label, icon]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setParams({ tab: id })}>
              <Icon name={icon} size={16} /> {label}
            </button>
          ))}
        </nav>
        <div className="settings-body">
          <Panel />
        </div>
      </div>
    </>
  )
}
