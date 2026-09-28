import { Link, useSearchParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, EmptyState, PageHeader, SeverityBadge, StatTile, StatusBadge } from '../../components/ui/Elements'
import { Donut, SeverityBar, SeverityTrendChart } from '../../components/ui/Charts'
import { SEVERITIES, SEVERITY_LABEL, formatDate, totalCount } from '../../lib/constants'

const LIMITATIONS = [
  'Static analysis only: runtime behaviour, configuration and business-logic flaws are not detected.',
  'Coverage depends on the Semgrep rule packs for each language; vulnerabilities without a rule are missed.',
  'AI-generated fixes can be wrong. "Verified" means the three automated checks passed, not that the code is proven secure.',
  'The "no new issues" check only re-scans the patched file, not the whole project.',
  'Syntax checks confirm the file compiles; they do not run the project\'s test suite.',
]

export function ReportPage() {
  const { scans, projects, findings } = useData()
  const [params, setParams] = useSearchParams()
  const completed = scans.filter((s) => !s.pending)

  if (completed.length === 0) {
    return (
      <>
        <PageHeader title="Security report" />
        <Card>
          <EmptyState icon="report" title="No report yet" action={<Link to="/scans/new" className="btn btn-primary">Run a scan</Link>}>
            A report is generated for every completed scan.
          </EmptyState>
        </Card>
      </>
    )
  }

  const scan = completed.find((s) => s.id === params.get('scan')) || completed[completed.length - 1]
  const project = projects.find((p) => p.id === scan.projectId)
  const projectScans = completed.filter((s) => s.projectId === scan.projectId)
  const projectFindings = findings.filter((f) => f.projectId === scan.projectId)
  const total = totalCount(scan.counts)
  const fixRate = total ? Math.round((scan.fixed / (total + scan.fixed)) * 100) : 0
  const verifyRate = scan.fixed ? Math.round((scan.verified / scan.fixed) * 100) : 0
  const byOwasp = Object.entries(
    projectFindings.reduce((acc, f) => ({ ...acc, [f.owasp]: (acc[f.owasp] || 0) + 1 }), {})
  ).sort((a, b) => b[1] - a[1])
  const maxOwasp = Math.max(1, ...byOwasp.map(([, n]) => n))

  return (
    <div className="report">
      <PageHeader
        eyebrow="Security report"
        title={project?.name || scan.projectId}
        subtitle={`Scan ${scan.id} · ${formatDate(scan.startedAt, true)} · ${Math.round(scan.durationSec / 60)} min ${scan.durationSec % 60} s`}
        actions={
          <>
            <select className="no-print" value={scan.id} onChange={(e) => setParams({ scan: e.target.value })} aria-label="Choose scan">
              {completed.map((s) => (
                <option key={s.id} value={s.id}>{s.id} · {projects.find((p) => p.id === s.projectId)?.name} · {formatDate(s.startedAt)}</option>
              ))}
            </select>
            <button className="btn btn-primary no-print" onClick={() => window.print()}><Icon name="download" size={16} /> Export PDF</button>
          </>
        }
      />

      <Card title="Executive summary">
        <p className="summary-text">
          This scan found <b>{total} open findings</b> in <b>{project?.name}</b>, including{' '}
          <b>{scan.counts.critical} critical</b> and <b>{scan.counts.high} high</b> severity issues. SecureFix AI
          proposed fixes for {scan.fixed} findings, of which <b>{scan.verified} passed all three verification checks</b>.
          {scan.counts.critical > 0 ? ' Critical findings should be fixed before the next release.' : ' No critical findings remain.'}
        </p>
        <div className="kpi-grid inner">
          <StatTile label="Open findings" value={total} />
          <StatTile label="Critical + high" value={scan.counts.critical + scan.counts.high} tone={scan.counts.critical ? 'bad' : undefined} />
          <StatTile label="Fixes applied" value={scan.fixed} />
          <StatTile label="Fixes verified" value={scan.verified} tone="good" />
        </div>
      </Card>

      <div className="grid-2-1">
        <Card title="Severity trend for this project">
          {projectScans.length > 1 ? <SeverityTrendChart scans={projectScans} height={220} /> : <p className="muted">Only one scan so far.</p>}
        </Card>
        <Card title="Remediation">
          <div className="donuts">
            <Donut value={fixRate} label="fixed" />
            <Donut value={verifyRate} label="verified" />
          </div>
          <p className="small muted center">Fixed = share of all findings with a fix applied. Verified = share of applied fixes that passed.</p>
        </Card>
      </div>

      <div className="grid-2">
        <Card title="Findings by severity">
          <SeverityBar counts={scan.counts} />
        </Card>
        <Card title="Findings by OWASP Top 10">
          {byOwasp.length ? (
            <div className="hbars">
              {byOwasp.map(([name, n]) => (
                <div key={name} className="hbar">
                  <span className="hbar-label">{name}</span>
                  <span className="hbar-track"><span style={{ width: `${(n / maxOwasp) * 100}%` }} /></span>
                  <b>{n}</b>
                </div>
              ))}
            </div>
          ) : <p className="muted">No categorised findings.</p>}
        </Card>
      </div>

      <Card title="Findings" pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Severity</th><th>Finding</th><th>CWE</th><th>Status</th></tr></thead>
            <tbody>
              {projectFindings.length === 0 && <tr><td colSpan={4} className="muted">No finding details stored for this scan.</td></tr>}
              {[...projectFindings].sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity)).map((f) => (
                <tr key={f.id}>
                  <td><SeverityBadge severity={f.severity} /></td>
                  <td><strong>{f.title}</strong><div className="mono small muted">{f.file}:{f.line}</div></td>
                  <td>{f.cwe}</td>
                  <td><StatusBadge status={f.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Limitations">
        <ul className="limits">
          {LIMITATIONS.map((l) => (
            <li key={l}><Icon name="info" size={16} /> {l}</li>
          ))}
        </ul>
      </Card>

      <p className="print-only small muted">Generated by SecureFix AI on {formatDate(new Date().toISOString(), true)}. Severity legend: {SEVERITIES.map((s) => SEVERITY_LABEL[s]).join(', ')}.</p>
    </div>
  )
}
