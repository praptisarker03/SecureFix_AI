import { Link, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { Card, EmptyState, PageHeader, ProgressBar, SeverityCounts } from '../../components/ui/Elements'

const STEPS = [
  { id: 'extract', label: 'Extract', detail: 'Unpacking archive and filtering source files' },
  { id: 'semgrep', label: 'Semgrep', detail: 'Running static analysis rule packs' },
  { id: 'ai', label: 'AI analysis', detail: 'Gemini is explaining findings and drafting fixes' },
  { id: 'verify', label: 'Verify', detail: 'Re-scanning patched files and checking syntax' },
]

// Renders whatever the backend reports for the scan:
//   { status: 'running' | 'done' | 'failed', stage, progress (0-100), log: [], counts }
// TODO(backend): poll GET /scans/{id} every few seconds while status is 'running'.
export function ScanProgressPage() {
  const { scanId } = useParams()
  const { getScan, getProject } = useData()
  const scan = getScan(scanId)

  if (!scan) {
    return (
      <>
        <PageHeader title="Scan progress" back={{ to: '/dashboard', label: 'Dashboard' }} />
        <Card>
          <EmptyState icon="scan" title="Scan not found" action={<Link to="/scans/new" className="btn btn-primary">Start a new scan</Link>}>
            This scan does not exist, or scanning is not connected yet.
          </EmptyState>
        </Card>
      </>
    )
  }

  const project = getProject(scan.projectId)
  const done = scan.status === 'done'
  const failed = scan.status === 'failed'
  const activeIdx = done ? STEPS.length : Math.max(0, STEPS.findIndex((s) => s.id === scan.stage))
  const stepState = STEPS.map((_, i) => (i < activeIdx ? 'done' : i === activeIdx ? (failed ? 'failed' : 'active') : 'pending'))

  return (
    <>
      <PageHeader
        eyebrow={`Scan ${scan.id}`}
        title={done ? 'Scan complete' : failed ? 'Scan failed' : 'Scanning your code…'}
        subtitle={project ? `${project.name} · ${project.source}` : ''}
        back={{ to: '/dashboard', label: 'Dashboard' }}
      />
      <Card>
        <div className="progress-head">
          <strong>{done ? 'All steps finished' : STEPS[activeIdx]?.detail}</strong>
          <span className="muted">{Math.round(scan.progress || 0)}%</span>
        </div>
        <ProgressBar value={scan.progress || 0} tone={done ? 'good' : 'brand'} />
        <ol className="stepper">
          {STEPS.map((s, i) => (
            <li key={s.id} className={`step step-${stepState[i]}`}>
              <span className="step-dot">
                {stepState[i] === 'done' ? <Icon name="check" size={16} strokeWidth={2.6} /> : stepState[i] === 'active' ? <span className="spinner" /> : stepState[i] === 'failed' ? <Icon name="x" size={16} strokeWidth={2.6} /> : i + 1}
              </span>
              <div>
                <strong>{s.label}</strong>
                <span>{{ done: 'Done', active: 'In progress', failed: 'Failed', pending: 'Waiting' }[stepState[i]]}</span>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid-2">
        <Card title="Log">
          <pre className="log">
            {(scan.log || []).map((line, i) => <div key={i}>{line}</div>)}
            {!done && !failed && <div className="log-cursor">▍</div>}
          </pre>
        </Card>
        <Card title="Result">
          {done ? (
            <div className="result-box">
              <Icon name="checkCircle" size={36} className="tone-good" />
              <SeverityCounts counts={scan.counts} />
              <Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>
            </div>
          ) : (
            <p className="muted">{failed ? scan.error || 'The scan stopped with an error.' : 'Results appear here when the scan finishes.'}</p>
          )}
        </Card>
      </div>
    </>
  )
}
