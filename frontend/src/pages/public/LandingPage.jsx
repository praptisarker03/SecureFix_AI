import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'
import { SeverityBadge } from '../../components/ui/Elements'
import { HeroEditor } from '../../components/illustrations/HeroEditor'

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
              <Link to="/how-it-works" className="btn btn-outline-light btn-lg">See how it works</Link>
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
          <div className="bento">
            <Reveal className="bento-cell span-2">
              <div className="bento-text">
                <h3>Findings with context</h3>
                <p>Severity, file and line, CWE and OWASP category, and the Semgrep rule that matched.</p>
              </div>
              <BentoFindings />
            </Reveal>
            <Reveal className="bento-cell" delay={80}>
              <div className="bento-text">
                <h3>Scan-to-scan compare</h3>
                <p>What was resolved, what is new, what is still open.</p>
              </div>
              <BentoCompare />
            </Reveal>
            <Reveal className="bento-cell" delay={80}>
              <div className="bento-text">
                <h3>Three separate checks</h3>
                <p>A failed check is shown with its reason, so a bad patch never looks like a good one.</p>
              </div>
              <BentoChecks />
            </Reveal>
            <Reveal className="bento-cell span-2" delay={160}>
              <div className="bento-text">
                <h3>The fix as a reviewable diff</h3>
                <p>Plus a plain-language explanation and a realistic attack scenario for every finding.</p>
              </div>
              <BentoDiff />
            </Reveal>
          </div>
          <div className="plain-features">
            {[
              ['Exportable report', 'Summary, severity breakdown, fix rates and stated limitations, printable as PDF.'],
              ['Privacy up front', 'You confirm before upload that snippets go to Gemini. Archives are deleted after the scan.'],
              ['False-positive rules', 'Ignore a path or rule ID once and it stays ignored in future scans.'],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 80}>
                <h4>{t}</h4>
                <p>{d}</p>
              </Reveal>
            ))}
          </div>
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
          <Reveal as="p" delay={60}>Free for students and individual developers.</Reveal>
          <Reveal delay={120} className="hero-actions center">
            <Link to="/signup" className="btn btn-primary btn-lg">Create account</Link>
            <Link to="/pricing" className="btn btn-outline-light btn-lg">Compare plans</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
