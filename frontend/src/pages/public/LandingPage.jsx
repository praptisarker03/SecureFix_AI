import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'
import { SeverityBadge } from '../../components/ui/Elements'
import { HeroEditor } from '../../components/illustrations/HeroEditor'
import { QuickCheck } from '../../components/ui/QuickCheck'

const LOOP = [
  { title: 'Upload', text: 'Drop a .zip and pick the language. The archive is unpacked in an isolated temp folder and deleted afterwards.' },
  { title: 'Detect', text: 'Semgrep runs the rule packs for that language. Every hit keeps its rule ID, file, line, CWE and OWASP category.' },
  { title: 'Fix', text: 'Gemini gets the snippet around each finding and returns an explanation, an attack scenario and a minimal patch.' },
  { title: 'Verify', text: 'The patched file is scanned again and compiled. The fix only counts when all three checks pass.' },
]

function BentoFindings() {
  const rows = [
    ['critical', 'SQL injection in user lookup', 'CWE-89'],
    ['high', 'Path traversal in file download', 'CWE-22'],
    ['medium', 'Weak hash for passwords', 'CWE-328'],
  ]
  return (
    <div className="frag frag-list">
      {rows.map(([sev, title, cwe]) => (
        <div key={title} className="frag-row">
          <SeverityBadge severity={sev} compact />
          <span className="frag-title">{title}</span>
          <span className="tag">{cwe}</span>
        </div>
      ))}
    </div>
  )
}

function BentoDiff() {
  return (
    <div className="frag frag-code">
      <div className="dl"><span> </span>def download(name):</div>
      <div className="dl del"><span>-</span>    return send_file(os.path.join(BASE, name))</div>
      <div className="dl add"><span>+</span>    path = safe_join(BASE, name)</div>
      <div className="dl add"><span>+</span>    if path is None: abort(403)</div>
      <div className="dl add"><span>+</span>    return send_file(path)</div>
    </div>
  )
}

function BentoChecks() {
  return (
    <div className="frag frag-checks">
      {[['Finding gone', true], ['No new issues', false], ['Syntax valid', true]].map(([label, ok]) => (
        <div key={label} className={`frag-check ${ok ? 'ok' : 'fail'}`}>
          <Icon name={ok ? 'check' : 'x'} size={14} strokeWidth={3} />
          {label}
          <b>{ok ? 'Pass' : 'Fail'}</b>
        </div>
      ))}
    </div>
  )
}

function BentoCompare() {
  return (
    <div className="frag frag-compare">
      <div><b className="tone-good">−4</b><span>resolved</span></div>
      <div><b className="tone-bad">+1</b><span>new</span></div>
      <div><b>7</b><span>still open</span></div>
    </div>
  )
}

const FEATURES = [
  { id: 'findings', icon: 'bug', title: 'Findings with context', text: 'Severity, file and line, CWE and OWASP category, and the Semgrep rule that matched.', Preview: BentoFindings },
  { id: 'diff', icon: 'sparkles', title: 'The fix as a reviewable diff', text: 'Plus a plain-language explanation and a realistic attack scenario for every finding.', Preview: BentoDiff },
  { id: 'checks', icon: 'checkCircle', title: 'Three separate checks', text: 'A failed check is shown with its reason, so a bad patch never looks like a good one.', Preview: BentoChecks },
  { id: 'compare', icon: 'history', title: 'Scan-to-scan compare', text: 'What was resolved, what is new, what is still open.', Preview: BentoCompare },
]

const EXTRAS = [
  ['report', 'Exportable report', 'Summary, severity breakdown, fix rates and stated limitations, printable as PDF.'],
  ['lock', 'Privacy up front', 'You confirm before upload that snippets go to Gemini. Archives are deleted after the scan.'],
  ['filter', 'False-positive rules', 'Ignore a path or rule ID once and it stays ignored in future scans.'],
]

const ROTATE_MS = 6000

