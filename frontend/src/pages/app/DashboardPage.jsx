import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { apiFetch } from '../../lib/api'
import { Icon } from '../../components/ui/Icons'
import { Card, HealthScore, PageHeader, SeverityBadge, SeverityCounts, StatTile, StatusBadge } from '../../components/ui/Elements'
import { SeverityBar, SeverityTrendChart } from '../../components/ui/Charts'
import { SEVERITIES, formatDate, timeAgo, totalCount } from '../../lib/constants'

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
    const steps = [
      ['Upload your code', 'A .zip of the project and its language.', true],
      ['Review findings', 'Severity, CWE, OWASP category and location.'],
      ['Apply an AI fix', 'Read the explanation and the proposed diff.'],
      ['Check verification', 'Three checks decide whether the fix holds.'],
    ]
    return (
      <>
        <PageHeader title={`Welcome, ${name}`} subtitle="Nothing scanned yet. Here is how to get going." />
        <div className="onboard">
          <div className="onboard-main">
            <div className="onboard-drop" aria-hidden="true">
              <span className="onboard-file"><Icon name="zip" size={22} /></span>
            </div>
            <h2>Scan your first project</h2>
            <p>Upload a .zip of your source code. SecureFix AI scans it with Semgrep, suggests fixes with Gemini and verifies each fix before you use it.</p>
            <Link to="/scans/new" className="btn btn-primary"><Icon name="upload" size={16} /> Upload code</Link>
          </div>
          <ol className="onboard-list">
            {steps.map(([title, text, current], i) => (
              <li key={title} className={current ? 'current' : ''}>
                <span className="onboard-n">{i + 1}</span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="kpi-grid">
          <StatTile label="Open findings" value="—" sub="No scans yet" />
          <StatTile label="Fix success rate" value="—" sub="No fixes yet" />
          <StatTile label="Projects" value="0" />
          <StatTile label="Critical findings" value="—" />
        </div>
      </>
    )
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
