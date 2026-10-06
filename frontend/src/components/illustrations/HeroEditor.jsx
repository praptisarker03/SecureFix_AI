import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icons'

// Landing-page animation: the code is scanned, a finding appears on the
// vulnerable line, the line is patched and then verified.

// [className, text] tokens per line; '' = plain text
const CODE = [
  [['kw', 'import'], ['', ' { Router } '], ['kw', 'from'], ['str', " 'express'"]],
  [['kw', 'import'], ['', ' { db, verify } '], ['kw', 'from'], ['str', " '../lib'"]],
  [],
  [['fn', 'router'], ['', '.post('], ['str', "'/login'"], ['', ', '], ['kw', 'async'], ['', ' (req, res) => {']],
  [['kw', '  const'], ['', ' { email, password } = req.body']],
  [['kw', '  const'], ['', ' user = '], ['kw', 'await'], ['', ' db.'], ['fn', 'query'], ['', '(']],
  null, // the vulnerable / patched line, filled in below
  [['', '  )']],
  [['kw', '  if'], ['', ' (!user || !'], ['kw', 'await'], ['', ' '], ['fn', 'verify'], ['', '(password, user.hash))']],
  [['kw', '    return'], ['', ' res.'], ['fn', 'status'], ['', '('], ['num', '401'], ['', ').'], ['fn', 'end'], ['', '()']],
  [['', '  res.'], ['fn', 'json'], ['', '('], ['fn', 'issueToken'], ['', '(user))']],
  [['', '})']],
]
const VULN_LINE = 6
const VULNERABLE = [['str', '    `SELECT * FROM users WHERE email = \'${email}\'`']]
const PATCHED = [['str', "    'SELECT * FROM users WHERE email = $1'"], ['', ', [email]']]

// One loop = 24 ticks of 400ms
const TICK_MS = 400
const TICKS = 24
const phaseOf = (t) => (t < 6 ? 'scan' : t < 11 ? 'found' : t < 16 ? 'fix' : 'verify')
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const STATUS = {
  scan: { label: 'Scanning · semgrep', tone: 'scan' },
  found: { label: '1 finding', tone: 'bad' },
  fix: { label: 'Patch · gemini', tone: 'brand' },
  verify: { label: 'Re-scanning', tone: 'brand' },
  done: { label: 'Verified', tone: 'good' },
}

function Line({ tokens }) {
  return tokens.map(([cls, text], i) => (
    <span key={i} className={cls ? `tk-${cls}` : undefined}>{text}</span>
  ))
}

export function HeroEditor() {
  const [tick, setTick] = useState(() => (reducedMotion() ? TICKS - 1 : 0))

  useEffect(() => {
    if (reducedMotion()) return
    const t = setInterval(() => setTick((n) => (n + 1) % TICKS), TICK_MS)
    return () => clearInterval(t)
  }, [])

  const phase = phaseOf(tick)
  const checksOn = phase === 'verify' ? Math.min(3, tick - 16) : 0
  const done = checksOn === 3 && tick >= 20
  const status = STATUS[done ? 'done' : phase]
  const patched = phase === 'fix' || phase === 'verify'

  return (
    <div className={`editor phase-${phase} ${done ? 'is-done' : ''}`} aria-label="Illustration: a SQL injection is detected, patched by AI and verified">
      <div className="editor-bar">
        <span className="demo-dots"><i /><i /><i /></span>
        <span className="editor-tab"><Icon name="code" size={13} /> routes/login.ts</span>
        <span className={`editor-status st-${status.tone}`} key={status.label}>
          {status.tone === 'scan' || (phase === 'verify' && !done) ? <span className="editor-spin" /> : <Icon name={done ? 'checkCircle' : status.tone === 'bad' ? 'alert' : 'sparkles'} size={13} />}
          {status.label}
        </span>
      </div>

      <div className="editor-body">
        <div className="editor-clip">
        {phase === 'scan' && <span className="scan-beam" aria-hidden="true" />}
        <ol className="editor-code">
          {CODE.map((tokens, i) => {
            const isVuln = i === VULN_LINE
            const cls = isVuln ? (patched ? 'ln-fixed' : phase === 'found' ? 'ln-vuln' : '') : ''
            return (
              <li key={i} className={cls}>
                <span className="ln-mark">{isVuln && phase !== 'scan' ? (patched ? '+' : '!') : ''}</span>
                <code>{isVuln ? <Line tokens={patched ? PATCHED : VULNERABLE} /> : <Line tokens={tokens} />}</code>
              </li>
            )
          })}
        </ol>
        </div>

        <div className={`finding-pop ${phase === 'found' ? 'show' : ''}`}>
          <div className="fp-head">
            <span className="sev sev-critical"><span className="sev-letter">C</span>Critical</span>
            <span className="fp-rule">CWE-89</span>
          </div>
          <strong>SQL injection</strong>
          <span>User input is concatenated into the query string.</span>
        </div>
      </div>

      <div className="editor-foot">
        {['Finding gone', 'No new issues', 'Syntax valid'].map((c, i) => (
          <span key={c} className={`demo-check ${checksOn > i ? 'on' : ''}`}>
            <span className="tick-box"><Icon name="check" size={11} strokeWidth={3} /></span>
            {c}
          </span>
        ))}
      </div>
    </div>
  )
}
