import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Icons'
import { Faq } from '../../components/ui/Faq'
import { Reveal } from '../../components/ui/Reveal'

const PLANS = [
  {
    name: 'Student',
    price: { monthly: 0, yearly: 0 },
    tagline: 'For coursework, CTFs and personal projects.',
    cta: 'Start free',
    to: '/signup',
    features: ['5 projects', '20 scans / month', '200 AI fixes / month', 'Verification on every fix', 'PDF report export'],
  },
  {
    name: 'Team',
    price: { monthly: 19, yearly: 15 },
    per: 'per developer / month',
    tagline: 'For small teams shipping to production.',
    cta: 'Start 14-day trial',
    to: '/signup',
    popular: true,
    features: ['Unlimited projects', '500 scans / month', '5,000 AI fixes / month', 'GitHub integration', 'Scan history & compare', 'Shared false-positive rules'],
  },
  {
    name: 'Research',
    price: null,
    tagline: 'For labs and universities running evaluations.',
    cta: 'Contact us',
    to: '/how-it-works#faq',
    features: ['Everything in Team', 'Benchmark evaluation runs', 'Raw JSON export for analysis', 'Custom Semgrep rule packs', 'Self-hosted deployment guide'],
  },
]

const COMPARE = [
  ['Projects', '5', 'Unlimited', 'Unlimited'],
  ['Scans per month', '20', '500', 'Custom'],
  ['AI fixes per month', '200', '5,000', 'Custom'],
  ['Languages', 'All 5', 'All 5', 'All 5 + custom rules'],
  ['Three-check verification', true, true, true],
  ['PDF security report', true, true, true],
  ['Scan history & compare', false, true, true],
  ['GitHub integration', false, true, true],
  ['Evaluation dashboard', false, false, true],
  ['Support', 'Community', 'Email', 'Priority'],
]

const FAQ = [
  ['What counts as a scan?', 'One upload analysed end to end: extract, Semgrep, AI analysis and verification. Re-running verification on a single fix does not count as a new scan.'],
  ['What counts as an AI fix?', 'One Gemini request that returns an explanation and patch for a finding. Findings you mark as false positives before analysis do not use fixes.'],
  ['Can I switch plans later?', 'Yes. Upgrades apply immediately; downgrades apply at the next billing period.'],
  ['Is there a student discount on Team?', 'The Student plan is free. If you need Team features for a group project, contact us with your university email.'],
]

function Cell({ v }) {
  if (v === true) return <Icon name="check" size={18} className="yes" strokeWidth={2.4} />
  if (v === false) return <span className="no">—</span>
  return <span>{v}</span>
}

export function PricingPage() {
  const [billing, setBilling] = useState('yearly')

  return (
    <>
      <section className="hero hero-pricing">
        <div className="hero-inner single">
          <Reveal as="p" className="hero-kicker">Pricing</Reveal>
          <Reveal as="h1" delay={60}>Security that scales with how you build</Reveal>
          <Reveal as="p" delay={120} className="hero-lead">Free for students. Flat per-developer pricing for teams. Custom plans for research.</Reveal>
          <Reveal delay={180}>
            <div className={`billing-toggle is-${billing}`} role="tablist">
              <span className="billing-thumb" aria-hidden="true" />
              {['monthly', 'yearly'].map((b) => (
                <button key={b} role="tab" aria-selected={billing === b} className={billing === b ? 'active' : ''} onClick={() => setBilling(b)}>
                  {b === 'monthly' ? 'Monthly' : 'Yearly'}
                  {b === 'yearly' && <span className="save">−20%</span>}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
        <div className="plans">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={200 + i * 90} className={`plan ${p.popular ? 'plan-popular' : ''}`}>
              <div className="plan-head">
                <h3>{p.name}</h3>
                {p.popular && <span className="plan-flag">Most popular</span>}
              </div>
              <p className="plan-tagline">{p.tagline}</p>
              <div className="plan-price">
                {p.price ? (
                  <>
                    <b key={billing} className="price-num">${p.price[billing]}</b>
                    <span>{p.per || '/ month'}</span>
                  </>
                ) : (
                  <b className="plan-custom">Custom</b>
                )}
              </div>
              <Link to={p.to} className={`btn btn-block ${p.popular ? 'btn-primary' : 'btn-outline'}`}>{p.cta}</Link>
              <ul className="plan-features">
                {p.features.map((f) => (
                  <li key={f}><Icon name="check" size={16} strokeWidth={2.4} /> {f}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section section-white">
        <div className="section-inner">
          <Reveal className="section-head">
            <h2>Compare plans</h2>
          </Reveal>
          <Reveal className="table-wrap boxed">
            <table className="table compare-table">
              <thead>
                <tr><th /><th>Student</th><th className="hl">Team</th><th>Research</th></tr>
              </thead>
              <tbody>
                {COMPARE.map(([label, ...vals]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={i === 1 ? 'hl' : ''}><Cell v={v} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      <section className="section section-tint">
        <div className="section-inner narrow">
          <Reveal className="section-head">
            <h2>Frequently asked questions</h2>
          </Reveal>
          <Faq items={FAQ} />
        </div>
      </section>

      <section className="cta-band">
        <div className="section-inner cta-inner">
          <Reveal as="h2">Start with the free plan</Reveal>
          <Reveal delay={80} className="hero-actions center">
            <Link to="/signup" className="btn btn-primary btn-lg">Sign up free</Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
