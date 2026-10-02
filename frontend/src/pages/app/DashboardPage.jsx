import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { apiFetch } from '../../lib/api'
import { Icon } from '../../components/ui/Icons'
import { Card, HealthScore, PageHeader, ProgressBar, SeverityBadge, SeverityCounts, StatTile, StatusBadge } from '../../components/ui/Elements'
import { SeverityBar, SeverityTrendChart } from '../../components/ui/Charts'
import { SEVERITIES, formatDate, timeAgo, totalCount } from '../../lib/constants'

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

const SETUP_STEPS = [
  { title: 'Create your account', text: 'Signed in with a verified email.', done: true },
  { title: 'Run your first scan', text: 'Upload a .zip of your project and pick its language.', action: { to: '/scans/new', label: 'Upload code' } },
  { title: 'Review findings', text: 'Severity, CWE, OWASP category and the exact line.' },
  { title: 'Verify an AI fix', text: 'Apply a patch and let the three checks decide if it holds.' },
]

const QUICK_ACTIONS = [
  { to: '/scans/new', icon: 'upload', title: 'Scan a project', text: 'Upload a .zip and get findings in minutes.' },
  { to: '/#try-it', icon: 'code', title: 'Quick code check', text: 'Paste a snippet and spot risky patterns instantly.' },
  { to: '/settings?tab=rules', icon: 'filter', title: 'Set scan rules', text: 'Ignore paths or rules you know are safe.' },
  { to: '/how-it-works', icon: 'book', title: 'How it works', text: 'The pipeline and what "verified" means.' },
]

