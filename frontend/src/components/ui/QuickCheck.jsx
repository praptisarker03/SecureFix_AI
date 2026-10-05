import { useState } from 'react'
import { Icon } from './Icons'
import { SeverityBadge, SeverityCounts } from './Elements'
import { runQuickCheck, SAMPLE_CODE } from '../../lib/quickCheck'

// Paste-and-check demo on the landing page
export function QuickCheck() {
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
