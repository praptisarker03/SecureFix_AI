import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'
import { SeverityBadge, SeverityCounts } from '../../components/ui/Elements'
import { LANGUAGES } from '../../lib/constants'
import { runQuickCheck, SAMPLE_CODE } from '../../lib/quickCheck'

const CATEGORIES = [
  { id: 'all', label: 'All services' },
  { id: 'detect', label: 'Detect' },
  { id: 'fix', label: 'Fix' },
  { id: 'verify', label: 'Verify' },
  { id: 'report', label: 'Reporting' },
  { id: 'platform', label: 'Platform' },
]

const SERVICES = [
  {
    category: 'detect',
    icon: 'upload',
    title: 'Secure code upload',
    text: 'Upload a project as a .zip. It is size-checked, unpacked in an isolated temp folder and deleted after the scan.',
    points: ['Zip-slip protection', 'Source files only', 'Nothing kept after scanning'],
  },
  {
    category: 'detect',
    icon: 'scan',
    title: 'Static analysis with Semgrep',
    text: 'Language-specific Semgrep rule packs find injection, crypto, auth and configuration issues in your code.',
    points: ['Rule ID, file and line', 'Severity for every hit', 'Framework rules (Flask, Express, Spring…)'],
  },
  {
    category: 'detect',
    icon: 'shield',
    title: 'CWE & OWASP mapping',
    text: 'Every finding carries its CWE ID and OWASP Top 10 (2021) category, matching how security teams report.',
    points: ['CWE from rule metadata', 'OWASP Top 10 grouping', 'Standard severity levels'],
  },
  {
    category: 'fix',
    icon: 'sparkles',
    title: 'AI explanation & attack scenario',
    text: 'Gemini explains each finding in plain language and describes how an attacker could actually exploit it.',
    points: ['Plain-language explanation', 'Realistic attack scenario', 'Confidence score'],
  },
  {
    category: 'fix',
    icon: 'code',
    title: 'AI patch generation',
    text: 'A minimal patch is generated for each finding and shown as a side-by-side diff you can review before applying.',
    points: ['Minimal, focused changes', 'Reviewable diff view', 'Only ±20 lines sent to the AI'],
  },
  {
    category: 'verify',
    icon: 'checkCircle',
    title: 'Three-check fix verification',
    text: 'Each patch is re-scanned and compiled. It is marked verified only when all three checks pass.',
    points: ['Finding gone', 'No new issues introduced', 'Syntax still valid'],
  },
  {
    category: 'verify',
    icon: 'filter',
    title: 'Findings & false-positive rules',
    text: 'Filter findings by severity and status, mark false positives, and ignore a path or rule in future scans.',
    points: ['Severity and status filters', 'Mark false positives', 'Reusable ignore rules'],
  },
  {
    category: 'report',
    icon: 'report',
    title: 'PDF security report',
    text: 'A printable report with summary, severity breakdown, fix rates and the stated limitations of the scan.',
    points: ['Executive summary', 'Severity breakdown', 'Export to PDF'],
  },
  {
    category: 'report',
    icon: 'history',
    title: 'Scan history & compare',
    text: 'Compare any two scans of a project to see what was resolved, what is new and what is still open.',
    points: ['Resolved vs new findings', 'Per-project timeline', 'Progress over time'],
  },
  {
    category: 'report',
    icon: 'flask',
    title: 'Evaluation dashboard',
    text: 'Measure detection and fix quality against benchmark projects, with precision and fix-rate charts.',
    points: ['Benchmark runs', 'Fix success rate', 'Results you can cite'],
  },
  {
    category: 'platform',
    icon: 'book',
    title: 'Multi-language support',
    text: 'Python, JavaScript / Node.js, TypeScript, PHP and Java, each with its own rule packs and syntax checker.',
    points: ['5 languages', 'Per-language rule packs', 'Native syntax checks'],
  },
  {
    category: 'platform',
    icon: 'lock',
    title: 'Secure accounts & roles',
    text: 'Email verification, strong password policy and role-based access with row-level security in the database.',
    points: ['Verified email required', 'Admin and user roles', 'Supabase row-level security'],
  },
]