// First-run dashboard: no projects yet, so guide the user to a first scan
function EmptyDashboard({ name }) {
  const done = SETUP_STEPS.filter((s) => s.done).length
  const current = SETUP_STEPS.findIndex((s) => !s.done)
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <section className="dash-hero">
        <div className="dash-hero-copy">
          <span className="dash-date">{today}</span>
          <h1>{greeting()}, {name}</h1>
          <p>Your workspace is ready. Scan a project to see its security posture, AI-generated fixes and verification results here.</p>
          <div className="dash-hero-actions">
            <Link to="/scans/new" className="btn btn-primary btn-glow"><Icon name="upload" size={16} /> Start your first scan</Link>
            <Link to="/#try-it" className="btn btn-outline-light"><Icon name="code" size={16} /> Try a quick check</Link>
          </div>
        </div>
        <div className="dash-hero-art" aria-hidden="true">
          <span className="dash-orbit" />
          <span className="dash-shield"><Icon name="shield" size={44} strokeWidth={1.5} /></span>
        </div>
      </section>

      <div className="dash-grid">
        <Card title="Getting started" action={<span className="pill pill-info">{done} of {SETUP_STEPS.length} done</span>}>
          <ProgressBar value={(done / SETUP_STEPS.length) * 100} />
          <ol className="setup-list">
            {SETUP_STEPS.map((step, i) => (
              <li key={step.title} className={step.done ? 'done' : i === current ? 'current' : ''}>
                <span className="setup-mark">{step.done ? <Icon name="check" size={14} strokeWidth={3} /> : i + 1}</span>
                <div className="setup-text">
                  <strong>{step.title}</strong>
                  <span>{step.text}</span>
                </div>
                {i === current && step.action && (
                  <Link to={step.action.to} className="btn btn-primary btn-sm">{step.action.label} <Icon name="arrowRight" size={14} /></Link>
                )}
              </li>
            ))}
          </ol>
        </Card>
        <Card title="Security score">
          <div className="score">
            <svg viewBox="0 0 120 120" className="score-ring" aria-hidden="true">
              <circle cx="60" cy="60" r="50" />
            </svg>
            <div className="score-value"><b>—</b><span>No data yet</span></div>
          </div>
          <p className="muted small score-note">Your score appears after the first scan, based on open findings and their severity.</p>
        </Card>
      </div>

      <div className="quick-actions">
        {QUICK_ACTIONS.map((a) => (
          <Link key={a.title} to={a.to} className="quick-action">
            <span className="quick-icon"><Icon name={a.icon} size={20} /></span>
            <strong>{a.title}</strong>
            <span>{a.text}</span>
            <Icon name="arrowRight" size={16} className="quick-arrow" />
          </Link>
        ))}
      </div>

      <div className="kpi-grid">
        <StatTile icon="bug" label="Open findings" value="—" sub="No scans yet" />
        <StatTile icon="checkCircle" label="Fix success rate" value="—" sub="No fixes yet" />
        <StatTile icon="folder" label="Projects" value="0" sub="Add one with a scan" />
        <StatTile icon="alert" label="Critical findings" value="—" sub="Nothing to fix yet" />
      </div>
    </>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { projects, scans, findings } = useData()
  // Result of asking the backend to verify our token: 'checking' | 'verified' | 'failed'
  const [backendCheck, setBackendCheck] = useState('checking')

  useEffect(() => {
    let active = true
    apiFetch('/auth/me')
      .then(() => active && setBackendCheck('verified'))
      .catch(() => active && setBackendCheck('failed'))
    return () => {
      active = false
    }
  }, [])

  const name = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  if (projects.length === 0) {
    return <EmptyDashboard name={name} />
  }

  const totals = SEVERITIES.reduce((acc, s) => ({ ...acc, [s]: projects.reduce((sum, p) => sum + p.counts[s], 0) }), {})
  const totalFindings = totalCount(totals)
  const attempted = findings.filter((f) => f.verification)
  const passed = attempted.filter((f) => f.verification.status === 'passed')
  const fixRate = attempted.length ? Math.round((passed.length / attempted.length) * 100) : 0
  // Trend for the project scanned most recently
  const latestProject = [...projects].sort((a, b) => new Date(b.lastScanAt) - new Date(a.lastScanAt))[0]
  const trendScans = scans.filter((s) => s.projectId === latestProject?.id && !s.pending)
  const recentScans = [...scans].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 5)
  const topFindings = findings
    .filter((f) => f.status === 'open')
    .sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity))
    .slice(0, 5)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${name}`}
        subtitle="Here is the security posture across your projects."
        actions={
          <>
            <span className={`api-status api-${backendCheck}`} title="Backend token check">
              <span className="dot" /> API {backendCheck === 'checking' ? 'checking…' : backendCheck === 'verified' ? 'connected' : 'offline'}
            </span>
            <Link to="/scans/new" className="btn btn-primary"><Icon name="plus" size={16} /> New scan</Link>
          </>
        }
      />

      <div className="kpi-grid">
        <StatTile label="Total open findings" value={totalFindings} sub={`${totals.critical} critical · ${totals.high} high`} />
        <StatTile label="Fix success rate" value={`${fixRate}%`} sub={`${passed.length} of ${attempted.length} fixes passed verification`} tone="good" />
        <StatTile label="Projects" value={projects.length} sub={`${scans.length} scans run`} />
        <StatTile label="Critical findings" value={totals.critical} sub="Fix these first" tone={totals.critical ? 'bad' : 'good'} />
      </div>

      <div className="grid-2-1">
        <Card title="Severity trend" action={<span className="muted small">{latestProject?.name} · last {trendScans.length} scans</span>}>
          {trendScans.length > 1 ? <SeverityTrendChart scans={trendScans} /> : <p className="muted">Run at least two scans to see a trend.</p>}
        </Card>
        <Card title="Open findings by severity">
          <SeverityBar counts={totals} />
          <Link to="/findings" className="card-link">View all findings <Icon name="arrowRight" size={14} /></Link>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Recent scans" action={<Link to="/history" className="card-link">History</Link>} pad={false}>
          <ul className="list">
            {recentScans.map((s) => {
              const project = projects.find((p) => p.id === s.projectId)
              return (
                <li key={s.id}>
                  <Link to={s.pending ? `/scans/${s.id}/progress` : `/report?scan=${s.id}`} className="list-row">
                    <span className="list-icon"><Icon name="scan" size={16} /></span>
                    <div className="list-main">
                      <strong>{project?.name || s.projectId}</strong>
                      <span>{s.id} · {timeAgo(s.startedAt)}</span>
                    </div>
                    {s.pending ? <span className="pill pill-info">Running</span> : <SeverityCounts counts={s.counts} />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>
        <Card title="Top open findings" action={<Link to="/findings?status=open" className="card-link">All open</Link>} pad={false}>
          <ul className="list">
            {topFindings.map((f) => (
              <li key={f.id}>
                <Link to={`/findings/${f.id}`} className="list-row">
                  <SeverityBadge severity={f.severity} compact />
                  <div className="list-main">
                    <strong>{f.title}</strong>
                    <span className="mono">{f.file}:{f.line}</span>
                  </div>
                  <StatusBadge status={f.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Projects" action={<Link to="/projects" className="card-link">Manage</Link>} pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Project</th><th>Last scan</th><th>Findings</th><th>Health</th></tr>
            </thead>
            <tbody>
              {projects.slice(0, 4).map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td className="muted">{formatDate(p.lastScanAt)}</td>
                  <td><SeverityCounts counts={p.counts} /></td>
                  <td><HealthScore value={p.health} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