// Feature list on the left, live preview on the right. Advances on its own
// until the visitor picks one.
function FeatureTabs() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => setActive((a) => (a + 1) % FEATURES.length), ROTATE_MS)
    return () => clearTimeout(t)
  }, [active, auto])

  const { Preview, title } = FEATURES[active]

  return (
    <div className="ftabs">
      <div className="ftabs-list" role="tablist">
        {FEATURES.map((f, i) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={active === i}
            className={`ftab ${active === i ? 'active' : ''}`}
            onClick={() => {
              setActive(i)
              setAuto(false)
            }}
          >
            <span className="ftab-icon"><Icon name={f.icon} size={18} /></span>
            <span className="ftab-text">
              <strong>{f.title}</strong>
              <span>{f.text}</span>
            </span>
            {active === i && auto && <span className="ftab-progress" style={{ animationDuration: `${ROTATE_MS}ms` }} />}
          </button>
        ))}
      </div>
      <div className="ftabs-stage" role="tabpanel" aria-label={title}>
        <div className="ftabs-window">
          <div className="ftabs-chrome">
            <span /><span /><span />
            <b>securefix.ai / {FEATURES[active].id}</b>
          </div>
          <div className="ftabs-body" key={active}>
            <Preview />
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  return (
    <>
      <section className="hero hero-home">
        <div className="hero-inner">
          <div className="hero-copy">
            <Reveal as="p" className="hero-kicker hero-pill">
              <span className="live-dot" /> Detect · Fix · Verify, in one loop
            </Reveal>
            <Reveal as="h1" delay={60} className="hero-title">
              Find it. Fix it.<br />
              <span className="prove">
                Prove it.
                <svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M3 13 C 70 4, 150 3, 297 9" />
                </svg>
              </span>
            </Reveal>
            <Reveal as="p" delay={120} className="hero-lead">
              SecureFix AI finds vulnerabilities with Semgrep, drafts the patch with Gemini, then scans the patched code
              again. A fix is only marked verified when the scanner agrees.
            </Reveal>
            <Reveal delay={180} className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg btn-glow">Start for free <Icon name="arrowRight" size={16} /></Link>
              <a href="#try-it" className="btn btn-outline-light btn-lg"><Icon name="code" size={16} /> Try it without signing up</a>
            </Reveal>
            <Reveal delay={240} as="ul" className="hero-meta">
              <li>Python · JavaScript · TypeScript · PHP · Java</li>
              <li>CWE and OWASP Top 10 mapping</li>
            </Reveal>
          </div>
          <Reveal delay={150} className="hero-visual">
            <svg className="hero-ring" viewBox="0 0 600 600" aria-hidden="true">
              <circle cx="300" cy="300" r="280" className="ring-outer" />
              <g className="ring-spin">
                <circle cx="300" cy="300" r="230" className="ring-dash" />
                <circle cx="300" cy="70" r="5" className="ring-node" />
                <circle cx="499" cy="415" r="5" className="ring-node" />
                <circle cx="101" cy="415" r="5" className="ring-node" />
              </g>
            </svg>
            <HeroEditor />
          </Reveal>
        </div>
        <div className="stack-strip">
          <span>Built on</span>
          <b>Semgrep</b><b>Google Gemini</b><b>FastAPI</b><b>Supabase</b><b>React</b>
        </div>
      </section>

      <section className="section section-white" id="loop">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">The loop</p>
            <h2>Four steps from upload to a verified fix</h2>
            <p>Most scanners stop at a list of warnings. SecureFix AI closes the loop and checks its own work.</p>
          </Reveal>
          <ol className="timeline">
            {LOOP.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 110} className="timeline-step">
                <span className="timeline-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section-tint" id="features">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">What you get</p>
            <h2>Everything a finding needs, on one screen</h2>
          </Reveal>
          <Reveal>
            <FeatureTabs />
          </Reveal>
          <div className="extra-features">
            {EXTRAS.map(([icon, t, d], i) => (
              <Reveal key={t} delay={i * 80} className="extra-feature">
                <span className="extra-icon"><Icon name={icon} size={18} /></span>
                <h4>{t}</h4>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-white" id="try-it">
        <div className="section-inner">
          <Reveal className="section-head left try-head">
            <p className="kicker">Try before you sign up</p>
            <h2>Check a snippet right now</h2>
            <p>
              Paste some code and get instant feedback on common vulnerable patterns. It runs in your browser, so nothing
              is uploaded. Sign up for the full Semgrep scan, AI fixes and verification.
            </p>
          </Reveal>
          <Reveal>
            <QuickCheck />
          </Reveal>
          <Reveal className="try-cta" delay={80}>
            <span>Like what you see? A full scan covers whole projects with real static analysis.</span>
            <Link to="/signup" className="btn btn-primary">Create free account <Icon name="arrowRight" size={16} /></Link>
          </Reveal>
        </div>
      </section>

      <section className="section section-dark">
        <div className="section-inner statement">
          <Reveal as="p" className="statement-text">
            An AI patch is a suggestion.<br />
            <span>A clean re-scan is evidence.</span>
          </Reveal>
          <Reveal delay={120} as="p" className="statement-sub">
            That is the whole idea behind SecureFix AI: every generated fix goes through the same scanner that found the bug,
            plus a compile check, before it is marked verified.
          </Reveal>
        </div>
      </section>

      <section className="cta-band">
        <div className="section-inner cta-inner">
          <Reveal as="h2">Scan your first project</Reveal>
          <Reveal as="p" delay={60}>Upload a .zip and get verified fixes, or try a quick check in your browser first.</Reveal>
          <Reveal delay={120} className="hero-actions center">
            <Link to="/signup" className="btn btn-primary btn-lg">Create account</Link>
            <Link to="/how-it-works" className="btn btn-outline-light btn-lg">How it works</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
