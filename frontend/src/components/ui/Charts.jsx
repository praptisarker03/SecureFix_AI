import { useState } from 'react'
import { SEVERITIES, SEVERITY_LABEL } from '../../lib/constants'

// Plain-SVG charts. Severity colors come from CSS variables (--sev-*), and
// every chart has a legend or direct labels so color is never the only cue.

export function SeverityTrendChart({ scans, height = 240 }) {
  const [hover, setHover] = useState(null)
  const width = 640
  const pad = { top: 16, right: 16, bottom: 28, left: 32 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom
  const max = Math.max(1, ...scans.flatMap((s) => SEVERITIES.map((sev) => s.counts[sev])))
  const niceMax = Math.ceil(max / 4) * 4
  const x = (i) => pad.left + (scans.length === 1 ? innerW / 2 : (i / (scans.length - 1)) * innerW)
  const y = (v) => pad.top + innerH - (v / niceMax) * innerH
  const ticks = [0, niceMax / 4, niceMax / 2, (niceMax * 3) / 4, niceMax]

  return (
    <div className="chart">
      <div className="chart-legend">
        {SEVERITIES.map((s) => (
          <span key={s} className="legend-item">
            <span className={`legend-swatch swatch-${s}`} /> {SEVERITY_LABEL[s]}
          </span>
        ))}
      </div>
      <div className="chart-plot">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Open findings by severity per scan" onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} className={t === 0 ? 'axis-base' : 'grid'} />
              <text x={pad.left - 8} y={y(t) + 4} className="axis-label" textAnchor="end">{t}</text>
            </g>
          ))}
          {scans.map((s, i) => (
            <text key={s.id} x={x(i)} y={height - 8} className="axis-label" textAnchor="middle">
              {new Date(s.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </text>
          ))}
          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + innerH} className="crosshair" />}
          {SEVERITIES.map((sev) => (
            <g key={sev} className={`series series-${sev}`}>
              <polyline fill="none" strokeWidth="2" points={scans.map((s, i) => `${x(i)},${y(s.counts[sev])}`).join(' ')} />
              {scans.map((s, i) => (
                <circle key={s.id} cx={x(i)} cy={y(s.counts[sev])} r={hover === i ? 5 : 3.5} />
              ))}
            </g>
          ))}
          {scans.map((s, i) => (
            <rect
              key={s.id}
              x={x(i) - innerW / Math.max(1, scans.length - 1) / 2}
              y={pad.top}
              width={innerW / Math.max(1, scans.length - 1)}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
        {hover != null && (
          <div className="chart-tooltip" style={{ left: `${(x(hover) / width) * 100}%` }}>
            <strong>{new Date(scans[hover].startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            {SEVERITIES.map((sev) => (
              <div key={sev} className="tooltip-row">
                <span className={`legend-swatch swatch-${sev}`} /> {SEVERITY_LABEL[sev]}
                <b>{scans[hover].counts[sev]}</b>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Horizontal stacked bar: one row, severity segments, direct labels below
export function SeverityBar({ counts }) {
  const total = SEVERITIES.reduce((sum, s) => sum + counts[s], 0) || 1
  return (
    <div className="sev-stack-wrap">
      <div className="sev-stack">
        {SEVERITIES.filter((s) => counts[s] > 0).map((s) => (
          <div key={s} className={`sev-seg swatch-${s}`} style={{ flexGrow: counts[s] }} title={`${SEVERITY_LABEL[s]}: ${counts[s]}`} />
        ))}
      </div>
      <div className="sev-stack-labels">
        {SEVERITIES.map((s) => (
          <span key={s}>
            <span className={`legend-swatch swatch-${s}`} /> {SEVERITY_LABEL[s]} <b>{counts[s]}</b>
            <span className="muted"> ({Math.round((counts[s] / total) * 100)}%)</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// Grouped comparison bars: found / fixed / verified as % of ground truth
export function EvalBars({ rows }) {
  const metrics = [
    { key: 'found', label: 'Found' },
    { key: 'fixed', label: 'Fixed' },
    { key: 'verified', label: 'Verified' },
  ]
  return (
    <div className="chart">
      <div className="chart-legend">
        {metrics.map((m, i) => (
          <span key={m.key} className="legend-item">
            <span className={`legend-swatch swatch-cat-${i + 1}`} /> {m.label} (% of known vulns)
          </span>
        ))}
      </div>
      <div className="eval-bars">
        {rows.map((r) => (
          <div key={r.target} className="eval-row">
            <div className="eval-name">{r.target}</div>
            <div className="eval-group">
              {metrics.map((m, i) => {
                const pct = Math.round((r[m.key] / r.groundTruth) * 100)
                return (
                  <div key={m.key} className="eval-line" title={`${m.label}: ${r[m.key]} / ${r.groundTruth}`}>
                    <div className={`eval-fill swatch-cat-${i + 1}`} style={{ width: `${pct}%` }} />
                    <span className="eval-value">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Donut({ value, label, size = 120 }) {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className="donut" style={{ width: size, height: size }}>
      <svg viewBox="0 0 110 110" role="img" aria-label={`${label}: ${value}%`}>
        <circle cx="55" cy="55" r={r} className="donut-track" />
        <circle cx="55" cy="55" r={r} className="donut-value" strokeDasharray={`${(value / 100) * c} ${c}`} transform="rotate(-90 55 55)" />
      </svg>
      <div className="donut-center">
        <strong>{value}%</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}
