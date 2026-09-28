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

function ProfileTab() {
  const { user, role, emailVerified, updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [saving, setSaving] = useState(false)

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const provider = user?.app_metadata?.provider || 'email'

  const changePassword = async (e) => {
    e.preventDefault()
    const err = validatePassword(password, user?.email)
    if (err) return setMsg({ text: err, type: 'error' })
    if (password !== confirm) return setMsg({ text: 'Passwords do not match.', type: 'error' })
    setSaving(true)
    try {
      await updatePassword(password)
      setPassword('')
      setConfirm('')
      setMsg({ text: 'Password updated.', type: 'success' })
    } catch (e2) {
      setMsg({ text: e2.message || 'Could not update password.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

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
      {provider === 'email' && (
        <Card title="Change password">
          <form onSubmit={changePassword} className="form narrow-form">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <div className="form-row">
              <label htmlFor="new-pw">New password</label>
              <input id="new-pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <PasswordStrength password={password} />
            </div>
            <div className="form-row">
              <label htmlFor="confirm-pw">Confirm new password</label>
              <input id="confirm-pw" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Update password'}</button>
          </form>
        </Card>
      )}
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
