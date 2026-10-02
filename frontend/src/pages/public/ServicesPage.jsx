import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'
import { QuickCheck } from '../../components/ui/QuickCheck'
import { LANGUAGES } from '../../lib/constants'

const CATEGORIES = [
  { id: 'all', label: 'All services' },
  { id: 'detect', label: 'Detect' },
  { id: 'fix', label: 'Fix' },
  { id: 'verify', label: 'Verify' },
  { id: 'report', label: 'Reporting' },
  { id: 'platform', label: 'Platform' },
]

// Where each service stands today; shown as a badge so the page stays honest
const STATUS = {
  live: { label: 'Available', className: 'status-live' },
  ui: { label: 'UI ready', className: 'status-ui' },
  dev: { label: 'In development', className: 'status-dev' },
}

const SERVICES = [
  {
    category: 'detect',
    icon: 'upload',
    title: 'Secure code upload',
    status: 'ui',
    text: 'Upload a project as a .zip. It is size-checked, unpacked in an isolated temp folder and deleted after the scan.',
    points: ['Zip-slip protection', 'Source files only', 'Nothing kept after scanning'],
  },
  {
    category: 'detect',
    icon: 'scan',
    title: 'Static analysis with Semgrep',
    status: 'dev',
    text: 'Language-specific Semgrep rule packs find injection, crypto, auth and configuration issues in your code.',
    points: ['Rule ID, file and line', 'Severity for every hit', 'Framework rules (Flask, Express, Spring…)'],
  },
  {
    category: 'detect',
    icon: 'shield',
    title: 'CWE & OWASP mapping',
    status: 'dev',
    text: 'Every finding carries its CWE ID and OWASP Top 10 (2021) category, matching how security teams report.',
    points: ['CWE from rule metadata', 'OWASP Top 10 grouping', 'Standard severity levels'],
  },
  {
    category: 'fix',
    icon: 'sparkles',
    title: 'AI explanation & attack scenario',
    status: 'dev',
    text: 'Gemini explains each finding in plain language and describes how an attacker could actually exploit it.',
    points: ['Plain-language explanation', 'Realistic attack scenario', 'Confidence score'],
  },
  {
    category: 'fix',
    icon: 'code',
    title: 'AI patch generation',
    status: 'dev',
    text: 'A minimal patch is generated for each finding and shown as a side-by-side diff you can review before applying.',
    points: ['Minimal, focused changes', 'Reviewable diff view', 'Only ±20 lines sent to the AI'],
  },
  {
    category: 'verify',
    icon: 'checkCircle',
    title: 'Three-check fix verification',
    status: 'dev',
    text: 'Each patch is re-scanned and compiled. It is marked verified only when all three checks pass.',
    points: ['Finding gone', 'No new issues introduced', 'Syntax still valid'],
  },
  {
    category: 'verify',
    icon: 'filter',
    title: 'Findings & false-positive rules',
    status: 'ui',
    text: 'Filter findings by severity and status, mark false positives, and ignore a path or rule in future scans.',
    points: ['Severity and status filters', 'Mark false positives', 'Reusable ignore rules'],
  },
  {
    category: 'report',
    icon: 'report',
    title: 'PDF security report',
    status: 'ui',
    text: 'A printable report with summary, severity breakdown, fix rates and the stated limitations of the scan.',
    points: ['Executive summary', 'Severity breakdown', 'Export to PDF'],
  },
  {
    category: 'report',
    icon: 'history',
    title: 'Scan history & compare',
    status: 'ui',
    text: 'Compare any two scans of a project to see what was resolved, what is new and what is still open.',
    points: ['Resolved vs new findings', 'Per-project timeline', 'Progress over time'],
  },
  {
    category: 'report',
    icon: 'flask',
    title: 'Evaluation dashboard',
    status: 'ui',
    text: 'Measure detection and fix quality against benchmark projects, with precision and fix-rate charts.',
    points: ['Benchmark runs', 'Fix success rate', 'Results you can cite'],
  },
  {
    category: 'platform',
    icon: 'book',
    title: 'Multi-language support',
    status: 'ui',
    text: 'Python, JavaScript / Node.js, TypeScript, PHP and Java, each with its own rule packs and syntax checker.',
    points: ['5 languages', 'Per-language rule packs', 'Native syntax checks'],
  },
  {
    category: 'platform',
    icon: 'lock',
    title: 'Secure accounts & roles',
    status: 'live',
    text: 'Email verification, strong password policy and role-based access with row-level security in the database.',
    points: ['Verified email required', 'Admin and user roles', 'Supabase row-level security'],
  },
]

const STATUS_HINT = {
  live: 'works today',
  ui: 'screens ready, waiting on the scan backend',
  dev: 'being built',
}

function ServiceItem({ service, open, onToggle }) {
  const status = STATUS[service.status]
  const panelId = `svc-${service.title.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className={`svc ${open ? 'open' : ''}`}>
      <button className="svc-head" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span className="service-icon"><Icon name={service.icon} size={18} /></span>
        <span className="svc-title">
          <strong>{service.title}</strong>
          <span>{service.text}</span>
        </span>
        <span className={`service-status ${status.className}`}>{status.label}</span>
        <Icon name="plus" size={18} className="svc-toggle" />
      </button>
      <div className="svc-body" id={panelId}>
        <div>
          <p>{service.text}</p>
          <ul>
            {service.points.map((p) => (
              <li key={p}><Icon name="check" size={13} strokeWidth={2.6} /> {p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function ServiceGrid() {
  const [category, setCategory] = useState('all')
  const [openTitle, setOpenTitle] = useState(SERVICES[0].title)
  const groups = CATEGORIES.filter((c) => c.id !== 'all' && (category === 'all' || category === c.id))

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
      <ul className="service-legend">
        {Object.entries(STATUS).map(([id, st]) => (
          <li key={id}><span className={`service-status ${st.className}`}>{st.label}</span> {STATUS_HINT[id]}</li>
        ))}
      </ul>
      <div className="svc-groups">
        {groups.map((g) => {
          const items = SERVICES.filter((s) => s.category === g.id)
          return (
            <section key={g.id} className="svc-group">
              <h3 className="svc-group-title">{g.label} <span>{items.length}</span></h3>
              <div className="svc-list">
                {items.map((s) => (
                  <ServiceItem
                    key={s.title}
                    service={s}
                    open={openTitle === s.title}
                    onToggle={() => setOpenTitle((t) => (t === s.title ? null : s.title))}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
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
