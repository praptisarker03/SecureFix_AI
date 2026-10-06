import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icons'

// Detect -> Fix -> Verify drawn as a ring; the active stage is shown in the centre.
const R = 118
const C = 160
const point = (deg) => {
  const a = (deg * Math.PI) / 180
  return [C + R * Math.sin(a), C - R * Math.cos(a)]
}

const STAGES = [
  {
    id: 'detect',
    label: 'Detect',
    icon: 'scan',
    angle: 0,
    tool: 'semgrep',
    title: 'SQL injection',
    meta: 'routes/login.ts:34',
    tone: 'bad',
    status: 'CWE-89 · critical',
  },
  {
    id: 'fix',
    label: 'Fix',
    icon: 'code',
    angle: 120,
    tool: 'gemini',
    title: 'Patch drafted',
    meta: 'parameterized query',
    tone: 'brand',
    status: '+2 −1 lines',
  },
  {
    id: 'verify',
    label: 'Verify',
    icon: 'shield',
    angle: 240,
    tool: 're-scan',
    title: 'Fix verified',
    meta: 'gone · no new · compiles',
    tone: 'good',
    status: '3 / 3 checks',
  },
]

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function LoopDiagram() {
  // Counts up forever so the pulse always rotates forward (never snaps back)
  const [step, setStep] = useState(() => (reducedMotion() ? 2 : 0))

  useEffect(() => {
    if (reducedMotion()) return
    const t = setInterval(() => setStep((s) => s + 1), 2400)
    return () => clearInterval(t)
  }, [])

  const active = step % STAGES.length
  const stage = STAGES[active]
  const [tx, ty] = point(-55)
  const [hx, hy] = point(0)

  return (
    <div className="loop" role="img" aria-label="The SecureFix loop: detect, fix, verify">
      <svg viewBox="0 0 320 320" className="loop-svg" aria-hidden="true">
        <defs>
          <linearGradient id="loop-trail" x1={tx} y1={ty} x2={hx} y2={hy} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#a99bff" stopOpacity="0" />
            <stop offset="1" stopColor="#a99bff" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={R + 26} className="loop-halo" />
        <circle cx={C} cy={C} r={R} className="loop-track" />
        {[60, 180, 300].map((deg) => {
          const [x, y] = point(deg)
          return <path key={deg} d={`M${x} ${y} l -4 -3 m 4 3 l -4 3`} transform={`rotate(${deg} ${x} ${y})`} className="loop-chevron" />
        })}
        <g className="loop-pulse" style={{ transform: `rotate(${step * 120}deg)` }}>
          <path d={`M${tx} ${ty} A${R} ${R} 0 0 1 ${hx} ${hy}`} stroke="url(#loop-trail)" className="loop-trail" />
          <circle cx={hx} cy={hy} r="4.5" className="loop-head" />
        </g>
      </svg>

      {STAGES.map((s, i) => {
        const [x, y] = point(s.angle)
        return (
          <div
            key={s.id}
            className={`loop-node ${i === active ? 'on' : ''} ${i < active || (step >= STAGES.length && i !== active) ? 'seen' : ''}`}
            style={{ left: `${(x / 320) * 100}%`, top: `${(y / 320) * 100}%` }}
          >
            <span className="loop-node-dot"><Icon name={s.icon} size={18} /></span>
            <span className="loop-node-label">{s.label}</span>
          </div>
        )
      })}

      <div className="loop-core" key={active}>
        <span className="loop-tool">{stage.tool}</span>
        <strong className={`loop-title tone-${stage.tone}`}>{stage.title}</strong>
        <span className="loop-meta">{stage.meta}</span>
        <span className={`loop-status status-${stage.tone}`}>{stage.status}</span>
      </div>
    </div>
  )
}
