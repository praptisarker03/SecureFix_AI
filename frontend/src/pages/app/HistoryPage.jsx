import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, EmptyState, PageHeader, SeverityBadge, SeverityCounts } from '../../components/ui/Elements'
import { SEVERITIES, SEVERITY_LABEL, formatDate, totalCount } from '../../lib/constants'

function Delta({ value }) {
  if (value === 0) return <span className="delta">±0</span>
  // Fewer findings is good, so a negative delta is shown as an improvement
  return (
    <span className={`delta ${value < 0 ? 'delta-good' : 'delta-bad'}`}>
      {value < 0 ? '↓' : '↑'} {value > 0 ? '+' : ''}{value}
    </span>
  )
}

function KeyList({ keys, empty, findings }) {
  if (keys.length === 0) return <p className="muted small">{empty}</p>
  return (
    <ul className="key-list">
      {keys.map((k) => {
        const f = findings.find((x) => x.key === k)
        return (
          <li key={k}>
            {f ? <SeverityBadge severity={f.severity} compact /> : <span className="sev sev-none">?</span>}
            {f ? <Link to={`/findings/${f.id}`}>{f.title}</Link> : <span className="mono">{k}</span>}
          </li>
        )
      })}
    </ul>
  )
}

export function HistoryPage() {
  const { scans, projects, findings } = useData()
  const completed = scans.filter((s) => !s.pending).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  const [a, setA] = useState(completed[1]?.id || completed[0]?.id)
  const [b, setB] = useState(completed[0]?.id)

  if (completed.length === 0) {
    return (
      <>
        <PageHeader title="Scan history" />
        <Card>
          <EmptyState icon="history" title="No scans yet" action={<Link to="/scans/new" className="btn btn-primary">Run your first scan</Link>}>
            Once you have two scans of a project, you can compare them here.
          </EmptyState>
        </Card>
      </>
    )
  }

  const scanA = completed.find((s) => s.id === a)
  const scanB = completed.find((s) => s.id === b)
  const keysA = new Set(scanA?.findingKeys || [])
  const keysB = new Set(scanB?.findingKeys || [])
  const resolved = [...keysA].filter((k) => !keysB.has(k))
  const introduced = [...keysB].filter((k) => !keysA.has(k))
  const persisting = [...keysB].filter((k) => keysA.has(k))
  const projectName = (id) => projects.find((p) => p.id === id)?.name || id

  return (
    <>
      <PageHeader title="Scan history & compare" subtitle="Pick two scans to see which findings were resolved, introduced or still open." />

      <Card title="Compare two scans">
        <div className="compare-pickers">
          <label>
            <span>Baseline</span>
            <select value={a} onChange={(e) => setA(e.target.value)}>
              {completed.map((s) => <option key={s.id} value={s.id}>{s.id} · {projectName(s.projectId)} · {formatDate(s.startedAt)}</option>)}
            </select>
          </label>
          <Icon name="arrowRight" size={20} className="muted" />
          <label>
            <span>Compare with</span>
            <select value={b} onChange={(e) => setB(e.target.value)}>
              {completed.map((s) => <option key={s.id} value={s.id}>{s.id} · {projectName(s.projectId)} · {formatDate(s.startedAt)}</option>)}
            </select>
          </label>
        </div>

        {scanA && scanB && (
          <>
            {scanA.projectId !== scanB.projectId && (
              <div className="alert alert-warn">These scans belong to different projects, so the finding comparison is not meaningful.</div>
            )}
            <div className="table-wrap">
              <table className="table compare-sev">
                <thead>
                  <tr><th>Severity</th><th>{scanA.id}</th><th>{scanB.id}</th><th>Change</th></tr>
                </thead>
                <tbody>
                  {SEVERITIES.map((s) => (
                    <tr key={s}>
                      <td><SeverityBadge severity={s} /></td>
                      <td>{scanA.counts[s]}</td>
                      <td>{scanB.counts[s]}</td>
                      <td><Delta value={scanB.counts[s] - scanA.counts[s]} /></td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>Total</td>
                    <td>{totalCount(scanA.counts)}</td>
                    <td>{totalCount(scanB.counts)}</td>
                    <td><Delta value={totalCount(scanB.counts) - totalCount(scanA.counts)} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="diff-cols">
              <div className="diff-col good">
                <h3><Icon name="checkCircle" size={18} /> Resolved <b>{resolved.length}</b></h3>
                <KeyList findings={findings} keys={resolved} empty="Nothing resolved between these scans." />
              </div>
              <div className="diff-col bad">
                <h3><Icon name="alert" size={18} /> New <b>{introduced.length}</b></h3>
                <KeyList findings={findings} keys={introduced} empty="No new findings." />
              </div>
              <div className="diff-col neutral">
                <h3><Icon name="history" size={18} /> Still open <b>{persisting.length}</b></h3>
                <KeyList findings={findings} keys={persisting} empty="None." />
              </div>
            </div>
          </>
        )}
      </Card>

      <Card title="All scans" pad={false}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Scan</th><th>Project</th><th>Date</th><th>Findings</th><th>Fixed / verified</th><th /></tr>
            </thead>
            <tbody>
              {completed.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.id}</td>
                  <td>{projectName(s.projectId)}</td>
                  <td className="muted">{formatDate(s.startedAt, true)}</td>
                  <td><SeverityCounts counts={s.counts} /></td>
                  <td>{s.fixed} / {s.verified}</td>
                  <td><Link to={`/report?scan=${s.id}`} className="card-link">Report <Icon name="arrowRight" size={14} /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted table-note">Severity letters: {SEVERITIES.map((s) => `${s[0].toUpperCase()} = ${SEVERITY_LABEL[s]}`).join(', ')}</p>
      </Card>
    </>
  )
}
