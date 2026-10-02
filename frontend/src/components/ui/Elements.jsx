import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import { SEVERITIES, SEVERITY_LABEL } from '../../lib/constants'

const STATUS_META = {
  open: { label: 'Open', icon: 'alert' },
  fixed: { label: 'Fix applied', icon: 'sparkles' },
  verified: { label: 'Verified', icon: 'checkCircle' },
  false_positive: { label: 'False positive', icon: 'x' },
}

// Severity always shows a letter + label, never color alone
export function SeverityBadge({ severity, compact = false }) {
  return (
    <span className={`sev sev-${severity}`} title={SEVERITY_LABEL[severity]}>
      <span className="sev-letter">{severity[0].toUpperCase()}</span>
      {!compact && SEVERITY_LABEL[severity]}
    </span>
  )
}

export function SeverityCounts({ counts }) {
  return (
    <span className="sev-counts">
      {SEVERITIES.map((s) => (
        <span key={s} className={`sev-count sev-count-${s}`} title={`${counts?.[s] || 0} ${SEVERITY_LABEL[s]}`}>
          <span className="sev-letter">{s[0].toUpperCase()}</span>
          {counts?.[s] || 0}
        </span>
      ))}
    </span>
  )
}

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, icon: 'info' }
  return (
    <span className={`status status-${status}`}>
      <Icon name={meta.icon} size={13} strokeWidth={2.2} />
      {meta.label}
    </span>
  )
}

export function PageHeader({ eyebrow, title, subtitle, actions, back }) {
  return (
    <div className="page-header">
      <div>
        {back && (
          <Link to={back.to} className="back-link">
            <Icon name="arrowLeft" size={14} /> {back.label}
          </Link>
        )}
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  )
}

export function Card({ title, action, children, className = '', pad = true }) {
  return (
    <section className={`card ${pad ? '' : 'card-flush'} ${className}`}>
      {(title || action) && (
        <header className="card-head">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function StatTile({ label, value, sub, tone, icon }) {
  return (
    <div className="stat-tile">
      <div className="stat-label">
        {icon && <span className="stat-icon"><Icon name={icon} size={15} /></span>}
        {label}
      </div>
      <div className={`stat-value ${tone ? `tone-${tone}` : ''}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

export function EmptyState({ icon = 'folder', title, children, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

export function HealthScore({ value }) {
  if (value == null) return <span className="muted">Scanning…</span>
  const tone = value >= 85 ? 'good' : value >= 65 ? 'warn' : 'bad'
  return (
    <span className={`health health-${tone}`}>
      <span className="health-bar">
        <span style={{ width: `${value}%` }} />
      </span>
      <strong>{value}</strong>
    </span>
  )
}

export function ProgressBar({ value, tone = 'brand' }) {
  return (
    <div className={`progress progress-${tone}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function Confidence({ value }) {
  const pct = Math.round(value * 100)
  const label = pct >= 85 ? 'High' : pct >= 60 ? 'Medium' : 'Low'
  return (
    <span className="confidence" title={`AI confidence ${pct}%`}>
      <span className="confidence-dots">
        {[0.33, 0.66, 0.9].map((t) => (
          <span key={t} className={value >= t ? 'on' : ''} />
        ))}
      </span>
      {label} · {pct}%
    </span>
  )
}