function ServiceGrid() {
  const [category, setCategory] = useState('all')
  const shown = category === 'all' ? SERVICES : SERVICES.filter((s) => s.category === category)

  return (
    <>
      <div className="service-tabs" role="tablist">
        {CATEGORIES.map((c) => {
          const count = c.id === 'all' ? SERVICES.length : SERVICES.filter((s) => s.category === c.id).length
          return (
            <button key={c.id} role="tab" aria-selected={category === c.id} className={category === c.id ? 'active' : ''} onClick={() => setCategory(c.id)}>
              {c.label} <b>{count}</b>
            </button>
          )
        })}
      </div>
      <div className="service-grid">
        {shown.map((s) => (
          <article key={s.title} className="service-card">
            <span className="service-icon"><Icon name={s.icon} size={20} /></span>
            <span className="service-cat">{CATEGORIES.find((c) => c.id === s.category).label}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
            <ul>
              {s.points.map((p) => (
                <li key={p}><Icon name="check" size={14} strokeWidth={2.4} /> {p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </>
  )
}

function QuickCheck() {
  const [code, setCode] = useState('')
  const [results, setResults] = useState(null)

  const counts = results?.reduce((acc, f) => ({ ...acc, [f.severity]: (acc[f.severity] || 0) + 1 }), {})

  function check() {
    setResults(runQuickCheck(code))
  }

  function loadSample() {
    setCode(SAMPLE_CODE)
    setResults(null)
  }

  function clear() {
    setCode('')
    setResults(null)
  }

  return (
    <div className="qc">
      <div className="qc-input">
        <div className="qc-bar">
          <span><Icon name="code" size={15} /> Paste your code</span>
          <div>
            <button className="btn btn-ghost btn-sm" onClick={loadSample}>Load example</button>
            <button className="btn btn-ghost btn-sm" onClick={clear} disabled={!code}>Clear</button>
          </div>
        </div>
        <textarea
          className="qc-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={'# Python, JavaScript, TypeScript, PHP or Java\nquery = "SELECT * FROM users WHERE id = " + user_id'}
          spellCheck={false}
          aria-label="Code to check"
        />
        <button className="btn btn-primary btn-block" onClick={check} disabled={!code.trim()}>
          <Icon name="scan" size={16} /> Check code
        </button>
      </div>

      <div className="qc-results" aria-live="polite">
        {results === null && (
          <div className="qc-empty">
            <Icon name="shield" size={28} />
            <p>Paste some code, or load the example, then press <b>Check code</b>.</p>
          </div>
        )}
        {results?.length === 0 && (
          <div className="qc-empty qc-clean">
            <Icon name="checkCircle" size={28} />
            <p><b>No common issues found.</b><br />This quick check only looks for simple patterns. Run a full scan for real coverage.</p>
          </div>
        )}
        {results?.length > 0 && (
          <>
            <div className="qc-summary">
              <b>{results.length} issue{results.length > 1 ? 's' : ''} found</b>
              <SeverityCounts counts={counts} />
            </div>
            <ul className="qc-list">
              {results.map((f) => (
                <li key={f.key} className="qc-item">
                  <div className="qc-item-head">
                    <SeverityBadge severity={f.severity} />
                    <strong>{f.title}</strong>
                    <span className="tag">Line {f.line}</span>
                  </div>
                  <code className="qc-snippet">{f.snippet}</code>
                  <p className="qc-fix"><Icon name="sparkles" size={14} /> {f.fix}</p>
                  <div className="qc-meta"><span className="tag">{f.cwe}</span><span className="tag">{f.owasp}</span></div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}

export function ServicesPage() {
  return (
    <>
      <section className="hero hero-compact">
        <div className="hero-inner single">
          <Reveal as="p" className="hero-kicker">Services</Reveal>
          <Reveal as="h1" delay={60}>Everything SecureFix AI does</Reveal>
          <Reveal as="p" delay={120} className="hero-lead">
            From upload to a verified fix: detection, AI-generated patches, verification and reporting in one place.
          </Reveal>
          <Reveal delay={180} as="nav" className="doc-toc">
            {[['#services', 'All services'], ['#quick-check', 'Quick code check'], ['#languages', 'Languages']].map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section-white" id="services">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">What we offer</p>
            <h2>Our services</h2>
            <p>Pick a category to see the services for that stage of the Detect, Fix, Verify loop.</p>
          </Reveal>
          <ServiceGrid />
        </div>
      </section>

      <section className="section section-tint" id="quick-check">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">Try it now</p>
            <h2>Quick code check</h2>
            <p>
              Paste a snippet to spot common vulnerable patterns instantly. This runs in your browser, so your code is
              not uploaded. It is a simplified preview of what a full Semgrep scan finds.
            </p>
          </Reveal>
          <Reveal>
            <QuickCheck />
          </Reveal>
        </div>
      </section>

      <section className="section section-white" id="languages">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">Coverage</p>
            <h2>Supported languages</h2>
          </Reveal>
          <Reveal className="table-wrap boxed">
            <table className="table">
              <thead>
                <tr><th>Language</th><th>Semgrep rule packs</th><th>Syntax check</th></tr>
              </thead>
              <tbody>
                {LANGUAGES.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.label}</strong></td>
                    <td><code>{l.rules}</code></td>
                    <td><code>{l.check}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      <section className="cta-band">
        <div className="section-inner cta-inner">
          <Reveal as="h2">Run a full scan on your project</Reveal>
          <Reveal delay={80} className="hero-actions center">
            <Link to="/signup" className="btn btn-primary btn-lg">Create account</Link>
            <Link to="/how-it-works" className="btn btn-outline-light btn-lg">See how it works</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
