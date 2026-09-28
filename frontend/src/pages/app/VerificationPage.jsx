import { Link, useParams } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { Icon } from '../../components/ui/Icons'
import { DiffView } from '../../components/ui/DiffView'
import { Card, EmptyState, PageHeader, SeverityBadge, StatTile } from '../../components/ui/Elements'
import { SEVERITIES, SEVERITY_LABEL, totalCount } from '../../lib/constants'

const CHECKS = [
  { key: 'findingGone', title: 'Finding gone', question: 'Does the original rule still match?' },
  { key: 'noNewIssues', title: 'No new issues', question: 'Did the patch introduce new findings?' },
  { key: 'syntaxValid', title: 'Syntax valid', question: 'Does the patched file still compile?' },
]

function ScanColumn({ label, counts, tone }) {
  return (
    <div className={`scan-col ${tone}`}>
      <div className="scan-col-head">{label}</div>
      <div className="scan-col-total">{totalCount(counts)}<span>findings in file</span></div>
      {SEVERITIES.map((s) => (
        <div key={s} className="scan-col-row">
          <SeverityBadge severity={s} compact /> {SEVERITY_LABEL[s]}
          <b>{counts[s]}</b>
        </div>
      ))}
    </div>
  )
}

export function VerificationPage() {
  const { id } = useParams()
  const { getFinding } = useData()
  const f = getFinding(id)

  if (!f || !f.verification) {
    return (
      <Card>
        <EmptyState
          icon="checkCircle"
          title="Not verified yet"
          action={<Link to={f ? `/findings/${f.id}` : '/findings'} className="btn btn-primary">{f ? 'Open finding' : 'Back to findings'}</Link>}
        >
          Apply the AI fix on the finding page to run verification.
        </EmptyState>
      </Card>
    )
  }

  const v = f.verification
  const passedCount = CHECKS.filter((c) => v[c.key].ok).length
  const passed = v.status === 'passed'

  return (
    <>
      <PageHeader
        back={{ to: `/findings/${f.id}`, label: f.id }}
        eyebrow="Verification result"
        title={f.title}
        subtitle={<span className="mono">{f.file}:{f.line}</span>}
      />

      <div className={`verdict ${passed ? 'verdict-pass' : 'verdict-fail'}`}>
        <Icon name={passed ? 'checkCircle' : 'xCircle'} size={40} />
        <div>
          <h2>{passed ? 'Fix verified' : 'Fix failed verification'}</h2>
          <p>
            {passedCount} of 3 checks passed in {v.durationSec} s.{' '}
            {passed ? 'The vulnerability is no longer detected and the code still compiles.' : 'Review the failed check below before applying this fix.'}
          </p>
        </div>
        {!passed && <Link to={`/findings/${f.id}`} className="btn btn-outline">Regenerate fix</Link>}
      </div>

      <div className="checks-grid">
        {CHECKS.map((c, i) => {
          const r = v[c.key]
          return (
            <div key={c.key} className={`vcheck ${r.ok ? 'ok' : 'fail'}`}>
              <div className="vcheck-top">
                <span className="vcheck-n">Check {i + 1}</span>
                <span className="vcheck-mark">
                  <Icon name={r.ok ? 'check' : 'x'} size={20} strokeWidth={2.8} />
                  {r.ok ? 'Pass' : 'Fail'}
                </span>
              </div>
              <h3>{c.title}</h3>
              <p className="muted small">{c.question}</p>
              <p>{r.detail}</p>
            </div>
          )
        })}
      </div>

      <Card title="Before vs after scan">
        <div className="scan-compare">
          <ScanColumn label="Before fix" counts={v.before} tone="before" />
          <div className="scan-arrow"><Icon name="arrowRight" size={24} /></div>
          <ScanColumn label="After fix" counts={v.after} tone={passed ? 'after' : 'before'} />
          <div className="scan-delta">
            <StatTile
              label="Change"
              value={`${totalCount(v.after) - totalCount(v.before) > 0 ? '+' : ''}${totalCount(v.after) - totalCount(v.before)}`}
              sub="findings in the patched file"
              tone={totalCount(v.after) < totalCount(v.before) ? 'good' : totalCount(v.after) > totalCount(v.before) ? 'bad' : undefined}
            />
          </div>
        </div>
      </Card>

      <Card title="Applied patch">
        <DiffView before={f.before} after={f.after} file={f.file} />
      </Card>
    </>
  )
}

// Overview of every verification run (sidebar "Verification")
export function VerificationsListPage() {
  const { findings } = useData()
  const runs = findings.filter((f) => f.verification)
  const passed = runs.filter((f) => f.verification.status === 'passed').length

  return (
    <>
      <PageHeader title="Verification" subtitle="Every AI fix is re-scanned. A fix passes only if all three checks pass." />
      {runs.length === 0 ? (
        <Card>
          <EmptyState icon="checkCircle" title="No verifications yet" action={<Link to="/findings" className="btn btn-primary">Go to findings</Link>}>
            Apply an AI fix to a finding to run its first verification.
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="kpi-grid">
            <StatTile label="Verification runs" value={runs.length} />
            <StatTile label="Passed" value={passed} tone="good" />
            <StatTile label="Failed" value={runs.length - passed} tone={runs.length - passed ? 'bad' : undefined} />
            <StatTile label="Pass rate" value={`${Math.round((passed / runs.length) * 100)}%`} />
          </div>
          <Card pad={false}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>Finding</th><th>Finding gone</th><th>No new issues</th><th>Syntax valid</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {runs.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <Link to={`/findings/${f.id}/verification`} className="finding-link">{f.title}</Link>
                        <div className="mono small muted">{f.file}</div>
                      </td>
                      {CHECKS.map((c) => (
                        <td key={c.key}>
                          <span className={`tick ${f.verification[c.key].ok ? 'ok' : 'fail'}`}>
                            <Icon name={f.verification[c.key].ok ? 'check' : 'x'} size={16} strokeWidth={2.6} />
                            {f.verification[c.key].ok ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      ))}
                      <td>
                        <span className={`pill ${f.verification.status === 'passed' ? 'pill-good' : 'pill-bad'}`}>
                          {f.verification.status === 'passed' ? 'Verified' : 'Failed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </>
  )
}
