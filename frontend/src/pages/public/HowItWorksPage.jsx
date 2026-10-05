import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icons'
import { Reveal } from '../../components/ui/Reveal'
import { Faq } from '../../components/ui/Faq'
import { LANGUAGES } from '../../lib/constants'

const PIPELINE = [
  { title: 'Extract', text: 'The uploaded .zip is size-checked, unpacked into a temporary directory and filtered to source files. Archives with path traversal entries (zip-slip) are rejected.' },
  { title: 'Semgrep scan', text: 'Semgrep runs with the rule packs for the selected language and returns JSON: rule ID, file, line range, message, CWE and OWASP metadata.' },
  { title: 'AI analysis', text: 'For each finding, the vulnerable snippet plus surrounding context is sent to Gemini with a structured prompt asking for an explanation, an attack scenario, a patch and a confidence score.' },
  { title: 'Verification', text: 'The patch is applied to a copy of the file, which is re-scanned with the same rules and syntax-checked. Results are saved next to the original finding.' },
]

const CHECKS = [
  { title: 'Finding gone', text: 'The same Semgrep rule no longer matches at the patched location. This shows the specific issue was addressed.' },
  { title: 'No new issues', text: 'A re-scan of the patched file reports no findings that were not there before. This catches fixes that trade one bug for another.' },
  { title: 'Syntax valid', text: 'The patched file still parses or compiles, using the language’s own checker.' },
]

const FAQ = [
  ['Is my code stored?', 'No. The upload is extracted to a temporary folder and deleted when the scan ends. Only findings, the snippet around each finding and the generated patches are saved to your account.'],
  ['What is sent to Gemini?', 'Only the lines around each finding (about ±20 lines) plus the rule message. Whole files and the full repository are never sent. You confirm this on the upload screen.'],
  ['Does "verified" mean the code is secure?', 'No. It means the three automated checks passed for that finding. Static analysis cannot prove the absence of vulnerabilities, and business-logic bugs are out of scope.'],
  ['Why would a fix fail verification?', 'The AI may patch the wrong line, introduce a new pattern Semgrep flags, or produce code that does not compile. Failed fixes are shown with the reason so you can retry or edit them.'],
  ['Can I mark false positives?', 'Not yet. Marking false positives and ignoring paths or rules is planned for a later version.'],
]

export function HowItWorksPage() {
  return (
    <>
      <section className="hero hero-compact">
        <div className="hero-inner single">
          <Reveal as="p" className="hero-kicker">Documentation</Reveal>
          <Reveal as="h1" delay={60}>How SecureFix AI works</Reveal>
          <Reveal as="p" delay={120} className="hero-lead">The workflow, supported languages and the logic behind a “verified” fix.</Reveal>
          <Reveal delay={180} as="nav" className="doc-toc">
            {[['#pipeline', 'Workflow'], ['#languages', 'Languages'], ['#verification', 'Verification'], ['#standards', 'Standards'], ['#privacy', 'Privacy'], ['#faq', 'FAQ']].map(([href, label]) => (
              <a key={href} href={href}>{label}</a>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section-white" id="pipeline">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">Workflow</p>
            <h2>The scan pipeline</h2>
            <p>Each scan runs these four stages in order. The progress page shows which one is running.</p>
          </Reveal>
          <ol className="timeline">
            {PIPELINE.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 110} className="timeline-step">
                <span className="timeline-n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="arch" delay={100}>
            {['React UI', 'FastAPI', 'Semgrep', 'Gemini API', 'Supabase Postgres'].map((n, i, arr) => (
              <span key={n} className="arch-node">
                {n}
                {i < arr.length - 1 && <Icon name="arrowRight" size={14} />}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" id="languages">
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

      <section className="section section-white" id="verification">
        <div className="section-inner">
          <Reveal className="section-head left">
            <p className="kicker">Methodology</p>
            <h2>Verification logic</h2>
            <p>A fix is marked <b>verified</b> only when all three checks pass. Any failed check marks it <b>failed</b> and shows why.</p>
          </Reveal>
          <div className="check-cards">
            {CHECKS.map((c, i) => (
              <Reveal key={c.title} delay={i * 100} className="check-card">
                <span className="check-n">Check {i + 1}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </Reveal>
            ))}
          </div>
          <Reveal className="formula" delay={120}>
            <code>verified = finding_gone ∧ no_new_issues ∧ syntax_valid</code>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" id="standards">
        <div className="section-inner two-col">
          <Reveal>
            <p className="kicker">Standards</p>
            <h2>CWE and OWASP mapping</h2>
            <p>Findings carry the CWE ID from the Semgrep rule metadata and are grouped under the OWASP Top 10 (2021) category, so results line up with how security teams already report.</p>
          </Reveal>
          <Reveal className="owasp-list" delay={100}>
            {['A01 Broken Access Control', 'A02 Cryptographic Failures', 'A03 Injection', 'A05 Security Misconfiguration', 'A07 Identification & Auth Failures', 'A10 Server-Side Request Forgery'].map((o) => (
              <span key={o}>{o}</span>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section-white" id="privacy">
        <div className="section-inner">
          <Reveal className="privacy-box">
            <Icon name="lock" size={22} />
            <div>
              <h3>Privacy</h3>
              <p>Code snippets around each finding are sent to Google Gemini to generate explanations and fixes. Do not upload code you are not allowed to share with a third-party AI service. Uploaded archives are deleted after scanning.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint" id="faq">
        <div className="section-inner narrow">
          <Reveal className="section-head">
            <h2>Frequently asked questions</h2>
          </Reveal>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="cta-band">
        <div className="section-inner cta-inner">
          <Reveal as="h2">Ready to try it?</Reveal>
          <Reveal delay={80} className="hero-actions center">
            <Link to="/signup" className="btn btn-primary btn-lg">Create free account</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
