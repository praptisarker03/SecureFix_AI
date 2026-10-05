import { Link } from 'react-router-dom'
import { Icon } from './Icons'
import { SEVERITIES, SEVERITY_LABEL } from '../../lib/constants'

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

export function ProgressBar({ value, tone = 'brand' }) {
  return (
    <div className={`progress progress-${tone}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function LoadingScreen({ text = 'Verifying secure session...' }) {
  return (
    <div className="loading-screen">
      <div className="loader-pulse" />
      <p>{text}</p>
    </div>
  )
}
