import { useData } from '../../context/DataContext'
import { Card, EmptyState, PageHeader, StatTile } from '../../components/ui/Elements'
import { Reveal } from '../../components/ui/Reveal'
import { EvalBars } from '../../components/ui/Charts'

const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0)

function EvaluationContent({ rows }) {
  const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
  const gt = sum('groundTruth')
  const found = sum('found')
  const fixed = sum('fixed')
  const verified = sum('verified')
  const fp = sum('falsePositives')
  const precision = pct(found - fp, found)

  return (
    <>
      <div className="kpi-grid">
        <StatTile label="Detection rate (recall)" value={`${pct(found, gt)}%`} sub={`${found} of ${gt} known vulnerabilities`} />
        <StatTile label="Precision" value={`${precision}%`} sub={`${fp} false positives`} />
        <StatTile label="Fix rate" value={`${pct(fixed, found)}%`} sub={`${fixed} of ${found} detected`} />
        <StatTile label="Verified fix rate" value={`${pct(verified, fixed)}%`} sub={`${verified} of ${fixed} fixes passed`} tone="good" />
      </div>

      <Card title="Found, fixed and verified per benchmark">
        <EvalBars rows={rows} />
      </Card>

      <Card title="Results table" pad={false}>
        <div className="table-wrap">
          <table className="table num-table">
            <thead>
              <tr>
                <th>Benchmark</th><th>Language</th><th>Known vulns</th><th>Found</th><th>Fixed</th><th>Verified</th><th>False pos.</th><th>Found %</th><th>Fixed %</th><th>Verified %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.target}>
                  <td><strong>{r.target}</strong><div className="small muted">{r.version}</div></td>
                  <td>{r.language}</td>
                  <td>{r.groundTruth}</td>
                  <td>{r.found}</td>
                  <td>{r.fixed}</td>
                  <td>{r.verified}</td>
                  <td>{r.falsePositives}</td>
                  <td><b>{pct(r.found, r.groundTruth)}%</b></td>
                  <td><b>{pct(r.fixed, r.found)}%</b></td>
                  <td><b>{pct(r.verified, r.fixed)}%</b></td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total</td><td /><td>{gt}</td><td>{found}</td><td>{fixed}</td><td>{verified}</td><td>{fp}</td>
                <td>{pct(found, gt)}%</td><td>{pct(fixed, found)}%</td><td>{pct(verified, fixed)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid-2">
        <Card title="Method">
          <ul className="plain-list">
            <li><b>Known vulns</b>: vulnerabilities documented by each benchmark (e.g. Juice Shop challenge list) that are detectable in source code.</li>
            <li><b>Found %</b> = found ÷ known vulns. <b>Fixed %</b> = fixes generated ÷ found. <b>Verified %</b> = fixes passing all three checks ÷ fixed.</li>
            <li><b>Precision</b> = (found − false positives) ÷ found.</li>
          </ul>
        </Card>
        <Card title="Threats to validity">
          <ul className="plain-list">
            <li>Benchmarks are intentionally vulnerable and may not reflect real codebases.</li>
            <li>Ground truth is limited to documented vulnerabilities.</li>
            <li>LLM output varies between runs; report the mean over several runs.</li>
          </ul>
        </Card>
      </div>
    </>
  )
}

function NoRuns() {
  return (
    <EmptyState icon="flask" title="No benchmark runs yet">
      Run SecureFix AI on OWASP Juice Shop, DVWA or another app with known vulnerabilities. Found, fixed and verified rates
      will appear here.
    </EmptyState>
  )
}

export function EvaluationPage() {
  const { evaluation } = useData()
  return (
    <>
      <PageHeader
        eyebrow="Thesis evaluation"
        title="Benchmark evaluation"
        subtitle="Detection, fix and verification rates on intentionally vulnerable applications."
      />
      {evaluation.length ? <EvaluationContent rows={evaluation} /> : <Card><NoRuns /></Card>}
    </>
  )
}

export function PublicEvaluationPage() {
  const { evaluation } = useData()
  return (
    <>
      <section className="hero hero-compact">
        <div className="hero-inner single">
          <Reveal as="p" className="hero-kicker">Evaluation</Reveal>
          <Reveal as="h1" delay={60}>Evaluation results</Reveal>
          <Reveal as="p" delay={120} className="hero-lead">How SecureFix AI performs on applications with known vulnerabilities.</Reveal>
        </div>
      </section>
      <section className="section section-tint">
        <div className="section-inner app-surface">
          {evaluation.length ? <EvaluationContent rows={evaluation} /> : <Card><NoRuns /></Card>}
        </div>
      </section>
    </>
  )
}
